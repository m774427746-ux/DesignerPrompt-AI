import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { generateChatResponse } from '../services/geminiService';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello. I am your specialized design assistant created by Mosab.\nأهلاً بك. أنا مساعدك الذكي للتصميم من تطوير مصعب. كيف يمكنني مساعدتك في مهامك الإبداعية اليوم؟"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await generateChatResponse(history, userMsg.text, useThinking, useSearch);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        isThinking: useThinking,
        sources: response.sources
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "I encountered an error processing your request. Please try again.\nحدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى."
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-mosab-surface rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-mosab-dark/50 flex justify-between items-center backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-mosab-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Designer Q&A
        </h2>
        
        <div className="flex gap-3">
          <button
            onClick={() => setUseSearch(!useSearch)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              useSearch 
                ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
            }`}
          >
            Google Search {useSearch && 'ON'}
          </button>

          <button
            onClick={() => setUseThinking(!useThinking)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              useThinking 
                ? 'bg-purple-500/20 border-purple-500 text-purple-400' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
            }`}
          >
            Thinking Mode {useThinking && 'ON'}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] lg:max-w-[70%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-mosab-blue text-white rounded-br-none' 
                : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
            }`}>
              {msg.isThinking && (
                <div className="text-xs text-purple-400 mb-2 font-mono flex items-center gap-1">
                   <svg className="w-3 h-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                   Deep Reasoning applied
                </div>
              )}
              <div className="whitespace-pre-wrap leading-relaxed" dir="auto">{msg.text}</div>
              
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-700">
                  <p className="text-xs text-slate-400 mb-2 font-semibold">Sources:</p>
                  <div className="grid grid-cols-1 gap-1">
                    {msg.sources.map((source, idx) => (
                      <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-mosab-cyan hover:underline truncate block">
                        • {source.title || source.uri}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 rounded-2xl p-4 rounded-bl-none border border-slate-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-mosab-cyan rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-mosab-cyan rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-mosab-cyan rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-mosab-dark border-t border-slate-800">
        <div className="flex gap-2">
          <input
            type="text"
            dir="auto"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about design, trends, or visual concepts... / اسأل عن التصميم..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-mosab-blue focus:ring-1 focus:ring-mosab-blue placeholder-slate-500"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-mosab-blue hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl px-6 py-3 font-medium transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;