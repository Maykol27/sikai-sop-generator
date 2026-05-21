import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Get current logged-in user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return new NextResponse(
        `<html>
          <head>
            <title>No Autorizado - SIKAI SOP</title>
            <style>
              body { background-color: #09101d; color: #e0e6ed; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
              .card { background: rgba(22, 24, 29, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); padding: 2rem; border-radius: 1.5rem; text-align: center; max-width: 400px; box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3); }
              h1 { color: #1a88ff; margin-bottom: 1rem; }
              a { color: #26d8c4; text-decoration: none; font-weight: bold; }
              a:hover { text-decoration: underline; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>No Autorizado</h1>
              <p>Debes iniciar sesión en la aplicación antes de poder cargar los créditos de prueba.</p>
              <p><a href="/login">Ir a Iniciar Sesión</a></p>
            </div>
          </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      )
    }

    // 2. Update their own profile to have 10 credits
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: 10 })
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // 3. Redirect back to dashboard with a query param to show a nice notification or just load
    return NextResponse.redirect(new URL('/dashboard?credits_added=true', req.url))

  } catch (error: any) {
    console.error("Error setting credits:", error)
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 })
  }
}
