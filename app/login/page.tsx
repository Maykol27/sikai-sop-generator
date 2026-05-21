"use client";

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [age, setAge] = useState("");
    const [acceptTerms, setAcceptTerms] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    
    // MFA state
    const [isMfaRequired, setIsMfaRequired] = useState(false);
    const [mfaCode, setMfaCode] = useState("");
    const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
    const [mfaChallengeId, setMfaChallengeId] = useState<string | null>(null);

    const [msg, setMsg] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

    const router = useRouter();
    const supabase = createClient();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMsg(null);

        try {
            if (isRegistering) {
                if (!fullName || !age || !acceptTerms) {
                    setMsg({ text: "Debes proporcionar tu nombre, edad y aceptar la política de privacidad.", type: 'error' });
                    setLoading(false);
                    return;
                }

                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                        data: {
                            full_name: fullName,
                            age: age,
                            terms_accepted: acceptTerms,
                            avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${email}`
                        }
                    }
                });

                if (error) throw error;

                setMsg({ text: "¡Cuenta creada! Revisa tu email para confirmarla o inicia sesión.", type: 'success' });
                setIsRegistering(false);
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;

                const { data: { user } } = await supabase.auth.getUser();
                const factors = (user?.factors as any[]) || [];
                const hasVerifiedFactors = factors.some((f) => f.status === 'verified');
                
                if (hasVerifiedFactors) {
                    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
                    if (aal?.currentLevel === 'aal1' && aal?.nextLevel === 'aal2') {
                        const totpFactor = factors.find(f => f.status === 'verified' && f.factor_type === 'totp');
                        if (totpFactor) {
                            setIsMfaRequired(true);
                            setMfaFactorId(totpFactor.id);
                            const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
                            if (challengeErr) throw challengeErr;
                            setMfaChallengeId(challenge.id);
                            setLoading(false);
                            return;
                        }
                    }
                }

                router.push("/dashboard");
                router.refresh();
            }
        } catch (error: any) {
            setMsg({ text: error.message || "Ocurrió un error", type: 'error' });
            setLoading(false);
        }
    };

    const handleMfaVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mfaFactorId || !mfaChallengeId) {
            setMsg({ text: "Error en sesión 2FA. Inicia sesión nuevamente.", type: 'error' });
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.mfa.verify({
                factorId: mfaFactorId,
                challengeId: mfaChallengeId,
                code: mfaCode,
            });
            if (error) throw error;
            router.push("/dashboard");
            router.refresh();
        } catch (error: any) {
            setMsg({ text: error.message || "Código incorrecto", type: 'error' });
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMsg(null);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password`,
        });
        if (error) {
            setMsg({ type: 'error', text: error.message || "Error al enviar el enlace" });
        } else {
            setMsg({ type: 'success', text: "Te enviamos un enlace para restablecer tu contraseña." });
            setIsForgotPassword(false);
        }
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) {
            setMsg({ text: error.message || "Error al conectar con Google", type: 'error' });
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#09101d] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background blobs - SIKAI Finance Nebula Effect */}
            <div className="absolute bg-blob bg-blob-primary w-[30rem] h-[30rem] -top-20 -left-20 pointer-events-none" style={{ animationDelay: '0s' }} />
            <div className="absolute bg-blob bg-blob-cyan w-[40rem] h-[40rem] top-1/4 -right-20 pointer-events-none" style={{ animationDelay: '-5s' }} />
            <div className="absolute bg-blob bg-blob-dark-blue w-[25rem] h-[25rem] bottom-0 left-1/3 pointer-events-none" style={{ animationDelay: '-10s' }} />

            {/* Logo / Brand */}
            <div className="mb-6 flex flex-col items-center relative z-10 select-none">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl border border-[#1a88ff]/30 bg-[#1a88ff]/10 flex items-center justify-center shadow-[0_0_15px_rgba(26,136,255,0.2)]">
                        <ClipboardList className="w-5.5 h-5.5 text-[#1a88ff] stroke-[1.75]" />
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-lg tracking-tight font-headline">
                        <span className="text-white">SIKAI</span>
                        <span className="text-[#1a88ff]">SOP GENERATOR</span>
                    </div>
                </div>
            </div>

            {/* Card */}
            <div className="w-full max-w-sm sm:max-w-md bg-[#121620]/60 backdrop-blur-md border border-white/8 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-[1px] bg-gradient-to-r from-transparent via-[#1a88ff]/60 to-transparent" />

                <div className="text-center mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 tracking-tight">
                        {isMfaRequired
                            ? "Verificación en Dos Pasos"
                            : isForgotPassword
                            ? "Recuperar Contraseña"
                            : isRegistering
                            ? "Crear Cuenta SIKAI SOP Generator"
                            : "Bienvenido de vuelta"}
                    </h1>
                    <p className="text-gray-400 text-sm">
                        {isMfaRequired
                            ? "Ingresa el código de tu app de autenticación"
                            : isForgotPassword
                            ? "Te enviaremos un enlace seguro a tu correo"
                            : isRegistering
                            ? "Comienza a generar tus SIKAI SOPs hoy"
                            : "Inicia sesión para gestionar tus procesos"}
                    </p>
                </div>

                {msg && (
                    <div className={`mb-5 p-3 rounded-xl text-xs font-semibold text-center ${msg.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                        {msg.text}
                    </div>
                )}

                {/* MFA Form */}
                {isMfaRequired ? (
                    <form onSubmit={handleMfaVerify} className="space-y-4">
                        <input
                            type="text"
                            maxLength={6}
                            value={mfaCode}
                            onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-[#0d0d0f] border border-white/10 rounded-xl px-4 py-4 text-center text-3xl font-mono tracking-[0.5em] text-[#26d8c4] focus:ring-1 focus:ring-[#26d8c4] focus:border-[#26d8c4] focus:outline-none transition-all"
                            placeholder="000000"
                            required
                            autoFocus
                        />
                        <button type="submit" disabled={loading || mfaCode.length < 6}
                            className="w-full bg-[#26d8c4] hover:bg-[#1a88ff] text-black font-bold py-3 rounded-xl transition-colors text-sm disabled:opacity-50">
                            {loading ? "Verificando..." : "Verificar e Ingresar"}
                        </button>
                        <button type="button" onClick={() => { setIsMfaRequired(false); supabase.auth.signOut(); }}
                            className="w-full text-center text-xs text-gray-500 hover:text-white transition mt-2">
                            Cancelar y volver
                        </button>
                    </form>

                /* Reset Password Form */
                ) : isForgotPassword ? (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#0d0d0f] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:ring-1 focus:ring-[#1a88ff] focus:border-[#1a88ff] focus:outline-none transition-all placeholder:text-gray-600"
                                placeholder="nombre@empresa.com" required autoFocus />
                        </div>
                        <button type="submit" disabled={loading || !email}
                            className="w-full bg-[#1a88ff] hover:bg-[#1a88ff]/80 text-white font-semibold py-3 rounded-xl transition-colors text-sm disabled:opacity-50">
                            {loading ? "Enviando..." : "Enviar enlace de recuperación"}
                        </button>
                        <button type="button" onClick={() => { setIsForgotPassword(false); setMsg(null); }}
                            className="w-full text-center text-xs text-gray-500 hover:text-white transition mt-2">
                            Volver al inicio de sesión
                        </button>
                    </form>

                /* Main Auth Form */
                ) : (
                    <form onSubmit={handleAuth} className="space-y-4">
                        {isRegistering && (
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Nombre Completo</label>
                                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-[#0d0d0f] border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:ring-1 focus:ring-[#1a88ff] focus:border-[#1a88ff] focus:outline-none transition-all placeholder:text-gray-600"
                                        placeholder="John Doe" required={isRegistering} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Edad</label>
                                    <input type="number" value={age} onChange={(e) => setAge(e.target.value)}
                                        min="13" max="120"
                                        className="w-full bg-[#0d0d0f] border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:ring-1 focus:ring-[#1a88ff] focus:border-[#1a88ff] focus:outline-none transition-all"
                                        placeholder="25" required={isRegistering} />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#0d0d0f] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:ring-1 focus:ring-[#1a88ff] focus:border-[#1a88ff] focus:outline-none transition-all placeholder:text-gray-600"
                                placeholder="nombre@empresa.com" required />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-xs font-semibold text-gray-400">Contraseña</label>
                                {!isRegistering && (
                                    <button type="button" onClick={() => { setIsForgotPassword(true); setMsg(null); }}
                                        className="text-xs text-[#1a88ff] hover:underline transition">
                                        ¿Olvidaste tu contraseña?
                                    </button>
                                )}
                            </div>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#0d0d0f] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:ring-1 focus:ring-[#1a88ff] focus:border-[#1a88ff] focus:outline-none transition-all placeholder:text-gray-600"
                                placeholder="••••••••••••" required minLength={6} />
                        </div>

                        {isRegistering && (
                            <div className="flex items-start gap-3 bg-white/3 p-3 rounded-xl border border-white/8">
                                <input type="checkbox" id="privacy" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)}
                                    className="mt-0.5 w-4 h-4 rounded accent-[#1a88ff]" required={isRegistering} />
                                <label htmlFor="privacy" className="text-xs text-gray-400 leading-tight cursor-pointer">
                                    He leído y acepto la Política de Tratamiento de Datos Personales
                                </label>
                            </div>
                        )}

                        <button type="submit" disabled={loading}
                            className="w-full bg-gradient-to-r from-[#1a88ff] to-[#26d8c4] hover:opacity-90 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(26,136,255,0.3)] text-sm disabled:opacity-50">
                            {loading ? "Procesando..." : isRegistering ? "Registrarse Ahora" : "Iniciar Sesión"}
                        </button>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-white/8" />
                            <span className="flex-shrink-0 mx-3 text-gray-600 text-[10px] uppercase tracking-widest">O</span>
                            <div className="flex-grow border-t border-white/8" />
                        </div>

                        <button type="button" onClick={handleGoogleLogin} disabled={loading}
                            className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-3 disabled:opacity-50">
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continuar con Google
                        </button>
                    </form>
                )}

                {!isMfaRequired && !isForgotPassword && (
                    <div className="mt-6 text-center">
                        <button onClick={() => { setIsRegistering(!isRegistering); setMsg(null); }}
                            className="text-gray-500 hover:text-white text-sm transition-colors">
                            {isRegistering
                                ? <>¿Ya tienes cuenta? <span className="text-[#1a88ff] hover:underline font-medium">Inicia Sesión</span></>
                                : <>¿No tienes cuenta? <span className="text-[#1a88ff] hover:underline font-medium">Regístrate</span></>
                            }
                        </button>
                    </div>
                )}
            </div>

            <p className="mt-6 text-[10px] text-gray-700 uppercase tracking-widest relative z-10">
                SIKAI SOP Generator · Powered by Gemini AI
            </p>
        </div>
    );
}
