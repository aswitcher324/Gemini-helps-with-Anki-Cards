import React from 'react';
import { CardGenerator } from './components/CardGenerator';
import { BrainCircuit } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8 pt-8 sm:pt-12 lg:pt-16 font-sans">
      <header className="w-full max-w-5xl mx-auto mb-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <BrainCircuit className="w-10 h-10 text-cyan-400" />
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 tracking-tight">
            Generador de Tarjetas Anki con IA
          </h1>
        </div>
        <p className="text-slate-400 text-lg">
          Transforma cualquier concepto en una tarjeta de estudio detallada al instante.
        </p>
      </header>
      <main className="w-full flex-grow">
        <CardGenerator />
      </main>
       <footer className="w-full max-w-5xl mx-auto mt-8 text-center text-slate-500 text-sm">
        <p>Creado con React, Tailwind CSS y la API de Gemini. Diseñado para un aprendizaje eficiente.</p>
      </footer>
    </div>
  );
}

export default App;