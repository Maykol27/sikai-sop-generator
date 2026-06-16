/**
 * Helper para invocar la Edge Function `send-email` de Supabase.
 * Usa el mismo alias Gmail corporativo que SIKAI Finance:
 *   notificaciones@sikaiconsulting.com
 *
 * Llamar desde API Routes de Next.js (server-side), nunca desde el cliente.
 */

type EmailType =
  | 'credits_welcome'
  | 'credits_pending'
  | 'credits_added'
  | 'sop_generated'
  | 'newsletter'

interface SendEmailOptions {
  type: EmailType
  to: string
  name?: string
  data?: Record<string, any>
}

export async function sendNotificationEmail(options: SendEmailOptions): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    console.error('❌ sendNotificationEmail: NEXT_PUBLIC_SUPABASE_URL no definida')
    return
  }

  const emailFnUrl = `${supabaseUrl}/functions/v1/send-email`

  try {
    const res = await fetch(emailFnUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify(options),
    })

    if (res.ok) {
      console.log(`✅ Email [${options.type}] enviado a ${options.to}`)
    } else {
      const err = await res.text()
      console.error(`❌ Error enviando email [${options.type}]:`, err)
    }
  } catch (err: any) {
    // No-throw: el fallo de email nunca debe bloquear la operación principal
    console.error('❌ sendNotificationEmail falló (no bloqueante):', err.message)
  }
}
