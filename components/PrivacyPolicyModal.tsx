'use client';

import { useState, useEffect } from 'react';
import { X, ShieldCheck, Check } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export function PrivacyPolicyModal({ isOpen, onClose, onAccept }: PrivacyPolicyModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // Animation duration
  };

  const handleAccept = () => {
    setIsClosing(true);
    setTimeout(() => {
      onAccept();
    }, 300);
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${
        isClosing ? 'opacity-0 backdrop-blur-none bg-black/0' : 'opacity-100 backdrop-blur-md bg-black/65'
      }`}
    >
      <div
        className={`relative w-full max-w-2xl bg-white dark:bg-[#0d111c]/95 border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 transform ${
          isClosing ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'
        }`}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.05), 0 0 40px rgba(26, 136, 255, 0.12)'
        }}
      >
        {/* Glow Effects (Only in dark mode) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-[#1a88ff]/10 blur-[50px] pointer-events-none rounded-full dark:block hidden" />
        
        {/* Top Brand Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#1a88ff] to-[#26d8c4]" />

        <div className="p-6 sm:p-8 flex flex-col max-h-[85vh] relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1a88ff]/10 border border-[#1a88ff]/20 flex items-center justify-center text-[#1a88ff]">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold font-headline text-gray-900 dark:text-white leading-tight">
                  Política de Tratamiento de Datos
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Cumplimiento Ley de Habeas Data · SIKAI SOP Generator
                </p>
              </div>
            </div>
            
            <button
              onClick={handleClose}
              type="button"
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:border dark:border-white/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all active:scale-95 cursor-pointer"
              title="Cerrar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-5 text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-body scrollbar-thin">
            <section className="space-y-2">
              <h3 className="text-sm font-bold text-[#1a88ff] font-headline uppercase tracking-wider">
                1. Objetivo y Alcance
              </h3>
              <p>
                En SIKAI SOP Generator ("La Aplicación", "Nosotros"), nos comprometemos a proteger y respetar su privacidad. Esta política describe cómo recopilamos, utilizamos, almacenamos y protegemos sus datos personales en estricto cumplimiento de las leyes de Habeas Data y protección de datos aplicables en Colombia y Latinoamérica.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-[#1a88ff] font-headline uppercase tracking-wider">
                2. Datos Recopilados
              </h3>
              <p>
                Para brindar nuestros servicios de documentación y optimización de procesos mediante Inteligencia Artificial, recopilamos y procesamos los siguientes datos:
              </p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li><strong>Identificadores Personales:</strong> Nombre completo, dirección de correo electrónico y edad.</li>
                <li><strong>Contenido de Procesos:</strong> Las descripciones de los procesos empresariales que usted ingresa manual o verbalmente para generar SOPs.</li>
                <li><strong>Documentación Generada:</strong> Los SOPs, diagramas de flujo y estrategias de optimización creados por la IA y almacenados en su cuenta.</li>
                <li><strong>Metadatos Técnicos:</strong> Información de inicio de sesión, tokens de autenticación y datos de navegación para asegurar el acceso a su cuenta.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-[#1a88ff] font-headline uppercase tracking-wider">
                3. Uso de la Información e Inteligencia Artificial
              </h3>
              <p>
                Los datos proporcionados son utilizados única y exclusivamente para:
              </p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>Crear, gestionar y mantener seguro su perfil de usuario en SIKAI SOP Generator.</li>
                <li>Procesar descripciones de sus procesos mediante el motor de IA (Google Gemini) para estructurar procedimientos operativos, diagramas Mermaid.js y sugerencias de optimización.</li>
                <li>Almacenar sus SOPs generados de forma privada para su posterior consulta y descarga.</li>
                <li>Gestionar el saldo de créditos, control de planes y los pagos asociados al servicio.</li>
              </ul>
              <div className="bg-[#1a88ff]/10 border border-[#1a88ff]/20 rounded-2xl p-4 mt-3">
                <p className="text-xs text-gray-800 dark:text-gray-200">
                  <strong className="text-[#1a88ff] dark:text-[#26d8c4] font-bold">🔒 Compromiso de Privacidad:</strong> Nosotros <strong>NO comercializamos, alquilamos ni vendemos</strong> su información personal ni las descripciones de sus procesos bajo ninguna circunstancia a terceros.
                </p>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-[#1a88ff] font-headline uppercase tracking-wider">
                4. Autorización del Titular
              </h3>
              <p>
                Al marcar la casilla de aceptación durante el registro o al hacer clic en "Aceptar política" en este portal, el Usuario otorga su autorización previa, expresa e informada a SIKAI SOP Generator para que recolecte, almacene, use y procese sus datos personales de conformidad con los términos expuestos en este documento.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-[#1a88ff] font-headline uppercase tracking-wider">
                5. Derechos del Titular
              </h3>
              <p>
                Como titular de los datos personales, usted tiene derecho constitucional a:
              </p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>Conocer, actualizar y rectificar sus datos personales en cualquier momento.</li>
                <li>Solicitar prueba de la autorización otorgada durante el proceso de registro.</li>
                <li>Exigir la revocatoria de la autorización y/o la <strong>eliminación total y definitiva de sus datos</strong> (derecho al olvido) de nuestros sistemas. Para esto, puede contactarse a nuestro correo de asistencia corporativo.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-[#1a88ff] font-headline uppercase tracking-wider">
                6. Seguridad de la Información
              </h3>
              <p>
                Implementamos estrictas medidas técnicas y administrativas para salvaguardar su información. La base de datos opera bajo Supabase con seguridad a nivel de filas (Row-Level Security - RLS) y autenticación segura para garantizar que solo usted pueda acceder a sus procesos y documentación generada.
              </p>
            </section>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-gray-100 dark:border-white/5 pt-4 mt-4">
            <button
              onClick={handleClose}
              type="button"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 text-xs font-semibold transition-all active:scale-95 cursor-pointer text-center"
            >
              Cerrar y Volver
            </button>
            <button
              onClick={handleAccept}
              type="button"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1a88ff] to-[#26d8c4] text-white text-xs font-bold shadow-md shadow-[#1a88ff]/20 hover:opacity-90 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check size={14} /> Aceptar Política
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
