import React, { useState } from 'react';
import { enhancePrompt } from '../services/geminiService';
import { PROMPT_STYLES } from '../constants';

const PromptStudio: React.FC = () => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(PROMPT_STYLES[0]);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEnhance = async () => {
    if (!inputPrompt) return;
    setLoading(true);
    try {
      const enhanced = await enhancePrompt(inputPrompt, selectedStyle);
      setResult(enhanced);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    // Could add toast notification here
  };

  return (
    <div className="flex flex-col h-full bg-mosab-surface rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
      <div className="p-4 border-b border-slate-800 bg-mosab-dark/50">
        <h2 className="text-lg font-semibold text-white">Prompt Lab</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="md:col-span-2 space-y-4">
             <div>
               <label className="block text-sm font-medium text-slate-400 mb-2">Base Idea</label>
               <textarea 
                  value={inputPrompt}
                  dir="auto"
                  onChange={(e) => setInputPrompt(e.target.value)}
                  className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-200 focus:border-mosab-blue outline-none placeholder-slate-600"
                  placeholder="e.g. A red car in the rain..."
               />
             </div>
             
             <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Target Style</label>
                <div className="flex flex-wrap gap-2">
                  {PROMPT_STYLES.map(style => (
                    <button
                      key={style}
                      onClick={() => setSelectedStyle(style)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        selectedStyle === style
                          ? 'bg-mosab-blue text-white border-mosab-blue'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
             </div>

             <button
               onClick={handleEnhance}
               disabled={loading || !inputPrompt}
               className="bg-white text-mosab-dark font-bold py-3 px-8 rounded-xl hover:bg-mosab-cyan hover:text-white transition-colors"
             >
               {loading ? 'Enhancing...' : 'Enhance Prompt'}
             </button>
          </div>

          {/* Tips Section */}
          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 h-fit" dir="auto">
            <h3 className="text-mosab-cyan font-bold mb-3">Mosab's Tips</h3>
            <ul className="text-sm text-slate-400 space-y-2 list-disc list-inside">
              <li>Be specific about lighting (e.g., "volumetric lighting").</li>
              <li>Mention camera angles (e.g., "low angle", "wide shot").</li>
              <li>Define textures and materials clearly.</li>
              <li>Avoid contradictory terms.</li>
            </ul>
          </div>
        </div>

        {/* Output Section */}
        {result && (
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 relative group animate-fade-in" dir="auto">
             <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={copyToClipboard} className="bg-slate-800 text-white text-xs px-3 py-1 rounded border border-slate-600 hover:bg-slate-700">
                 Copy
               </button>
             </div>
             <h3 className="text-sm font-bold text-mosab-cyan mb-2">Refined Prompt</h3>
             <p className="text-slate-200 leading-relaxed font-mono text-sm whitespace-pre-wrap">{result}</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default PromptStudio;