import React, { useState } from 'react';
import { generateVeoVideo } from '../services/geminiService';

const VideoStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
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

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setVideoUrl(null);
    setStatus('Initializing Veo model...');

    try {
      let base64Data = undefined;
      let mimeType = undefined;

      if (selectedImage) {
        const imgData = await fileToGenerativePart(selectedImage);
        base64Data = imgData.data;
        mimeType = imgData.mimeType;
        setStatus('Processing image reference...');
      }

      setStatus('Generating video... this may take a moment.');
      const url = await generateVeoVideo(prompt, aspectRatio, base64Data, mimeType);
      setVideoUrl(url);
    } catch (err: any) {
      setError(err.message || "Video generation failed.");
      if (err.message.includes("not found") && window.aistudio) {
          setError("API Key Error. Please re-select your key.");
          // Optionally auto-trigger select again
          // await window.aistudio.openSelectKey(); 
      }
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-mosab-surface rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
      <div className="p-4 border-b border-slate-800 bg-mosab-dark/50 flex items-center gap-2">
         <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
         <h2 className="text-lg font-semibold text-white">Veo Video Studio</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          
          <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30 text-sm text-blue-200" dir="auto">
            <strong>Note:</strong> Video generation requires a paid Google Cloud Project API Key. You will be prompted to select one.
             <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline ml-2">Read Docs</a>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Aspect Ratio</label>
             <div className="flex gap-4">
               {['16:9', '9:16'].map(r => (
                 <button 
                   key={r}
                   onClick={() => setAspectRatio(r)}
                   className={`px-4 py-2 rounded-lg border ${aspectRatio === r ? 'border-mosab-cyan bg-mosab-cyan/10 text-mosab-cyan' : 'border-slate-700 bg-slate-900 text-slate-400'}`}
                 >
                   {r}
                 </button>
               ))}
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Prompt (Required)</label>
            <textarea
              value={prompt}
              dir="auto"
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A cinematic drone shot of a futuristic city..."
              className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-mosab-cyan outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Start Image (Optional)</label>
            <div className="p-4 border-2 border-dashed border-slate-700 rounded-xl bg-slate-900/50 hover:border-mosab-blue/50 transition-colors">
              <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-mosab-blue file:text-white hover:file:bg-blue-600"
                />
               {imagePreview && (
                  <div className="mt-4 relative rounded-lg overflow-hidden h-32 w-full bg-black">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                )}
            </div>
          </div>

          <button
              onClick={handleGenerate}
              disabled={loading || !prompt}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-purple-500/20 disabled:opacity-50 transition-all"
            >
              {loading ? 'Generating...' : 'Generate Video'}
          </button>
          
          {error && <div className="text-red-400 text-sm">{error}</div>}
        </div>

        <div className="bg-black rounded-xl border border-slate-800 flex items-center justify-center min-h-[400px]">
           {loading ? (
             <div className="text-center p-8">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-300 font-medium">{status}</p>
             </div>
           ) : videoUrl ? (
             <div className="w-full h-full flex flex-col p-4">
                <video controls className="w-full h-auto max-h-[500px] rounded-lg shadow-2xl bg-slate-900" src={videoUrl}>
                  Your browser does not support the video tag.
                </video>
                <a href={videoUrl} download="veo-generation.mp4" className="mt-4 text-center text-purple-400 hover:text-white">Download MP4</a>
             </div>
           ) : (
             <div className="text-slate-600 flex flex-col items-center">
                 <svg className="w-20 h-20 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                 <p>Veo generation output</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default VideoStudio;