
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { 
    GoogleGenAI, 
    GenerateContentResponse, 
    Modality, 
    Type, 
    HarmBlockThreshold, 
    HarmCategory,
    Part,
    Content
} from "@google/genai";

const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
];

/**
 * Obtém a chave de API de forma dinâmica.
 * Prioriza chaves injetadas pelo bridge do AI Studio ou variáveis de ambiente.
 */
const getAiKey = (): string => {
    const key = process.env.API_KEY;
    // Verifica se a chave é válida e não é um placeholder de build ("undefined" ou "null")
    if (key && key !== "undefined" && key !== "null" && key.length > 5) {
        return key;
    }
    
    // Fallback para o objeto window caso o define do Vite tenha falhado
    const windowKey = (window as any).process?.env?.API_KEY;
    if (windowKey && windowKey !== "undefined" && windowKey !== "null") {
        return windowKey;
    }

    return "";
};

/**
 * Crucial: Sempre cria uma nova instância do cliente com a chave mais atual.
 */
const getAiClient = () => {
    const apiKey = getAiKey();
    if (!apiKey) {
        throw new Error("API_KEY_REQUIRED: Por favor, clique no botão 'Entrar com Google' no topo para conectar sua conta e usar os modelos de IA.");
    }
    return new GoogleGenAI({ apiKey });
};

/**
 * Converts a File object to a Generative AI Part object containing base64 data.
 */
const fileToGenerativePart = async (file: File): Promise<Part> => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
    
    const arr = dataUrl.split(',');
    if (arr.length < 2) throw new Error("Invalid data URL");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Could not parse MIME type from data URL");
    
    return { inlineData: { mimeType: mimeMatch[1], data: arr[1] } };
};

/**
 * Parses the Gemini API response to extract the generated image data URL.
 */
const handleApiResponse = (response: GenerateContentResponse, context: string): string => {
    if (response.candidates?.[0]?.finishReason === 'SAFETY') {
        throw new Error(`A solicitação foi bloqueada pelos filtros de segurança da IA. Tente um prompt diferente.`);
    }

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
        for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }
    
    throw new Error(`Nenhuma imagem retornada para ${context}.`);
};

