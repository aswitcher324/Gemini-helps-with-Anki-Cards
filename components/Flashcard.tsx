import React, { useState, useCallback } from 'react';
import type { FlashcardData, RelatedQuestion } from '../types';
import { Section } from './Section';
import {
  CheckCircle2,
  XCircle,
  Target,
  BookOpen,
  Brain,
  Lightbulb,
  FileText,
  Bot,
  Table2,
  Layers,
  ClipboardCopy,
  Check,
  HelpCircle,
} from 'lucide-react';
import { generateRelatedQuestions } from '../services/geminiService';
import { Loader } from './Loader';
import { RelatedQuestionItem } from './RelatedQuestionItem';

interface FlashcardProps {
  data: FlashcardData;
}

function generateAnkiAnswerHtml(data: FlashcardData): string {
  const styles = `
        <style>
            .card { background-color: #0f172a; color: #e2e8f0; font-family: sans-serif; padding: 1em; }
            h3 { color: #22d3ee; border-bottom: 1px solid #475569; padding-bottom: 0.3em; margin-top: 1.5em; margin-bottom: 1em; font-size: 1.2em; }
            h4 { color: #5eead4; margin-top: 1em; margin-bottom: 0.5em; font-size: 1.1em; }
            ul, ol { list-style-position: outside; padding-left: 1.5em; }
            li { margin-bottom: 0.5em; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 1em; border: 1px solid #475569; }
            thead { background-color: #334155; }
            th, td { padding: 8px; text-align: left; border: 1px solid #475569; }
            .correct-option { font-size: 1.1em; color: #6ee7b7; font-weight: bold; background-color: rgba(16, 185, 129, 0.1); padding: 0.5em; border-radius: 6px; display: inline-block; }
            .key-concept-box, .anki-notes-box { background-color: #1e293b; border: 1px solid #334155; padding: 1em; border-radius: 8px; margin-bottom: 1em; }
            .crucial-fact-box { background-color: rgba(252, 211, 77, 0.1); border: 1px solid #facc15; padding: 1em; border-radius: 8px; }
            .crucial-fact-box p { color: #fde047; margin: 0; }
            .mnemonic { font-style: italic; background-color: #1e293b; padding: 0.75em; border-radius: 6px; margin-bottom: 0.5em; }
            .reference { font-style: italic; font-size: 0.9em; color: #94a3b8; }
            hr { border: 0; border-top: 1px solid #475569; margin: 1.5em 0; }
        </style>
    `;

  let body = '';

  body += `<div class="correct-option">📌 ${data.correctOption}</div>`;
  body += '<hr>';

  body += `<h3>📖 Explicación</h3><p>${data.definition}</p>`;

  if (data.optionsAnalysis && data.optionsAnalysis.length > 0) {
    body += '<h3>🎯 Análisis de Opciones</h3><ul>';
    data.optionsAnalysis.forEach((item) => {
      body += `<li>${item.verdict} <strong>${item.option}</strong>: ${item.reason}</li>`;
    });
    body += '</ul>';
  }

  if (data.analysisTables && data.analysisTables.length > 0) {
    body += '<h3>📊 Tablas de Análisis</h3>';
    data.analysisTables.forEach((table) => {
      body += `<h4>${table.title}</h4>`;
      body += '<table><thead><tr>';
      table.headers.forEach((header) => {
        body += `<th>${header}</th>`;
      });
      body += '</tr></thead><tbody>';
      table.rows.forEach((row) => {
        body += '<tr>';
        row.forEach((cell) => {
          body += `<td>${cell}</td>`;
        });
        body += '</tr>';
      });
      body += '</tbody></table>';
    });
  }

  if (data.keyConcepts && data.keyConcepts.length > 0) {
    body += '<h3>🔑 Conceptos Clave</h3>';
    data.keyConcepts.forEach((concept) => {
      body += `<div class="key-concept-box"><h4>${concept.title}</h4><ul>`;
      concept.points.forEach((point) => {
        body += `<li>${point}</li>`;
      });
      body += '</ul></div>';
    });
  }

  if (data.crucialFact) {
    body += `<h3>💡 Dato Crucial</h3><div class="crucial-fact-box"><p>🌟 ${data.crucialFact}</p></div>`;
  }

  if (data.mnemonics && data.mnemonics.length > 0) {
    body += '<h3>🧠 Mnemotecnia</h3>';
    data.mnemonics.forEach((mnemonic) => {
      body += `<p class="mnemonic">"${mnemonic}"</p>`;
    });
  }

  if (data.ankiNotes && data.ankiNotes.length > 0) {
    body += '<h3>📝 Notas para Anki</h3>';
    data.ankiNotes.forEach((note) => {
      body += `<div class="anki-notes-box"><h4>${note.title}</h4><ul>`;
      note.points.forEach((point) => {
        body += `<li>${point}</li>`;
      });
      body += '</ul></div>';
    });
  }

  if (data.reference) {
    body += `<h3>📚 Referencia</h3><p class="reference">${data.reference}</p>`;
  }

  return `${styles}<div class="card">${body}</div>`;
}

