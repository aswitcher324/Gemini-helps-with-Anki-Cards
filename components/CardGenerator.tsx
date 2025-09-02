import React, { useState, useCallback, useEffect } from 'react';
import type { FlashcardData, DepthLevel } from '../types';
import { generateFlashcard, validateInputText } from '../services/geminiService';
import { Flashcard } from './Flashcard';
import { Loader } from './Loader';
import { Sparkles, ImagePlus, X } from 'lucide-react';
import { WelcomePlaceholder } from './WelcomePlaceholder';

const DepthSelector = ({ selected, onSelect }: { selected: DepthLevel, onSelect: (depth: DepthLevel) => void }) => {
    const options: { id: DepthLevel; label: string }[] = [
        { id: 'simple', label: 'Simple' },
        { id: 'standard', label: 'Estándar' },
        { id: 'deep', label: 'Profunda' },
    ];

    return (
        <div className="flex items-center p-1 bg-slate-700/50 rounded-lg border border-slate-600">
            {options.map(option => (
                <button
                    key={option.id}
                    onClick={() => onSelect(option.id)}
                    className={`px-4 py-1 text-sm font-semibold rounded-md transition-all duration-200 w-full
                        ${selected === option.id 
                            ? 'bg-cyan-600 text-white shadow' 
                            : 'text-slate-300 hover:bg-slate-600/50'
                        }`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
};

interface AppMessage {
    text: string;
    type: 'warning' | 'error';
}

export function CardGenerator() {
    const [inputText, setInputText] = useState('');
    const [cardData, setCardData] = useState<FlashcardData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<AppMessage | null>(null);
    const [depth, setDepth] = useState<DepthLevel>('standard');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const fileToBase64 = (file: File): Promise<{ mimeType: string, data: string }> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                const [header, data] = result.split(',');
                if (!header || !data) {
                    reject(new Error("Formato de archivo inválido."));
                    return;
                }
                const mimeType = header.match(/:(.*?);/)?.[1] || file.type;
                resolve({ mimeType, data });
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            if (imagePreview) {
                 URL.revokeObjectURL(imagePreview);
            }
            setImagePreview(URL.createObjectURL(file));
        }
        e.target.value = ''; // Permite seleccionar el mismo archivo de nuevo
    };
    
    const handleRemoveImage = useCallback(() => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
        setImageFile(null);
        setImagePreview(null);
    }, [imagePreview]);

    const handlePaste = useCallback((event: React.ClipboardEvent) => {
        const pastedFile = Array.from(event.clipboardData.files).find(
            (file) => file.type.startsWith('image/')
        );

        if (pastedFile) {
            event.preventDefault();
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
            setImageFile(pastedFile);
            setImagePreview(URL.createObjectURL(pastedFile));
        }
    }, [imagePreview]);

    const handleGenerate = useCallback(async () => {
        if ((!inputText.trim() && !imageFile) || isLoading) return;

        setIsLoading(true);
        setMessage(null);
        setCardData(null);

        try {
            // Step 1: Validate input text only if no image is provided
            if (inputText.trim() && !imageFile) {
                const validation = await validateInputText(inputText);
                if (!validation.isValid) {
                    setMessage({
                        type: 'warning',
                        text: `Sugerencia de la IA: ${validation.reason} Por favor, revisa que el texto incluya la pregunta, las opciones y la explicación.`
                    });
                    setIsLoading(false);
                    return;
                }
            }

            // Step 2: Proceed with generation
            let imagePayload: { mimeType: string; data: string } | undefined = undefined;
            if (imageFile) {
                imagePayload = await fileToBase64(imageFile);
            }
            const data = await generateFlashcard(inputText, depth, imagePayload);
            setCardData(data);
            setInputText('');
            handleRemoveImage();
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error inesperado.';
            setMessage({
                type: 'error',
                text: `No se pudo generar la tarjeta. ${errorMessage}`
            });
        } finally {
            setIsLoading(false);
        }
    }, [inputText, isLoading, depth, imageFile, handleRemoveImage]);
    
    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            handleGenerate();
        }
    };

    return (
        <div className="max-w-4xl mx-auto flex flex-col gap-6" onPaste={handlePaste}>
            <div className="bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700">
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Pega aquí tu texto o una imagen desde el portapapeles (Ctrl+V)..."
                    className="w-full bg-slate-800 text-slate-200 placeholder-slate-500 text-lg p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none transition-all duration-300"
                    rows={6}
                    disabled={isLoading}
                />

                {imagePreview && (
                    <div className="mt-4 relative w-40 h-40 group animate-fade-in">
                        <img src={imagePreview} alt="Vista previa de la imagen" className="rounded-lg w-full h-full object-cover border-2 border-slate-700"/>
                        <button 
                            onClick={handleRemoveImage}
                            className="absolute -top-2 -right-2 bg-slate-800 hover:bg-red-600 text-white rounded-full p-1.5 transition-all opacity-50 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                            aria-label="Eliminar imagen"
                        >
                            <X size={18}/>
                        </button>
                    </div>
                )}

                <div className="mt-3 flex flex-col sm:flex-row justify-between items-center gap-4">
                     <div className="flex items-stretch gap-2 w-full sm:w-auto">
                        <label className="flex items-center justify-center gap-2 cursor-pointer px-4 py-2 bg-slate-700 text-slate-200 font-semibold rounded-lg shadow-sm hover:bg-slate-600 transition-all duration-200" title="Añadir imagen">
                            <ImagePlus className="w-5 h-5" />
                            <span className="text-sm hidden sm:inline">Imagen</span>
                            <input type="file" className="hidden" accept="image/*,image/webp" onChange={handleImageChange} disabled={isLoading} />
                        </label>
                        <DepthSelector selected={depth} onSelect={setDepth} />
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || (!inputText.trim() && !imageFile)}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 transition-all duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isLoading ? (
                            <>
                                <Loader />
                                Generando...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Generar Tarjeta
                            </>
                        )}
                    </button>
                </div>
                 <p className="text-xs text-slate-500 mt-3 text-center sm:text-left">
                    Atajos: <kbd className="font-sans font-semibold">Ctrl</kbd> + <kbd className="font-sans font-semibold">Enter</kbd> para generar, <kbd className="font-sans font-semibold">Ctrl</kbd> + <kbd className="font-sans font-semibold">V</kbd> para pegar imagen.
                </p>
            </div>

            <div className="mt-4 min-h-[400px]">
                {isLoading && (
                    <div className="flex justify-center items-center h-full">
                         <div className="text-center">
                            <Loader size="lg"/>
                            <p className="text-slate-400 mt-4 text-lg">Analizando y estructurando tu contenido...</p>
                        </div>
                    </div>
                )}
                {message && (
                     <div className={`p-4 rounded-lg text-center animate-fade-in
                        ${message.type === 'error' 
                            ? 'bg-red-900/50 border border-red-700 text-red-300'
                            : 'bg-yellow-900/50 border border-yellow-700 text-yellow-300'
                        }`}
                    >
                        <h3 className="font-bold text-lg mb-2">
                            {message.type === 'error' ? '¡Ups! Algo salió mal' : '⚠️ Aviso de Contenido'}
                        </h3>
                        <p>{message.text}</p>
                    </div>
                )}
                {!isLoading && !message && cardData && <Flashcard data={cardData} />}
                {!isLoading && !message && !cardData && <WelcomePlaceholder />}
            </div>
        </div>
    );
}