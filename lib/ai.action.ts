import puter from "@heyputer/puter.js";
import { ROOMIFY_RENDER_PROMPT } from "./constants";

export interface Generate3DViewParams {
    sourceImage: string;
    projectId?: string | null;
}

export const fetchAsDataUrl = async (url: string): Promise<string> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const blob = await response.blob();

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error("Failed to convert blob to Data URL"));
            }
        };
        reader.onerror = () => reject(new Error("FileReader error"));
        reader.readAsDataURL(blob);
    });
};

export const generate3Dview = async ({ sourceImage }: Generate3DViewParams) => {
    try {
        const dataUrl = sourceImage.startsWith('data:')
            ? sourceImage
            : await fetchAsDataUrl(sourceImage);

        const base64Data = dataUrl.split(',')[1];
        const mimeType = dataUrl.split(';')[0].split(':')[1];

        if (!mimeType || !base64Data) {
            throw new Error('Invalid source image payload');
        }

        console.log('Generating 3D view with model: gemini-2.5-flash-image-preview');
        const response = await puter.ai.txt2img(ROOMIFY_RENDER_PROMPT, {
            provider: 'gemini',
            model: 'gemini-2.5-flash-image-preview',
            input_image: base64Data,
            input_image_mime_type: mimeType,
            ratio:{w: 1024, h:1024},
        });

        console.log('AI response received:', response);

        // Puter returns a PuterImage object or array of PuterImage objects
        const image = Array.isArray(response) ? response[0] : response;
        const rawImageUrl = image?.src;

        if (!rawImageUrl) {
            console.error('No image URL in AI response');
            return { renderedImage: null, renderedPath: undefined };
        }

        const renderedImage = rawImageUrl.startsWith('data:')
            ? rawImageUrl
            : await fetchAsDataUrl(rawImageUrl);

        return { renderedImage, renderedPath: undefined };
    } catch (error) {
        console.error('Error in generate3Dview:', error);
        throw error;
    }
};