/**
 * Executa uma operação assíncrona com lógica de retry e tratamento específico para troca de chaves.
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
        return await fn();
    } catch (error: any) {
        if (error.message?.includes("Requested entity was not found")) {
            if (typeof (window as any).aistudio !== 'undefined' && (window as any).aistudio.openSelectKey) {
                 await (window as any).aistudio.openSelectKey();
                 return withRetry(fn, retries, delay); 
            }
        }

        if (retries > 0 && (error.status === 429 || error.status >= 500)) {
            await new Promise(resolve => setTimeout(resolve, delay));
            return withRetry(fn, retries - 1, delay * 2);
        }
        
        throw error;
    }
}

// --- Funções do Serviço ---

export const enhancePrompt = async (originalPrompt: string): Promise<string> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Aprimore este prompt de geração de imagem para torná-lo mais descritivo e artístico: "${originalPrompt}"`,
        });
        return response.text?.trim() || originalPrompt;
    });
};

export const generateImages = async (
    prompt: string, 
    numImages: number, 
    aspectRatio: string, 
    quality: 'standard' | 'pro', 
    imageSize: string
): Promise<string[]> => {
    const model = quality === 'pro' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
    
    const promises = Array(numImages).fill(null).map(async () => {
        return withRetry(async () => {
            const ai = getAiClient();
            const response = await ai.models.generateContent({
                model: model,
                contents: { parts: [{ text: prompt }] },
                config: {
                    safetySettings,
                    imageConfig: {
                        aspectRatio: aspectRatio as any,
                        imageSize: quality === 'pro' ? imageSize as any : undefined
                    }
                }
            });
            return handleApiResponse(response, 'geração de imagem');
        });
    });

    return await Promise.all(promises);
};

export const generateVideo = async (prompt: string, image?: File): Promise<string> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const model = 'veo-3.1-fast-generate-preview';
        
        let operation;
        if (image) {
            const imagePart = await fileToGenerativePart(image);
            if (!imagePart.inlineData) throw new Error("Falha ao processar imagem para vídeo");
            
            operation = await ai.models.generateVideos({
                model,
                prompt,
                image: {
                    imageBytes: imagePart.inlineData.data,
                    mimeType: imagePart.inlineData.mimeType as any
                },
                config: { aspectRatio: '16:9' } 
            });
        } else {
            operation = await ai.models.generateVideos({
                model,
                prompt,
                config: { aspectRatio: '16:9' }
            });
        }

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        if (operation.error) throw new Error(operation.error.message);
        
        return operation.response?.generatedVideos?.[0]?.video?.uri || '';
    });
};

// --- Ferramentas de Edição ---

export const generateInpaintedImage = async (image: File, mask: File, prompt: string) => {
    return _generateImageEdit(image, `Preencha a área mascarada: ${prompt}`, 'inpainting', mask);
};

export const generateRetouchImage = async (image: File, mask: File, prompt: string) => {
    return _generateImageEdit(image, `Retoque a área mascarada: ${prompt}`, 'retouch', mask);
};

export const generateSelectiveAdjustment = async (image: File, mask: File, prompt: string) => {
    return _generateImageEdit(image, `Ajuste apenas a área mascarada: ${prompt}`, 'selective adjust', mask);
};

export const generateFilteredImage = async (image: File, filterPrompt: string) => {
    return _generateImageEdit(image, `Aplique este filtro: ${filterPrompt}`, 'filter');
};

export const generateLuckyFilterImage = async (image: File) => {
    let specificPrompt = "Aplique um filtro artístico e criativo.";
    try {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [
                    imagePart,
                    { text: "Analise esta imagem e sugira um estilo de filtro artístico único. Retorne apenas o texto do filtro." }
                ]
            }
        });
        if (response.text) specificPrompt = response.text.trim();
    } catch (e) { console.warn(e); }

    return _generateImageEdit(image, specificPrompt, 'lucky filter');
};

export const generateAdjustedImage = async (image: File, adjustmentPrompt: string) => {
    return _generateImageEdit(image, `Ajuste a imagem: ${adjustmentPrompt}`, 'adjustment');
};

export const generateExpandedImage = async (image: File, expansionPrompt: string) => {
    return _generateImageEdit(image, `Preencha as áreas transparentes para expandir a cena: ${expansionPrompt}`, 'expand');
};

export const generateUpscaledImage = async (image: File, scale: number) => {
    return _generateImageEdit(image, `Aumente a resolução em ${scale}x.`, 'upscale', undefined, 'gemini-3-pro-image-preview');
};

export const generateEnhancedImage = async (image: File, intensity: string) => {
    return _generateImageEdit(image, `Melhore a qualidade da imagem (intensidade ${intensity}).`, 'enhance');
};

export const generateRestoredImage = async (image: File, prompt: string) => {
    return _generateImageEdit(image, `Restaure esta foto antiga: ${prompt}`, 'restore');
};

export const generateRemovedBackgroundImage = async (image: File) => {
    return _generateImageEdit(image, "Remova o fundo da imagem.", 'remove bg');
};

export const generateReplacedBackgroundImage = async (image: File, prompt: string) => {
    return _generateImageEdit(image, `Substitua o fundo por: ${prompt}`, 'replace bg');
};

export const generateProductBackgroundImage = async (image: File, name: string, customPrompt?: string) => {
    const p = customPrompt || `cenário para ${name}`;
    return _generateImageEdit(image, `Coloque este produto em um ambiente profissional de ${p}.`, 'product bg');
};

export const generateProductShadowImage = async (image: File) => {
    return _generateImageEdit(image, "Adicione uma sombra realista para o objeto.", 'product shadow');
};

export const generateAddedProductImage = async (image: File, mask: File, prompt: string) => {
    return _generateImageEdit(image, `Adicione ${prompt} na área mascarada.`, 'add product', mask);
};

export const generateCardImage = async (image: File, cardPrompt: string) => {
    return _generateImageEdit(image, cardPrompt, 'cardify', undefined, 'gemini-3-pro-image-preview');
};

export const generateSketchImage = async (image: File, prompt: string) => {
    return _generateImageEdit(image, `Transforme este esboço em uma imagem realista: ${prompt}`, 'sketch to image');
};

export const generateFocusImage = async (image: File, intensity: string) => {
    return _generateImageEdit(image, `Aplique um efeito de profundidade de campo ${intensity}.`, 'focus');
};

export const generateMergedImage = async (base: File, overlay: File, prompt: string) => {
    return withRetry(async () => {
        const ai = getAiClient();
        const parts = [
            await fileToGenerativePart(base),
            await fileToGenerativePart(overlay),
            { text: `Combine estas duas imagens: ${prompt}` }
        ];
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts }
        });
        return handleApiResponse(response, 'merge');
    });
};

export const generateColorPalette = async (image: File): Promise<string[]> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [
                    imagePart, 
                    { text: "Extraia as 5 cores hexadecimais mais dominantes. Retorne apenas um array JSON." }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    });
};

export const applyColorPalette = async (image: File, palette: string[], selectedColor: string) => {
    return _generateImageEdit(image, `Recolora a imagem usando estas cores: ${palette.join(', ')}. Dê ênfase à cor ${selectedColor}.`, 'apply palette');
};

export const generateRecoloredImage = async (image: File, source: string, target: string, tolerance: number) => {
    return _generateImageEdit(image, `Substitua a cor ${source} pela cor ${target} (tolerância ${tolerance}).`, 'recolor');
};

export const generateStyledImage = async (image: File, styleImage: File) => {
    return withRetry(async () => {
        const ai = getAiClient();
        const parts = [
            await fileToGenerativePart(image),
            await fileToGenerativePart(styleImage),
            { text: "Aplique o estilo da segunda imagem na primeira." }
        ];
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts }
        });
        return handleApiResponse(response, 'style transfer');
    });
};

export const generateCaptions = async (image: File): Promise<{captions: string[], sources: any[]}> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: {
                parts: [imagePart, { text: "Gere 3 legendas criativas para esta imagem." }]
            },
            config: {
                tools: [{ googleSearch: {} }]
            }
        });
        
        const lines = response.text?.split('\n').filter(l => l.trim().length > 0) || [];
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        
        return { captions: lines.slice(0, 3), sources };
    });
};

export const generateImageVariations = async (image: File, creativity: string): Promise<string[] | null> => {
    const prompt = `Gere 4 variações criativas desta imagem. Nível de criatividade: ${creativity}.`;
    const promises = Array(4).fill(null).map(async () => {
        return withRetry(async () => {
            const ai = getAiClient();
            const imagePart = await fileToGenerativePart(image);
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [imagePart, { text: prompt }] }
            });
            return handleApiResponse(response, 'variation');
        });
    });
    return Promise.all(promises);
};

export const generatePromptSuggestions = async (image: File, context: 'add' | 'replace'): Promise<string[]> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const text = context === 'add' ? "Sugira 5 objetos para adicionar. Retorne um array JSON." : "Sugira 5 modificações. Retorne um array JSON.";
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: { parts: [imagePart, { text }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        });
        return JSON.parse(response.text || "[]");
    });
};

export const generateCreativeText = async (image: File, type: 'quote' | 'caption' | 'pun'): Promise<{ text: string, color: string }> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [imagePart, { text: `Gere um(a) ${type} criativo(a) para esta imagem. Retorne JSON {text, color}.` }]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { text: { type: Type.STRING }, color: { type: Type.STRING } }
                }
            }
        });
        return JSON.parse(response.text || '{"text": "", "color": "#ffffff"}');
    });
};

export const detectObjects = async (image: File, label: string): Promise<Array<{ ymin: number, xmin: number, ymax: number, xmax: number }>> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [imagePart, { text: `Detecte "${label}". Retorne array JSON de {ymin, xmin, ymax, xmax}.` }]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: { ymin: { type: Type.NUMBER }, xmin: { type: Type.NUMBER }, ymax: { type: Type.NUMBER }, xmax: { type: Type.NUMBER } }
                    }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    });
};

export const generateSegmentationMask = async (image: File, label: string): Promise<string | null> => {
    return _generateImageEdit(image, `Gere uma máscara de segmentação para: "${label}".`, 'mask');
};

export const generateExpansionSuggestions = async (image: File): Promise<Array<{ direction: 'top' | 'bottom' | 'left' | 'right', prompt: string }>> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [imagePart, { text: "Sugira ideias de expansão de imagem. Retorne array JSON {direction, prompt}." }]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: { direction: { type: Type.STRING }, prompt: { type: Type.STRING } }
                    }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    });
};

export const generateAutoAdjustments = async (image: File): Promise<Record<string, number>> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [imagePart, { text: "Sugira ajustes automáticos (brilho, contraste, etc). Retorne JSON." }]
            },
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "{}");
    });
};

export const generateLuckyAdjustment = async (image: File): Promise<string> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [imagePart, { text: "Dê uma instrução de ajuste criativo surpreendente para esta imagem." }]
            }
        });
        return response.text || "Ajuste criativo!";
    });
};

export const generateCardDetails = async (image: File, cardType: string): Promise<any> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [imagePart, { text: `Gere detalhes temáticos para um card do tipo ${cardType}. Retorne JSON.` }]
            },
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "{}");
    });
};

export const inspectImage = async (image: File): Promise<any> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [
                    imagePart, 
                    { text: "Inspecione profundamente esta imagem. Identifique os principais objetos, as cores dominantes, o estilo artístico, a composição e iluminação. Além disso, forneça 3 sugestões de estilos criativos para transformar esta imagem. Retorne um objeto JSON." }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        subject: { type: Type.STRING },
                        style: { type: Type.STRING },
                        composition: { type: Type.STRING },
                        lighting: { type: Type.STRING },
                        colors: { type: Type.ARRAY, items: { type: Type.STRING } },
                        prompt: { type: Type.STRING },
                        detectedObjects: { type: Type.ARRAY, items: { type: Type.STRING } },
                        styleSuggestions: { 
                            type: Type.ARRAY, 
                            items: { 
                                type: Type.OBJECT, 
                                properties: { 
                                    title: { type: Type.STRING }, 
                                    description: { type: Type.STRING } 
                                } 
                            } 
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text || "{}");
    });
};

// --- Chat & Analysis ---

export async function* chatWithGeminiStream(
    history: { role: string, text: string }[], 
    message: string, 
    file?: File,
    useReasoning: boolean = false
) {
    const ai = getAiClient();
    const model = useReasoning ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
    
    const chatHistory: Content[] = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text } as Part]
    }));

    const chat = ai.chats.create({
        model: model,
        history: chatHistory
    });

    const parts: Part[] = [{ text: message }];
    if (file) {
        parts.unshift(await fileToGenerativePart(file));
    }

    const result = await chat.sendMessageStream({ message: parts });
    for await (const chunk of result) {
        yield { 
            text: chunk.text, 
            groundingMetadata: chunk.candidates?.[0]?.groundingMetadata 
        };
    }
}

export const analyzeVideo = async (videoFile: File, prompt: string): Promise<string> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const filePart = await fileToGenerativePart(videoFile);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: { parts: [filePart, { text: prompt }] }
        });
        return response.text || "";
    });
};

export const transcribeAudio = async (audioFile: File): Promise<string> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const filePart = await fileToGenerativePart(audioFile);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: { parts: [filePart, { text: "Transcreva este áudio." }] }
        });
        return response.text || "";
    });
};

export const generateSpeech = async (text: string): Promise<ArrayBuffer> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
                }
            }
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("Falha ao gerar fala.");
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
        return bytes.buffer;
    });
};

export const generateSmartReplies = async (history: any[]): Promise<string[]> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Sugira 3 respostas rápidas relevantes. Retorne array JSON.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        });
        return JSON.parse(response.text || "[]");
    });
};

export const generateMemeSuggestions = async (image: File): Promise<string[]> => {
    return withRetry(async () => {
        const ai = getAiClient();
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [imagePart, { text: "Gere 5 legendas engraçadas para meme. Retorne array JSON." }]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        });
        return JSON.parse(response.text || "[]");
    });
};

async function _generateImageEdit(
    image: File, 
    prompt: string, 
    context: string,
    mask?: File,
    model: string = 'gemini-2.5-flash-image'
): Promise<string> {
    return withRetry(async () => {
        const ai = getAiClient();
        const parts: Part[] = [await fileToGenerativePart(image)];
        if (mask) parts.push(await fileToGenerativePart(mask));
        parts.push({ text: prompt });
        const response = await ai.models.generateContent({
            model: model,
            contents: { parts },
            config: { safetySettings }
        });
        return handleApiResponse(response, context);
    });
}