function generateAnkiAnswerText(data: FlashcardData): string {
  let text = '';

  text += `📌 ${data.correctOption}\n`;
  text += '------------------------------------\n\n';

  text += `📖 EXPLICACIÓN\n${data.definition}\n\n`;

  if (data.optionsAnalysis && data.optionsAnalysis.length > 0) {
    text += '🎯 ANÁLISIS DE OPCIONES\n';
    data.optionsAnalysis.forEach((item) => {
      text += `- ${item.verdict} ${item.option}: ${item.reason}\n`;
    });
    text += '\n';
  }

  if (data.analysisTables && data.analysisTables.length > 0) {
    text += '📊 TABLAS DE ANÁLISIS\n';
    data.analysisTables.forEach((table) => {
      text += `\n--- ${table.title} ---\n`;
      text += table.headers.join('\t') + '\n';
      table.rows.forEach((row) => {
        text += row.join('\t') + '\n';
      });
      text += '\n';
    });
  }

  if (data.keyConcepts && data.keyConcepts.length > 0) {
    text += '🔑 CONCEPTOS CLAVE\n';
    data.keyConcepts.forEach((concept) => {
      text += `\n--- ${concept.title} ---\n`;
      concept.points.forEach((point) => {
        text += `- ${point}\n`;
      });
    });
    text += '\n';
  }

  if (data.crucialFact) {
    text += `💡 DATO CRUCIAL\n🌟 ${data.crucialFact}\n\n`;
  }

  if (data.mnemonics && data.mnemonics.length > 0) {
    text += '🧠 MNEMOTECNIA\n';
    data.mnemonics.forEach((mnemonic) => {
      text += `- "${mnemonic}"\n`;
    });
    text += '\n';
  }

  if (data.ankiNotes && data.ankiNotes.length > 0) {
    text += '📝 NOTAS PARA ANKI\n';
    data.ankiNotes.forEach((note) => {
      text += `\n--- ${note.title} ---\n`;
      note.points.forEach((point) => {
        text += `- ${point}\n`;
      });
    });
    text += '\n';
  }

  if (data.reference) {
    text += `📚 REFERENCIA\n${data.reference}\n`;
  }

  return text;
}

