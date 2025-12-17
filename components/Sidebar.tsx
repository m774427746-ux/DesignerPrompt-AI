import React from 'react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const menuItems = [
    { id: AppView.DASHBOARD, label: 'Overview', icon: 'M4 6h16M4 12h16M4 18h16' }, // Menu icon
    { id: AppView.CHAT, label: 'Design Chat', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' }, // Chat bubble
    { id: AppView.PROMPT_LAB, label: 'Prompt Lab', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' }, // Edit/Pen
    { id: AppView.IMAGE_STUDIO, label: 'Image Studio', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' }, // Image
    { id: AppView.VIDEO_STUDIO, label: 'Video Studio', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' } // Video
  ];

  return (
    <div className="w-20 lg:w-64 bg-mosab-dark border-r border-slate-800 flex flex-col h-full shrink-0 transition-all duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-mosab-blue flex items-center justify-center shrink-0">
          <span className="font-bold text-white">M</span>
        </div>
        <h1 className="text-xl font-bold text-white hidden lg:block tracking-tight">Design AI</h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-colors ${
              currentView === item.id
                ? 'bg-mosab-blue text-white shadow-lg shadow-mosab-blue/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
            }`}
          >
            <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
            </svg>
            <span className="font-medium hidden lg:block">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-mosab-cyan to-mosab-blue"></div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-white">Mosab's Assistant</p>
            <p className="text-xs text-slate-500">Pro Version</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;