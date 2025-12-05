import { GoogleGenAI } from "@google/genai";

/**
 * Converts a File object to a Base64 string.
 */
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      // Remove the Data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Content = base64Data.split(',')[1];
      resolve({
        inlineData: {
          data: base64Content,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Calls Gemini to replace the dogs in the scene image with the dog in the reference image.
 */
export const replaceDogsInScene = async (sceneImage: File, refImage: File): Promise<string | null> => {
  try {
    // Initialize the client inside the function to ensure it uses the latest process.env.API_KEY
    // which might have been set by the user via the selection dialog.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const scenePart = await fileToGenerativePart(sceneImage);
    const refPart = await fileToGenerativePart(refImage);

    // Prompt engineering to ensure specific user request is met
    // The user wants to preserve the design (lavender, butterflies, layout) but swap the dogs.
    const prompt = `
      Instructions:
      1. Look at the first image (the composition/scene). It contains dogs in a lavender field with butterflies and a pink background.
      2. Look at the second image (the reference dog).
      3. Create a NEW image that looks EXACTLY like the first image in terms of layout, background color, lavender flowers, and butterfly placement.
      4. However, replace the dogs in the first image with the specific dog breed/appearance from the second image.
      5. The new dogs should be in similar poses and positions as the original dogs to maintain the composition.
      6. Do not change the pink background or the floral arrangement.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Using flash-image for efficiency and vision capabilities
      contents: {
        parts: [
          scenePart,
          { text: "This is the Scene Image to modify:" },
          refPart,
          { text: "This is the Reference Dog Image:" },
          { text: prompt }
        ]
      },
      config: {
        // We do not set responseMimeType for image generation models usually, 
        // but we expect an image in the response parts.
      }
    });

    // Iterate through parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    // Fallback if no image found in parts (rare for image model but possible if blocked)
    console.error("No image data found in response");
    return null;

  } catch (error) {
    console.error("Error generating image:", error);
    throw error; // Re-throw to be handled by the UI
  }
};