export function Flashcard({ data }: FlashcardProps) {
  const [copyState, setCopyState] = useState<'question' | 'answer' | null>(
    null
  );
  const [relatedQuestions, setRelatedQuestions] = useState<
    RelatedQuestion[] | null
  >(null);
  const [isGeneratingRelated, setIsGeneratingRelated] = useState(false);
  const [relatedError, setRelatedError] = useState<string | null>(null);

  const handleGenerateRelated = useCallback(async () => {
    setIsGeneratingRelated(true);
    setRelatedError(null);
    try {
      const questions = await generateRelatedQuestions(
        data.questionStem,
        data.definition
      );
      setRelatedQuestions(questions);
    } catch (e) {
      if (e instanceof Error) {
        setRelatedError(e.message);
      } else {
        setRelatedError(
          'Ocurrió un error inesperado al generar las preguntas.'
        );
      }
    } finally {
      setIsGeneratingRelated(false);
    }
  }, [data.questionStem, data.definition]);

  const handleCopy = async (type: 'question' | 'answer') => {
    try {
      if (type === 'question') {
        const { questionStem, optionsAnalysis } = data;

        // 1. Reconstruir las opciones para TEXTO PLANO (con numeración manual).
        const plainTextOptions = optionsAnalysis.map(
          (opt, index) => `${index + 1}. ${opt.option}`
        );
        const plainText = `${questionStem}\n\n${plainTextOptions.join('\n\n')}`;

        // 2. Crear contenido HTML con una lista ordenada (<ol>) para un formato semántico.
        const listItemsHtml = optionsAnalysis
          .map((opt) => `<li>${opt.option}</li>`)
          .join('');
        const htmlText = `<strong>${questionStem}</strong><ol>${listItemsHtml}</ol>`;

        // 3. Copiar al portapapeles usando ClipboardItem para soportar ambos formatos.
        const blobHtml = new Blob([htmlText], { type: 'text/html' });
        const blobText = new Blob([plainText], { type: 'text/plain' });

        const clipboardItem = new ClipboardItem({
          'text/html': blobHtml,
          'text/plain': blobText,
        });

        await navigator.clipboard.write([clipboardItem]);
      } else {
        const htmlContent = generateAnkiAnswerHtml(data);
        const textContent = generateAnkiAnswerText(data);

        const blobHtml = new Blob([htmlContent], { type: 'text/html' });
        const blobText = new Blob([textContent], { type: 'text/plain' });

        const clipboardItem = new ClipboardItem({
          'text/html': blobHtml,
          'text/plain': blobText,
        });

        await navigator.clipboard.write([clipboardItem]);
      }

      setCopyState(type);
      setTimeout(() => setCopyState(null), 2000);
    } catch (err) {
      console.error('No se pudo copiar el contenido: ', err);
      alert(
        'No se pudo copiar el contenido. Asegúrate de que tu navegador lo permita y que te encuentras en un contexto seguro (https).'
      );
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl animate-fade-in">
      <div className="bg-slate-900/50 p-4 rounded-lg mb-6 flex flex-col sm:flex-row gap-3 justify-center border border-slate-700">
        <button
          onClick={() => handleCopy('question')}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-slate-700 text-slate-200 font-semibold rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transition-all duration-200"
          aria-label="Copiar pregunta para el anverso de la tarjeta Anki"
        >
          {copyState === 'question' ? (
            <Check className="w-5 h-5 text-green-400" />
          ) : (
            <ClipboardCopy className="w-5 h-5" />
          )}
          {copyState === 'question'
            ? 'Pregunta Copiada'
            : 'Copiar Pregunta (Anverso)'}
        </button>
        <button
          onClick={() => handleCopy('answer')}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transition-all duration-200"
          aria-label="Copiar respuesta formateada para el reverso de la tarjeta Anki"
        >
          {copyState === 'answer' ? (
            <Check className="w-5 h-5" />
          ) : (
            <ClipboardCopy className="w-5 h-5" />
          )}
          {copyState === 'answer'
            ? 'Respuesta Copiada'
            : 'Copiar Respuesta (Reverso)'}
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-cyan-300 mb-4">
          {data.questionStem}
        </h2>
        <div className="space-y-3 text-lg text-slate-200">
          {data.optionsAnalysis.map((opt, index) => (
            <p key={index}>{`${index + 1}. ${opt.option}`}</p>
          ))}
        </div>
      </div>

      <p className="text-lg font-semibold text-green-400 mb-4 bg-green-900/30 p-2 rounded-md inline-block">
        📌 {data.correctOption}
      </p>

      <Section
        title="📖 Explicación"
        icon={<BookOpen className="w-6 h-6 text-cyan-400" />}
      >
        <p className="text-slate-300 leading-relaxed">{data.definition}</p>
      </Section>

      {data.optionsAnalysis && data.optionsAnalysis.length > 0 && (
        <Section
          title="🎯 Análisis de Opciones"
          icon={<Target className="w-6 h-6 text-cyan-400" />}
        >
          <ul className="space-y-3">
            {data.optionsAnalysis.map((item, index) => (
              <li
                key={index}
                className={`p-3 rounded-lg ${item.verdict === '✅' ? 'bg-green-900/50 border border-green-700' : 'bg-red-900/30 border border-red-800'}`}
              >
                <div className="flex items-start gap-3">
                  {item.verdict === '✅' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                  )}
                  <div>
                    <strong className="font-semibold text-slate-200">
                      {item.option}
                    </strong>
                    <p className="text-slate-400 text-sm">{item.reason}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {data.analysisTables && data.analysisTables.length > 0 && (
        <Section
          title="📊 Tablas de Análisis"
          icon={<Table2 className="w-6 h-6 text-cyan-400" />}
        >
          <div className="space-y-6">
            {data.analysisTables.map((table, tableIndex) => (
              <div
                key={tableIndex}
                className="bg-slate-900/70 rounded-lg overflow-x-auto"
              >
                <h4 className="font-semibold text-cyan-300 mb-3 px-4 pt-4">
                  {table.title}
                </h4>
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-800/50">
                    <tr>
                      {table.headers.map((header, headIndex) => (
                        <th
                          key={headIndex}
                          scope="col"
                          className="p-3 font-semibold text-slate-300 tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {table.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-slate-800/40">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="p-3 text-slate-400">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </Section>
      )}

      {data.keyConcepts && data.keyConcepts.length > 0 && (
        <Section
          title="🔑 Conceptos Clave"
          icon={<Brain className="w-6 h-6 text-cyan-400" />}
        >
          <div className="space-y-4">
            {data.keyConcepts.map((concept, index) => (
              <div key={index} className="bg-slate-900/70 p-4 rounded-lg">
                <h4 className="font-semibold text-cyan-300 mb-2">
                  {concept.title}
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {concept.points.map((point, pIndex) => (
                    <li key={pIndex}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      )}

      {data.crucialFact && (
        <Section
          title="💡 Dato Crucial"
          icon={<Lightbulb className="w-6 h-6 text-cyan-400" />}
        >
          <div className="bg-yellow-900/30 border border-yellow-700 p-4 rounded-lg">
            <p className="text-yellow-300 leading-relaxed">
              🌟 {data.crucialFact}
            </p>
          </div>
        </Section>
      )}

      {data.mnemonics && data.mnemonics.length > 0 && (
        <Section
          title="🧠 Mnemotecnia"
          icon={<Bot className="w-6 h-6 text-cyan-400" />}
        >
          <div className="space-y-3">
            {data.mnemonics.map((mnemonic, index) => (
              <p
                key={index}
                className="text-slate-300 italic bg-slate-900/50 p-3 rounded-md"
              >
                "{mnemonic}"
              </p>
            ))}
          </div>
        </Section>
      )}

      {data.ankiNotes && data.ankiNotes.length > 0 && (
        <Section
          title="📝 Notas para Anki"
          icon={<Layers className="w-6 h-6 text-cyan-400" />}
        >
          <div className="space-y-4">
            {data.ankiNotes.map((note, index) => (
              <div key={index} className="bg-slate-900/70 p-4 rounded-lg">
                <h4 className="font-semibold text-cyan-300 mb-2">
                  {note.title}
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {note.points.map((point, pIndex) => (
                    <li key={pIndex}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      )}

      {data.reference && (
        <Section
          title="📚 Referencia"
          icon={<FileText className="w-6 h-6 text-cyan-400" />}
        >
          <p className="text-slate-400 text-sm italic">{data.reference}</p>
        </Section>
      )}

      <Section
        title="🧠 Refuerza tu Conocimiento"
        icon={<HelpCircle className="w-6 h-6 text-cyan-400" />}
      >
        {!relatedQuestions && !isGeneratingRelated && !relatedError && (
          <div className="text-center bg-slate-900/50 p-6 rounded-lg border border-slate-700">
            <p className="text-slate-300 mb-4">
              ¿Has entendido bien el concepto? Ponte a prueba con preguntas
              relacionadas.
            </p>
            <button
              onClick={handleGenerateRelated}
              className="flex items-center justify-center gap-2 px-5 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-slate-400 transition-all duration-200"
            >
              Generar Preguntas Relacionadas
            </button>
          </div>
        )}

        {isGeneratingRelated && (
          <div className="flex justify-center items-center h-24">
            <div className="text-center">
              <Loader size="md" />
              <p className="text-slate-400 mt-2">Buscando preguntas...</p>
            </div>
          </div>
        )}

        {relatedError && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center">
            <h3 className="font-bold">Error al generar preguntas</h3>
            <p className="text-sm">{relatedError}</p>
          </div>
        )}

        {relatedQuestions && (
          <div className="space-y-3">
            {relatedQuestions.map((q, index) => (
              <RelatedQuestionItem
                key={index}
                question={q.question}
                answer={q.answer}
              />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
