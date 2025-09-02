import React from 'react';
import {
  BookMarked,
  BrainCircuit,
  Mic,
  FileText,
  TestTube2,
} from 'lucide-react';

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="bg-slate-800 p-4 rounded-lg flex items-start gap-4 border border-slate-700">
    <div className="text-cyan-400 mt-1">{icon}</div>
    <div>
      <h3 className="font-semibold text-slate-200">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
  </div>
);

export function WelcomePlaceholder() {
  return (
    <div className="text-center p-8 bg-slate-800/30 border border-dashed border-slate-700 rounded-xl">
      <div className="flex justify-center mb-4">
        <TestTube2 className="w-16 h-16 text-slate-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-300">
        Transforma Preguntas de Examen en Tarjetas de Estudio
      </h2>
      <p className="text-slate-400 max-w-2xl mx-auto mt-2 mb-8">
        Pega una pregunta de opción múltiple y su explicación para que la IA la
        convierta en una tarjeta Anki perfectamente estructurada.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-3xl mx-auto">
        <FeatureCard
          icon={<BookMarked size={20} />}
          title="Extracción Inteligente"
          description="La IA identifica la pregunta, opciones, respuesta correcta y explicaciones."
        />
        <FeatureCard
          icon={<BrainCircuit size={20} />}
          title="Estructura Completa"
          description="Genera tablas, conceptos clave, mnemotecnias y notas de estudio."
        />
        <FeatureCard
          icon={<FileText size={20} />}
          title="Ahorra Horas de Trabajo"
          description="Convierte tus apuntes y tests en tarjetas de alta calidad en segundos."
        />
        <FeatureCard
          icon={<Mic size={20} />}
          title="Optimizado para Aprender"
          description="Recibe tarjetas diseñadas para una memorización y comprensión eficientes."
        />
      </div>
    </div>
  );
}
