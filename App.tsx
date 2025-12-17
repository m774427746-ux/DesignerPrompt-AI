import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import ImageStudio from './components/ImageStudio';
import VideoStudio from './components/VideoStudio';
import PromptStudio from './components/PromptStudio';
import { AppView } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);

  const renderContent = () => {
    switch (currentView) {
      case AppView.CHAT:
        return <ChatInterface />;
      case AppView.IMAGE_STUDIO:
        return <ImageStudio />;
      case AppView.VIDEO_STUDIO:
        return <VideoStudio />;
      case AppView.PROMPT_LAB:
        return <PromptStudio />;
      case AppView.DASHBOARD:
      default:
        return (
          <div className="flex flex-col h-full items-center justify-center text-center p-8 space-y-8 animate-fade-in">
             <div className="w-24 h-24 bg-gradient-to-tr from-mosab-blue to-mosab-cyan rounded-3xl flex items-center justify-center mb-4 shadow-2xl shadow-mosab-blue/30">
                <span className="text-5xl font-bold text-white">M</span>
             </div>
             <div>
               <h1 className="text-4xl font-bold text-white mb-4">Welcome to Mosab Design AI</h1>
               <p className="text-slate-400 max-w-lg mx-auto text-lg">
                 Your specialized creative partner. Generate prompts, create visuals, analyze composition, and produce videos with professional-grade AI tools.
               </p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mt-8">
               <button onClick={() => setCurrentView(AppView.CHAT)} className="p-6 bg-slate-800 border border-slate-700 rounded-xl hover:border-mosab-blue transition-all group text-left">
                  <h3 className="text-white font-bold text-lg mb-2 group-hover:text-mosab-cyan">Start a Chat</h3>
                  <p className="text-sm text-slate-500">Ask design questions or get quick advice.</p>
               </button>
               <button onClick={() => setCurrentView(AppView.IMAGE_STUDIO)} className="p-6 bg-slate-800 border border-slate-700 rounded-xl hover:border-mosab-blue transition-all group text-left">
                  <h3 className="text-white font-bold text-lg mb-2 group-hover:text-mosab-cyan">Generate Images</h3>
                  <p className="text-sm text-slate-500">Create, edit, or analyze visuals.</p>
               </button>
             </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-mosab-dark overflow-hidden font-sans">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      <main className="flex-1 p-4 lg:p-6 overflow-hidden relative">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;