import React, { useState } from 'react';
import { ImageMode } from '../types';
import { analyzeImageForDesign, editDesignImage, generateDesignImage } from '../services/geminiService';
import { ASPECT_RATIOS, RESOLUTIONS } from '../constants';

const ImageStudio: React.FC = () => {
  const [mode, setMode] = useState<ImageMode>(ImageMode.GENERATE);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [resolution, setResolution] = useState('1K');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [analysisText, setAnalysisText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
      setResultImage(null); // Clear previous results
      setAnalysisText('');
    }
  };

  const fileToGenerativePart = async (file: File): Promise<{ data: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve({
          data: base64String,
          mimeType: file.type,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleExecute = async () => {
    setLoading(true);
    setError(null);
    setResultImage(null);
    setAnalysisText('');

    try {
      if (mode === ImageMode.GENERATE) {
        if (!prompt) throw new Error("Prompt is required");
        const img = await generateDesignImage(prompt, aspectRatio, resolution);
        setResultImage(img);
      } 
      else if (mode === ImageMode.EDIT) {
        if (!selectedImage || !prompt) throw new Error("Image and edit instructions are required");
        const imgData = await fileToGenerativePart(selectedImage);
        const img = await editDesignImage(imgData.data, imgData.mimeType, prompt);
        setResultImage(img);
      } 
      else if (mode === ImageMode.ANALYZE) {
        if (!selectedImage) throw new Error("Image is required");
        const imgData = await fileToGenerativePart(selectedImage);
        const analysis = await analyzeImageForDesign(imgData.data, imgData.mimeType);
        setAnalysisText(analysis);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-mosab-surface rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
      {/* Header Tabs */}
      <div className="flex border-b border-slate-800 bg-mosab-dark/50">
        {[ImageMode.GENERATE, ImageMode.EDIT, ImageMode.ANALYZE].map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setError(null); }}
            className={`flex-1 py-4 text-sm font-semibold tracking-wide transition-colors ${
              mode === m 
                ? 'text-mosab-cyan border-b-2 border-mosab-cyan bg-slate-800/50' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            {m === ImageMode.GENERATE ? 'GENERATE PRO (3.0)' : m === ImageMode.EDIT ? 'EDIT (NANO BANANA)' : 'ANALYZE (3.0)'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {/* Image Input for Edit/Analyze */}
            {(mode === ImageMode.EDIT || mode === ImageMode.ANALYZE) && (
              <div className="p-4 border-2 border-dashed border-slate-700 rounded-xl bg-slate-900/50 hover:border-mosab-blue/50 transition-colors">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-mosab-blue file:text-white hover:file:bg-blue-600"
                />
                {imagePreview && (
                  <div className="mt-4 relative rounded-lg overflow-hidden h-48 w-full bg-black">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>
            )}

            {/* Configs for Generate */}
            {mode === ImageMode.GENERATE && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Aspect Ratio</label>
                  <select 
                    value={aspectRatio} 
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-mosab-cyan outline-none"
                  >
                    {ASPECT_RATIOS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Resolution</label>
                  <select 
                    value={resolution} 
                    onChange={(e) => setResolution(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-mosab-cyan outline-none"
                  >
                    {RESOLUTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Prompt Input */}
            {mode !== ImageMode.ANALYZE && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {mode === ImageMode.GENERATE ? 'Describe your imagination' : 'Describe the edit'}
                </label>
                <textarea
                  value={prompt}
                  dir="auto"
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={mode === ImageMode.GENERATE ? "A futuristic skyscraper in neo-tokyo style... / مشهد مستقبلي..." : "Add a vintage filter, remove the background..."}
                  className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-mosab-cyan outline-none resize-none"
                />
              </div>
            )}

            <button
              onClick={handleExecute}
              disabled={loading || (mode === ImageMode.GENERATE && !prompt) || ((mode === ImageMode.EDIT || mode === ImageMode.ANALYZE) && !selectedImage)}
              className="w-full bg-gradient-to-r from-mosab-blue to-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Processing...' : mode}
            </button>
            
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Results Area */}
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 flex flex-col items-center justify-center min-h-[400px]">
             {loading ? (
               <div className="text-center">
                 <div className="w-12 h-12 border-4 border-mosab-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                 <p className="text-slate-400 animate-pulse">Creating masterpiece...</p>
               </div>
             ) : resultImage ? (
               <div className="w-full h-full flex flex-col items-center">
                 <img src={resultImage} alt="Generated" className="max-w-full max-h-[500px] object-contain rounded-lg shadow-2xl" />
                 <a 
                   href={resultImage} 
                   download={`mosab-design-${Date.now()}.png`}
                   className="mt-4 text-mosab-cyan hover:text-white text-sm font-medium flex items-center gap-2"
                 >
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                   Download Image
                 </a>
               </div>
             ) : analysisText ? (
                <div className="w-full text-left" dir="auto">
                  <h3 className="text-mosab-cyan font-bold mb-4 text-lg">Analysis Result</h3>
                  <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
                    {analysisText}
                  </div>
                </div>
             ) : (
               <div className="text-slate-600 flex flex-col items-center">
                 <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                 </svg>
                 <p>Result will appear here</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageStudio;