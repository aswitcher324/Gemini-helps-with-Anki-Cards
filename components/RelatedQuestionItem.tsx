import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface RelatedQuestionItemProps {
  question: string;
  answer: string;
}

export function RelatedQuestionItem({
  question,
  answer,
}: RelatedQuestionItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-slate-900/70 border border-slate-700 rounded-lg transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left p-4 focus:outline-none"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-slate-200">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-cyan-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
        )}
      </button>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-96' : 'max-h-0'}`}
      >
        <div className="p-4 pt-0 text-slate-300">
          <p className="border-t border-slate-700 pt-3">{answer}</p>
        </div>
      </div>
    </div>
  );
}
