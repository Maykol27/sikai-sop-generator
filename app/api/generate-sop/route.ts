import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash',
  systemInstruction: `Eres SIKAI SOP Generator AI, un experto analista de procesos y creador de Procedimientos Operativos Estándar (SOPs).
Tu objetivo es analizar la entrada del usuario y generar una salida en formato JSON con tres campos exactos:
1. "sop": Un documento SOP detallado en formato Markdown. Debe incluir Título, Objetivo, Roles y el Paso a Paso bien estructurado. Usa un tono corporativo, claro y conciso.
2. "flow": Código Mermaid.js de un diagrama de flujo (graph LR) que represente los pasos del proceso. Usa sintaxis válida de Mermaid. No incluyas backticks ni "mermaid" alrededor del código, solo el código raw de Mermaid.
   CRÍTICO PARA MERMAID: Todos los textos/etiquetas de los nodos DEBEN estar envueltos en comillas dobles obligatoriamente, por ejemplo: A["Paso 1: Confirmación (Detalles)"] o B["Herramienta: Stripe"]. NUNCA dejes textos sin comillas dentro de los corchetes, paréntesis o llaves (ej. A[Paso 1] es incorrecto; A["Paso 1"] es correcto), ya que acentos, paréntesis o dos puntos rompen la sintaxis en Mermaid v11.
3. "boost": Una estrategia de mejora (SIKAI Boost) en formato Markdown. Basado en los cuellos de botella provistos o tu propia experiencia, sugiere 2-3 mejoras operativas para optimizar el proceso.

IMPORTANTE: 
- Debes devolver ÚNICAMENTE un objeto JSON válido, sin formato markdown extra alrededor. 
- Evita alucinaciones: cíñete estrictamente a la información provista por el usuario. Si la información es breve, expándela lógicamente pero sin inventar pasos irreales.
- Estructura JSON esperada:
{
  "sop": "# Título...",
  "flow": "graph LR\nA[\"Inicio\"] --> B[\"Paso 1: Confirmación\"]\n...",
  "boost": "## Estrategia de Mejora..."
}
` 
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Authenticate User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // 2. Check Credits
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.credits < 1) {
      return NextResponse.json({ error: 'Créditos insuficientes. Recarga tu cuenta para continuar.' }, { status: 403 })
    }

    // 3. Parse Request
    const body = await req.json()
    let prompt = ''

    if (body.mode === 'voice') {
      prompt = `Por favor genera el SIKAI SOP basado en la siguiente explicación dictada por el usuario:\n\n"${body.voiceText}"`
    } else {
      prompt = `Por favor genera el SIKAI SOP basado en los siguientes datos estructurados:
Título: ${body.title}
Objetivo: ${body.objective}
Roles: ${body.roles}
Herramientas: ${body.tools}
Cuellos de botella reportados: ${body.bottlenecks}
Pasos descritos:
${body.steps.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n')}
`
    }

    // 4. Call Gemini
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    })
    
    const responseText = result.response.text()
    let generatedData
    try {
      generatedData = JSON.parse(responseText)
    } catch (e) {
      console.error("Failed to parse JSON from Gemini:", responseText)
      throw new Error("El modelo generó una respuesta inválida. Por favor, intenta de nuevo.")
    }

    // 5. Decrement Credit
    const { error: decrementError } = await supabase.rpc('decrement_credits', { 
      user_id: user.id, 
      amount: 1 
    })
    
    // Fallback if RPC doesn't exist (e.g. if the user didn't create it, we do it via update, but beware of race conditions)
    if (decrementError) {
      await supabase
        .from('profiles')
        .update({ credits: profile.credits - 1 })
        .eq('id', user.id)
    }

    // 6. Save SOP to Database
    const { data: sop, error: sopError } = await supabase
      .from('sops')
      .insert({
        user_id: user.id,
        title: body.title || 'SIKAI SOP Generado por Voz',
        markdown_content: generatedData.sop,
        mermaid_code: generatedData.flow,
        boost_strategy: generatedData.boost
      })
      .select('id')
      .single()

    if (sopError) {
      throw new Error("Error al guardar el SOP en la base de datos.")
    }

    // 7. Return Result
    return NextResponse.json({ sopId: sop.id })

  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 })
  }
}
