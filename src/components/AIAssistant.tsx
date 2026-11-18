import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  User,
  FileCode,
} from 'lucide-react';
import { askCodebaseQuestion } from '../services/api';
import { ChatMessage } from '../types';

interface AIAssistantProps {
  owner: string;
  repo: string;
  onSelectFile: (path: string) => void;
}

const SAMPLE_QUESTIONS = [
  'Where does execution begin?',
  'How does request routing work in this codebase?',
  'Which files handle core business logic?',
  'What happens when the application initializes?',
];

export const AIAssistant: React.FC<AIAssistantProps> = ({
  owner,
  repo,
  onSelectFile,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I have indexed the analyzed files for ${owner}/${repo}.\n\nAsk me about its architecture, execution flows, entry points, or specific functions.`,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        id: `welcome-${owner}-${repo}`,
        sender: 'assistant',
        text: `Hello! I have indexed the analyzed files for ${owner}/${repo}.\n\nAsk me about its architecture, execution flows, entry points, or specific functions.`,
        timestamp: Date.now(),
      },
    ]);
  }, [owner, repo]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await askCodebaseQuestion(owner, repo, textToSend);
      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        referencedFiles: response.referencedFiles,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'system',
        text: err.message || 'Error communicating with assistant. Please try again.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-[#090D16] select-none text-slate-900 dark:text-slate-100 transition-colors duration-150">
      {/* Context Sub-bar */}
      <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D131F] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Grounded context: <strong className="font-mono text-slate-800 dark:text-slate-200">{owner}/{repo}</strong></span>
        <span>Keyword-ranked source retrieval</span>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-2.5 text-sm ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[86%] rounded-xl p-3.5 leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : msg.sender === 'system'
                  ? 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900'
                  : 'bg-white dark:bg-[#0D131F] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-2xs'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                {msg.text}
              </div>

              {msg.referencedFiles && msg.referencedFiles.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400 block mb-1.5">
                    Referenced Files:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.referencedFiles.map(path => (
                      <button
                        key={path}
                        type="button"
                        onClick={() => onSelectFile(path)}
                        className="text-xs font-mono bg-slate-50 dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 flex items-center gap-1 transition-colors"
                      >
                        <FileCode className="w-3 h-3" />
                        <span className="truncate max-w-[160px]">{path}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 py-2">
            <div className="w-3.5 h-3.5 border-2 border-slate-300 dark:border-slate-700 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin" />
            <span>Synthesizing answer from analyzed files...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length < 4 && (
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D131F]">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Suggested Questions
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q)}
                disabled={isLoading}
                className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-md text-left transition-colors truncate max-w-full"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D131F] flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask a question about this repository..."
          disabled={isLoading}
          className="flex-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-40 transition-colors shrink-0 flex items-center justify-center shadow-2xs"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
