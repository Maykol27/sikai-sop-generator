import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Authenticate User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // 2. Proceso de cobro con Bold para todos los usuarios
    // Bold procesará el pago en COP y hará la conversión automática para tarjetas internacionales.
    const BOLD_API_KEY = process.env.BOLD_API_KEY
    if (!BOLD_API_KEY) {
      throw new Error("La API Key de Bold no está configurada")
    }

    const payload = {
      name: 'SIKAI Starter',
      description: '10 Créditos para Generación de SIKAI SOPs',
      amount: {
        currency: "COP",
        totalAmount: 60000 
      },
      hasTaxes: false,
      singleUse: true,
      expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }

    const response = await fetch('https://payments.api.bold.co/v2/payment-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `apiKey ${BOLD_API_KEY}`
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.message || "Error al generar link en Bold")

    return NextResponse.json({ paymentUrl: data.payload.url })

  } catch (error: any) {
    console.error("Payment Integration Error:", error)
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 })
  }
}
