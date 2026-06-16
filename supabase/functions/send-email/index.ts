import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── Tipos de email soportados ──────────────────────────────────────────────────
type EmailType =
  | 'credits_welcome'      // Usuario compra créditos y son cargados
  | 'credits_pending'      // Usuario notificó pago — pendiente de verificación
  | 'credits_added'        // Admin verificó y cargó los créditos manualmente
  | 'sop_generated'        // SOP generado exitosamente
  | 'newsletter'           // Comunicación general

interface EmailPayload {
  type: EmailType
  to: string
  name?: string
  data?: Record<string, any>
}

// ── Template base con branding SIKAI SOP Generator ────────────────────────────
const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#16181d;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#16181d;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1f1f21;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a88ff,#26d8c4);padding:36px 40px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;letter-spacing:-0.5px;">SIKAI SOP Generator</h1>
            <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Automatiza tus Procesos con IA</p>
          </td>
        </tr>
        <!-- Contenido -->
        <tr>
          <td style="padding:40px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.08);text-align:center;">
            <p style="color:#6c757d;font-size:12px;margin:0;">© 2025 SIKAI CX · sikaiconsulting.com</p>
            <p style="color:#6c757d;font-size:12px;margin:8px 0 0;">
              Recibiste este correo porque tienes una cuenta en SIKAI SOP Generator.<br>
              ¿Dudas? Escríbenos a <a href="mailto:soporte@sikaiconsulting.com" style="color:#1a88ff;text-decoration:none;">soporte@sikaiconsulting.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`

function getTemplate(
  type: EmailType,
  name: string,
  data: Record<string, any>
): { subject: string; html: string } {
  const firstName = name?.split(' ')[0] || 'Usuario'

  const packageColors: Record<string, string> = {
    'SIKAI Starter': '#1a88ff',
    'SIKAI Pro':     '#26d8c4',
    'SIKAI Escala':  '#a855f7',
  }
  const pkgColor = packageColors[data.package_name] || '#1a88ff'

  switch (type) {
    // ── Créditos cargados exitosamente ───────────────────────────────────────
    case 'credits_added':
      return {
        subject: `✅ ¡Tus créditos SIKAI han sido cargados!`,
        html: baseTemplate(`
          <h2 style="color:#ffffff;font-size:24px;margin:0 0 16px;font-weight:600;">¡Créditos cargados, ${firstName}! 🎉</h2>
          <p style="color:#b0b0b0;font-size:15px;line-height:1.6;margin:0 0 24px;">
            Hemos verificado tu pago y cargado tus créditos SIKAI exitosamente. Ya puedes usarlos para generar tus SOPs con Inteligencia Artificial.
          </p>
          <div style="background:rgba(26,136,255,0.1);border:1px solid rgba(26,136,255,0.3);border-radius:12px;padding:20px;margin:0 0 28px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="color:#6c757d;font-size:14px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">Paquete</td>
                <td style="color:${pkgColor};font-size:14px;font-weight:700;text-align:right;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">${data.package_name || 'SIKAI Pro'}</td>
              </tr>
              <tr>
                <td style="color:#6c757d;font-size:14px;padding:8px 0;">Créditos añadidos</td>
                <td style="color:#26d8c4;font-size:20px;font-weight:700;text-align:right;padding:8px 0;">+${data.credits || 10} créditos</td>
              </tr>
            </table>
          </div>
          <p style="color:#b0b0b0;font-size:14px;line-height:1.6;margin:0 0 28px;">
            Cada crédito te permite generar un SOP completo con diagrama de flujo (SIKAI Flow) y recomendaciones de optimización (SIKAI Boost).
          </p>
          <a href="https://sop.sikaiconsulting.com/dashboard"
             style="display:inline-block;background:linear-gradient(135deg,#1a88ff,#26d8c4);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">
            Generar mi primer SOP →
          </a>
        `),
      }

    // ── Pago notificado — en revisión ────────────────────────────────────────
    case 'credits_pending':
      return {
        subject: `⏳ Pago recibido — verificando tus créditos SIKAI`,
        html: baseTemplate(`
          <h2 style="color:#ffffff;font-size:24px;margin:0 0 16px;font-weight:600;">¡Pago recibido, ${firstName}! ⏳</h2>
          <p style="color:#b0b0b0;font-size:15px;line-height:1.6;margin:0 0 24px;">
            Hemos recibido tu notificación de pago. Nuestro equipo está verificando la transacción en Bold y cargará tus créditos en las próximas horas.
          </p>
          <div style="background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.25);border-radius:12px;padding:20px;margin:0 0 28px;">
            <p style="color:#fbbf24;font-size:14px;margin:0;">
              ⚠️ <strong>Paquete solicitado:</strong> ${data.package_name || 'SIKAI Pro'} — ${data.credits || 10} créditos<br><br>
              Una vez verificado el pago, recibirás otro correo de confirmación con los créditos ya cargados.
            </p>
          </div>
          <p style="color:#b0b0b0;font-size:14px;line-height:1.6;margin:0 0 28px;">
            ¿Tienes alguna duda? Responde este correo o escríbenos directamente.
          </p>
          <a href="https://sop.sikaiconsulting.com/dashboard"
             style="display:inline-block;background:linear-gradient(135deg,#1a88ff,#26d8c4);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">
            Ir al Dashboard →
          </a>
        `),
      }

    // ── SOP generado exitosamente ────────────────────────────────────────────
    case 'sop_generated':
      return {
        subject: `📋 Tu SOP "${data.sop_title || 'Nuevo SOP'}" ha sido generado`,
        html: baseTemplate(`
          <h2 style="color:#ffffff;font-size:24px;margin:0 0 16px;font-weight:600;">¡Tu SOP está listo, ${firstName}! 📋</h2>
          <p style="color:#b0b0b0;font-size:15px;line-height:1.6;margin:0 0 24px;">
            SIKAI ha generado tu Procedimiento Operativo Estándar con éxito. Ya está disponible en tu dashboard para editarlo, exportarlo o compartirlo.
          </p>
          <div style="background:rgba(26,136,255,0.08);border:1px solid rgba(26,136,255,0.2);border-radius:12px;padding:20px;margin:0 0 28px;">
            <p style="color:#1a88ff;font-weight:600;font-size:13px;letter-spacing:0.5px;margin:0 0 12px;">RESUMEN DEL SOP GENERADO</p>
            <p style="color:#ffffff;font-size:18px;font-weight:700;margin:0 0 8px;">${data.sop_title || 'SOP sin título'}</p>
            <p style="color:#b0b0b0;font-size:13px;margin:0;">
              ✅ Procedimiento estructurado · ✅ Diagrama SIKAI Flow · ✅ Recomendaciones SIKAI Boost
            </p>
          </div>
          <p style="color:#6c757d;font-size:13px;margin:0 0 28px;">
            Créditos restantes: <strong style="color:#26d8c4;">${data.credits_remaining ?? '—'}</strong>
          </p>
          <a href="https://sop.sikaiconsulting.com/dashboard"
             style="display:inline-block;background:linear-gradient(135deg,#1a88ff,#26d8c4);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">
            Ver mi SOP →
          </a>
        `),
      }

    // ── Newsletter / comunicación general ────────────────────────────────────
    case 'newsletter':
      return {
        subject: data.subject || 'Novedades de SIKAI SOP Generator',
        html: baseTemplate(`
          <h2 style="color:#ffffff;font-size:24px;margin:0 0 16px;font-weight:600;">${data.title || 'Novedades de SIKAI SOP Generator'}</h2>
          <div style="color:#b0b0b0;font-size:15px;line-height:1.7;">${data.body || ''}</div>
          ${data.cta_url ? `
          <div style="margin-top:28px;">
            <a href="${data.cta_url}"
               style="display:inline-block;background:linear-gradient(135deg,#1a88ff,#26d8c4);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">
              ${data.cta_text || 'Ver más →'}
            </a>
          </div>` : ''}
        `),
      }

    // ── Bienvenida tras registro (también para créditos automáticos) ──────────
    case 'credits_welcome':
      return {
        subject: `🎉 ¡Bienvenido/a a SIKAI SOP Generator, ${firstName}!`,
        html: baseTemplate(`
          <h2 style="color:#ffffff;font-size:24px;margin:0 0 16px;font-weight:600;">¡Bienvenido/a, ${firstName}! 🚀</h2>
          <p style="color:#b0b0b0;font-size:15px;line-height:1.6;margin:0 0 24px;">
            Tu cuenta en SIKAI SOP Generator está lista. Comienza a documentar tus procesos empresariales con el poder de la Inteligencia Artificial.
          </p>
          <div style="background:rgba(38,216,196,0.08);border:1px solid rgba(38,216,196,0.25);border-radius:12px;padding:20px;margin:0 0 28px;">
            <p style="color:#26d8c4;font-weight:600;margin:0 0 12px;font-size:14px;">✅ LO QUE PUEDES HACER CON SIKAI</p>
            <ul style="color:#b0b0b0;font-size:14px;line-height:1.8;margin:0;padding-left:20px;">
              <li>🎙️ <strong>SIKAI Voice Agent:</strong> Describe tu proceso por voz y la IA lo estructura</li>
              <li>📋 <strong>SOP Completo:</strong> Procedimiento estructurado con pasos y responsables</li>
              <li>🔀 <strong>SIKAI Flow:</strong> Diagrama de flujo automático editable</li>
              <li>⚡ <strong>SIKAI Boost:</strong> Recomendaciones de optimización con IA</li>
              <li>📄 <strong>Exportación PDF:</strong> Descarga tu SOP profesional listo para imprimir</li>
            </ul>
          </div>
          <a href="https://sop.sikaiconsulting.com/dashboard"
             style="display:inline-block;background:linear-gradient(135deg,#1a88ff,#26d8c4);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">
            Comenzar ahora →
          </a>
        `),
      }

    default:
      throw new Error(`Tipo de email no soportado: ${type}`)
  }
}

// ── Envío via Gmail SMTP con App Password (mismo alias que SIKAI Finance) ──────

async function sendEmail(to: string, subject: string, html: string) {
  const gmailUser        = Deno.env.get('GMAIL_USER') ?? ''
  const gmailAppPassword = Deno.env.get('GMAIL_APP_PASSWORD') ?? ''
  const fromAlias        = 'notificaciones@sikaiconsulting.com'

  const client = new SMTPClient({
    connection: {
      hostname: 'smtp.gmail.com',
      port: 465,
      tls: true,
      auth: {
        username: gmailUser,
        password: gmailAppPassword,
      },
    },
  })

  await client.send({
    from: `SIKAI SOP Generator <${fromAlias}>`,
    to: to,
    subject: subject,
    html: html,
  })

  await client.close()
}

// ── Handler principal ──────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: EmailPayload = await req.json()
    const { type, to, name = '', data = {} } = payload

    if (!type || !to) {
      return new Response(
        JSON.stringify({ error: 'Los campos "type" y "to" son requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { subject, html } = getTemplate(type, name, data)
    await sendEmail(to, subject, html)

    console.log(`✅ Email [${type}] enviado a ${to}`)
    return new Response(
      JSON.stringify({ success: true, type, to }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('❌ Error send-email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
