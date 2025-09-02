import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import type { FlashcardData, RelatedQuestion, DepthLevel } from '../types';

if (!process.env.API_KEY) {
  throw new Error('La variable de entorno API_KEY no está configurada.');
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const keyConceptSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'El título del concepto o nota.' },
    points: {
      type: Type.ARRAY,
      description: 'Una lista de puntos que detallan el concepto.',
      items: { type: Type.STRING },
    },
  },
  required: ['title', 'points'],
};

const flashcardResponseSchema = {
  type: Type.OBJECT,
  properties: {
    questionStem: {
      type: Type.STRING,
      description:
        'SOLAMENTE el enunciado principal de la pregunta, sin incluir las opciones de respuesta.',
    },
    correctOption: {
      type: Type.STRING,
      description:
        'La respuesta correcta, formateada como "Opción [N] correcta ([Texto de la opción])".',
    },
    definition: {
      type: Type.STRING,
      description:
        'Una explicación clara y concisa de por qué la respuesta es correcta.',
    },
    optionsAnalysis: {
      type: Type.ARRAY,
      description: 'Un análisis de cada opción de la pregunta.',
      items: {
        type: Type.OBJECT,
        properties: {
          option: {
            type: Type.STRING,
            description: 'El texto de la opción (sin el número inicial).',
          },
          verdict: {
            type: Type.STRING,
            description:
              'Un emoji: "✅" para la correcta, "❌" para las incorrectas.',
          },
          reason: {
            type: Type.STRING,
            description:
              'Una breve explicación de por qué la opción es correcta o incorrecta.',
          },
        },
        required: ['option', 'verdict', 'reason'],
      },
    },
    analysisTables: {
      type: Type.ARRAY,
      description:
        'Tablas comparativas o de clasificación extraídas o generadas a partir del comentario.',
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: 'Título descriptivo de la tabla.',
          },
          headers: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Cabeceras de la tabla.',
          },
          rows: {
            type: Type.ARRAY,
            items: { type: Type.ARRAY, items: { type: Type.STRING } },
            description:
              'Filas de la tabla, donde cada fila es un array de strings.',
          },
        },
        required: ['title', 'headers', 'rows'],
      },
    },
    keyConcepts: {
      type: Type.ARRAY,
      description:
        'Conceptos clave o información importante que no encaja en una tabla.',
      items: keyConceptSchema,
    },
    crucialFact: {
      type: Type.STRING,
      description: 'Un dato crucial o "perla" sobre el tema.',
    },
    mnemonics: {
      type: Type.ARRAY,
      description:
        'Reglas mnemotécnicas creativas para ayudar a recordar el concepto.',
      items: { type: Type.STRING },
    },
    reference: {
      type: Type.STRING,
      description: 'La referencia bibliográfica si se menciona en el texto.',
    },
    ankiNotes: {
      type: Type.ARRAY,
      description:
        'Notas y consejos para crear la tarjeta en Anki, como "Errores frecuentes" o "Sugerencias visuales".',
      items: keyConceptSchema,
    },
  },
  // Los campos requeridos se ajustarán dinámicamente
};

const relatedQuestionsSchema = {
  type: Type.ARRAY,
  description: 'Una lista de preguntas relacionadas con su respuesta.',
  items: {
    type: Type.OBJECT,
    properties: {
      question: { type: Type.STRING, description: 'La pregunta de refuerzo.' },
      answer: {
        type: Type.STRING,
        description: 'La respuesta concisa a la pregunta.',
      },
    },
    required: ['question', 'answer'],
  },
};

