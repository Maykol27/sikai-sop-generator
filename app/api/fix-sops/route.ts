import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sanitizeMermaidCode, deduplicateText } from '@/utils/cleaners'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Authenticate User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ 
        error: 'No autorizado. Por favor inicia sesión primero en la aplicación y luego visita esta URL en la misma pestaña.' 
      }, { status: 401 })
    }

    // 2. Fetch User's SOPs
    const { data: sops, error: fetchError } = await supabase
      .from('sops')
      .select('*')
      .eq('user_id', user.id)

    if (fetchError) {
      throw new Error(`Error al obtener los SOPs de Supabase: ${fetchError.message}`)
    }

    if (!sops || sops.length === 0) {
      return NextResponse.json({ 
        success: true,
        message: 'No se encontraron SOPs en tu cuenta para reparar.', 
        totalSopsProcessed: 0,
        updatedSops: [] 
      })
    }

    // 3. Process and sanitize each SOP
    const updatedSops = []
    for (const sop of sops) {
      const originalFlow = sop.mermaid_code || ''
      const originalBoost = sop.boost_strategy || ''
      const originalSopText = sop.markdown_content || ''

      const cleanFlow = sanitizeMermaidCode(originalFlow)
      const cleanBoost = deduplicateText(originalBoost)
      const cleanSopText = deduplicateText(originalSopText)

      // Check if any fields actually changed
      const flowChanged = cleanFlow !== originalFlow
      const boostChanged = cleanBoost !== originalBoost
      const sopChanged = cleanSopText !== originalSopText

      if (flowChanged || boostChanged || sopChanged) {
        const { error: updateError } = await supabase
          .from('sops')
          .update({
            mermaid_code: cleanFlow,
            boost_strategy: cleanBoost,
            markdown_content: cleanSopText
          })
          .eq('id', sop.id)

        if (updateError) {
          console.error(`[Fix SOPs] Error al actualizar SOP ID ${sop.id}:`, updateError)
          updatedSops.push({
            id: sop.id,
            title: sop.title,
            status: 'failed',
            error: updateError.message
          })
        } else {
          updatedSops.push({
            id: sop.id,
            title: sop.title,
            status: 'updated',
            changes: {
              flowChanged,
              boostChanged,
              sopChanged
            }
          })
        }
      } else {
        updatedSops.push({
          id: sop.id,
          title: sop.title,
          status: 'already_clean'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: '¡Tus SOPs preexistentes han sido limpiados y reparados con éxito!',
      totalSopsProcessed: sops.length,
      updatedSops
    })

  } catch (error: any) {
    console.error("[Fix SOPs API] Error:", error)
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 })
  }
}
