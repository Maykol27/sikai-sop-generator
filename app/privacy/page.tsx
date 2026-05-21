import Link from 'next/link';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="glass-card p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <img src="/favicon.ico" alt="SIKAI" className="w-10 h-10 object-contain" />
                        <div>
                            <h1 className="text-2xl font-headline font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#1a88ff] to-[#26d8c4]">
                                Política de Tratamiento de Datos Personales
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Última actualización: Mayo 2026 · SIKAI SOP Generator</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <section className="space-y-3">
                            <h2 className="text-lg font-headline font-semibold text-[#1a88ff]">1. Objetivo y Alcance</h2>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                                En nombre de SIKAI SOP Generator ("La Aplicación", "Nosotros"), nos comprometemos a proteger y respetar su privacidad. Esta política describe cómo recopilamos, utilizamos, almacenamos y protegemos sus datos personales en estricto cumplimiento de las leyes de Habeas Data y protección de datos aplicables en Colombia y Latinoamérica.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-headline font-semibold text-[#1a88ff]">2. Datos Recopilados</h2>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">Para brindar nuestros servicios de documentación de procesos, recopilamos y procesamos los siguientes datos:</p>
                            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1.5 ml-4 text-sm">
                                <li><strong>Identificadores Personales:</strong> Nombre completo, correo electrónico y edad.</li>
                                <li><strong>Contenido de Procesos:</strong> Las descripciones de procesos empresariales que usted ingresa manual o verbalmente para generar SOPs.</li>
                                <li><strong>Documentación Generada:</strong> Los SOPs, diagramas y estrategias generados por la IA y guardados en su cuenta.</li>
                                <li><strong>Metadatos Técnicos:</strong> Información de sesión y tokens de autenticación para garantizar la seguridad de su cuenta.</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-headline font-semibold text-[#1a88ff]">3. Uso de la Información e Inteligencia Artificial</h2>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">Los datos proporcionados son utilizados exclusivamente con los siguientes propósitos:</p>
                            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1.5 ml-4 text-sm">
                                <li>Crear y gestionar su perfil de usuario en SIKAI SOP Generator.</li>
                                <li>Procesar las descripciones de sus procesos a través del modelo de IA (Google Gemini) para generar SOPs estructurados, diagramas Mermaid.js y estrategias de optimización.</li>
                                <li>Almacenar sus SOPs generados de forma segura y privada para su consulta posterior.</li>
                                <li>Gestionar el sistema de créditos y pagos asociados al servicio.</li>
                            </ul>
                            <div className="bg-[#1a88ff]/10 border border-[#1a88ff]/30 rounded-xl p-4 mt-2">
                                <strong className="text-[#26d8c4]">🔒 Importante:</strong>
                                <span className="text-gray-700 dark:text-gray-300 text-sm ml-1">Nosotros <strong>NO comercializamos, alquilamos ni vendemos</strong> su información personal ni el contenido de sus procesos a terceros.</span>
                            </div>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-headline font-semibold text-[#1a88ff]">4. Autorización del Titular</h2>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                                Al marcar la casilla de aceptación durante el registro, el Usuario autoriza de manera previa, expresa e informada a SIKAI SOP Generator para que recolecte, almacene, use y procese sus datos personales de acuerdo con lo establecido en la presente política.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-headline font-semibold text-[#1a88ff]">5. Derechos del Titular</h2>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">Todo usuario activo en SIKAI SOP Generator goza del derecho de:</p>
                            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1.5 ml-4 text-sm">
                                <li>Conocer, actualizar y rectificar sus datos personales.</li>
                                <li>Solicitar prueba de la autorización otorgada en el registro.</li>
                                <li>Exigir la revocatoria y/o <strong>eliminación total de sus datos</strong> (Derecho al olvido) en cualquier momento.</li>
                             </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-headline font-semibold text-[#1a88ff]">6. Seguridad de la Información</h2>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                                SIKAI SOP Generator utiliza infraestructura protegida con Autenticación de Múltiples Factores (MFA) y encriptación Row-Level Security (RLS) en sus bases de datos (Supabase) para asegurar que nadie más que usted pueda visualizar o manipular sus datos y documentación.
                            </p>
                        </section>

                        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-black/10 dark:border-white/10">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                © {new Date().getFullYear()} SIKAI SOP Generator · Todos los derechos reservados
                            </p>
                            <Link href="/login" className="text-sm text-[#1a88ff] hover:text-[#26d8c4] transition-colors font-medium underline underline-offset-2">
                                Volver al inicio de sesión
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