export const generateFlashcard = async (
  inputText: string,
  depth: DepthLevel,
  image?: { mimeType: string; data: string }
): Promise<FlashcardData> => {
  let promptInstructions = '';
  let requiredFields: string[] = [];

  switch (depth) {
    case 'simple':
      promptInstructions = `
            Genera una tarjeta de estudio CONCISA. Enfócate en los elementos esenciales.
            1.  **questionStem**: Extrae ÚNICAMENTE el enunciado de la pregunta.
            2.  **correctOption**: Identifica la opción correcta.
            3.  **definition**: Proporciona una explicación BREVE y directa.
            4.  **optionsAnalysis**: Analiza cada opción, pero mantén la razón muy corta (una sola frase).
            OMITE por completo los campos de tablas, conceptos clave, dato crucial, mnemotecnias y notas para Anki.
            `;
      requiredFields = [
        'questionStem',
        'correctOption',
        'definition',
        'optionsAnalysis',
      ];
      break;
    case 'deep':
      promptInstructions = `
            Genera una tarjeta de estudio EXTREMADAMENTE DETALLADA Y PROFUNDA. El objetivo es la máxima calidad y detalle para un estudio exhaustivo.
            1.  **questionStem**: Extrae el enunciado de la pregunta.
            2.  **correctOption**: Identifica la opción correcta.
            3.  **definition**: Proporciona una explicación detallada y con matices.
            4.  **optionsAnalysis**: Analiza cada opción en profundidad, explicando el porqué de forma exhaustiva.
            5.  **analysisTables**: SÉ PROACTIVO. Si el tema lo permite, CREA tablas comparativas, clasificaciones o resúmenes aunque no estén explícitas en el texto o imagen.
            6.  **keyConcepts**: Extrae y elabora múltiples conceptos clave. Sé muy detallado.
            7.  **crucialFact**: Formula un dato crucial que conecte varias ideas.
            8.  **mnemonics**: Inventa reglas mnemotécnicas creativas y efectivas.
            9.  **ankiNotes**: Proporciona consejos AVANZADOS para Anki: cómo formular preguntas inversas, ejemplos de Cloze Deletion, sugerencias de imágenes, etc.
            `;
      requiredFields = [
        'questionStem',
        'correctOption',
        'definition',
        'optionsAnalysis',
        'keyConcepts',
        'crucialFact',
        'mnemonics',
        'ankiNotes',
      ];
      break;
    case 'standard':
    default:
      promptInstructions = `
            Sigue estas instrucciones rigurosamente para estructurar la salida JSON:
            1.  **questionStem**: Extrae ÚNICAMENTE el enunciado de la pregunta principal. NO incluyas las opciones.
            2.  **correctOption**: Identifica la opción correcta basándote en el comentario.
            3.  **definition**: Proporciona una explicación clara y concisa.
            4.  **optionsAnalysis**: Analiza cada una de las opciones.
            5.  **analysisTables**: Si el contenido incluye o se puede derivar una tabla, créala aquí.
            6.  **keyConcepts**: Extrae conceptos o puntos clave.
            7.  **crucialFact**: Extrae o formula un "Dato Crucial".
            8.  **mnemonics**: Extrae o inventa reglas mnemotécnicas.
            9.  **reference**: Extrae la referencia bibliográfica si se menciona.
            10. **ankiNotes**: Extrae o crea una sección de "Notas para Anki".
            `;
      requiredFields = [
        'questionStem',
        'correctOption',
        'definition',
        'optionsAnalysis',
        'keyConcepts',
        'crucialFact',
      ];
      break;
  }

  const imageInstruction = image
    ? 'Analiza también la IMAGEN ADJUNTA, ya que puede contener información relevante (como tablas o diagramas) que complementa al texto.'
    : '';

  const prompt = `
    A partir del siguiente texto y/o la imagen adjunta, que contienen una pregunta de opción múltiple y un comentario/explicación, genera una tarjeta de estudio estilo "Anki" en formato JSON.
    El nivel de detalle solicitado es: ${depth.toUpperCase()}.
    ${imageInstruction}

    Texto de entrada:
    ---
    ${inputText || '(El texto está vacío, basarse principalmente en la imagen si se ha proporcionado una.)'}
    ---
    
    ${promptInstructions}

    Responde ÚNICAMENTE con el objeto JSON que se adhiere al esquema. No incluyas texto introductorio, explicaciones adicionales ni la palabra "json" o comillas de bloque de código. Asegúrate de que el JSON sea válido.
    `;

  const finalSchema = {
    ...flashcardResponseSchema,
    required: requiredFields,
  };

  const contentParts: any[] = [{ text: prompt }];
  if (image && image.data && image.mimeType) {
    contentParts.push({
      inlineData: {
        mimeType: image.mimeType,
        data: image.data,
      },
    });
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: contentParts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: finalSchema,
        temperature: 0.5,
      },
    });

    const text = response.text.trim();
    const data = JSON.parse(text);
    return data as FlashcardData;
  } catch (error) {
    console.error('Error al generar la tarjeta:', error);
    if (error instanceof Error) {
      throw new Error(`Error de la API de Gemini: ${error.message}`);
    }
    throw new Error(
      'Ocurrió un error desconocido al contactar la API de Gemini.'
    );
  }
};

export const generateRelatedQuestions = async (
  topic: string,
  definition: string
): Promise<RelatedQuestion[]> => {
  const prompt = `
    Basado en el siguiente tema principal de una pregunta de estudio y su explicación, genera 3 preguntas de refuerzo cortas para ayudar a un estudiante a verificar su comprensión desde diferentes ángulos. Para cada pregunta, proporciona una respuesta clara y concisa.

    Tema Principal: "${topic}"
    Explicación: "${definition}"

    Genera una lista de 3 preguntas y respuestas.
    `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: relatedQuestionsSchema,
          },
          required: ['questions'],
        },
        temperature: 0.7,
      },
    });

    const text = response.text.trim();
    const data = JSON.parse(text);

    // La IA puede anidar la respuesta dentro de un objeto { "questions": [...] }
    if (data.questions && Array.isArray(data.questions)) {
      return data.questions as RelatedQuestion[];
    }

    return data as RelatedQuestion[];
  } catch (error) {
    console.error('Error al generar preguntas relacionadas:', error);
    if (error instanceof Error) {
      throw new Error(
        `Error de la API de Gemini al generar preguntas relacionadas: ${error.message}`
      );
    }
    throw new Error(
      'Ocurrió un error desconocido al generar preguntas relacionadas.'
    );
  }
};
