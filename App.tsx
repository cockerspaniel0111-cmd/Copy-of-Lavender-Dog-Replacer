import React, { useState } from 'react';
import { ArrowRight, RefreshCw, Download, Image as ImageIcon, Key } from 'lucide-react';
import { FileUploader } from './components/FileUploader';
import { replaceDogsInScene } from './services/geminiService';

const App: React.FC = () => {
  const [sceneImage, setSceneImage] = useState<File | null>(null);
  const [scenePreview, setScenePreview] = useState<string | null>(null);
  
  const [refImage, setRefImage] = useState<File | null>(null);
  const [refPreview, setRefPreview] = useState<string | null>(null);

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApiKeySelect = async () => {
    // Cast window to any to safely access aistudio property
    const aiStudio = (window as any).aistudio;
    if (aiStudio) {
      try {
        await aiStudio.openSelectKey();
        setError(null); // Clear error after selecting key so user can try again
      } catch (e) {
        console.error("Error selecting key", e);
      }
    }
  };

  const handleSceneUpload = (file: File) => {
    setSceneImage(file);
    setScenePreview(URL.createObjectURL(file));
    setGeneratedImage(null);
    setError(null);
  };

  const handleRefUpload = (file: File) => {
    setRefImage(file);
    setRefPreview(URL.createObjectURL(file));
    setGeneratedImage(null);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!sceneImage || !refImage) return;

    setLoading(true);
    setError(null);

    try {
      const result = await replaceDogsInScene(sceneImage, refImage);
      if (result) {
        setGeneratedImage(result);
      } else {
        setError("Failed to generate image. The model might not have returned an image.");
      }
    } catch (err: any) {
      // Check specifically for the quota error to prompt key selection inline
      if (err.message && (err.message.includes('429') || err.message.includes('Quota'))) {
         setError("Quota exceeded. Please select a paid API Key.");
      } else {
         setError(err.message || "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-purple-50 text-slate-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto relative">
        {/* API Key Button - Top Right */}
        <div className="absolute top-0 right-0 z-10">
          <button 
            onClick={handleApiKeySelect}
            className="flex items-center gap-2 px-4 py-2 bg-white/60 hover:bg-white text-purple-800 rounded-full text-sm font-medium transition-all shadow-sm border border-purple-200 backdrop-blur-sm hover:shadow-md"
            title="Configure Google API Key"
          >
            <Key className="w-4 h-4" />
            <span className="hidden sm:inline">Set API Key</span>
          </button>
        </div>

        <header className="mb-10 text-center pt-8 md:pt-4">
          <h1 className="text-3xl md:text-5xl font-bold text-purple-900 mb-4">
            Dog Composition Swapper
          </h1>
          <p className="text-purple-700 max-w-2xl mx-auto">
            Upload the original lavender scene and a new dog photo. The AI will replace the dogs while keeping the design, butterflies, and background exactly the same.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Input Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-xl shadow-purple-100 border border-purple-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-purple-900">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-xs">1</span>
                Original Scene (Template)
              </h2>
              <FileUploader 
                onFileSelect={handleSceneUpload} 
                preview={scenePreview} 
                label="Upload the lavender field image"
              />
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xl shadow-purple-100 border border-purple-100">
               <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-purple-900">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-xs">2</span>
                New Dog Reference
              </h2>
              <FileUploader 
                onFileSelect={handleRefUpload} 
                preview={refPreview} 
                label="Upload the new dog photo"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!sceneImage || !refImage || loading}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2
                ${(!sceneImage || !refImage) 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : loading 
                    ? 'bg-purple-400 text-white cursor-wait' 
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'
                }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Generate Swap <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm flex flex-col gap-3">
                <p>{error}</p>
                <button 
                  onClick={handleApiKeySelect}
                  className="flex items-center justify-center gap-2 py-2 px-4 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors w-full"
                >
                  <Key className="w-4 h-4" />
                  Select Different API Key
                </button>
              </div>
            )}
          </div>

          {/* Output Section */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-2xl shadow-xl shadow-purple-100 border border-purple-100 min-h-[600px] flex flex-col">
              <h2 className="text-lg font-semibold mb-4 text-purple-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Result
              </h2>
              
              <div className="flex-1 bg-slate-50 rounded-xl border-2 border-dashed border-purple-200 flex items-center justify-center overflow-hidden relative">
                {generatedImage ? (
                  <img 
                    src={generatedImage} 
                    alt="AI Generated Result" 
                    className="w-full h-full object-contain"
                  />
                ) : loading ? (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
                    <p className="text-purple-600 font-medium animate-pulse">Designing new image...</p>
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <div className="w-16 h-16 bg-purple-100 text-purple-300 rounded-full flex items-center justify-center mx-auto mb-3">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <p>Generated image will appear here</p>
                  </div>
                )}
              </div>

              {generatedImage && (
                <div className="mt-6 flex justify-end">
                  <a 
                    href={generatedImage} 
                    download="dog-swap-result.png"
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    Download Image
                  </a>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;