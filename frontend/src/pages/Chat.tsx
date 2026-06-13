import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, Bot, User, Loader2, Info, Mic, MicOff, Volume2 } from 'lucide-react';
import { socket } from '../lib/socket';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am your Intelligent Knowledge Base. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const hasInitialized = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    socket.on('chat-stream-start', () => {
      setMessages(prev => [
        ...prev, 
        { id: 'temp-assistant', role: 'assistant', content: '' }
      ]);
      setIsLoading(false);
    });

    socket.on('chat-stream-chunk', (chunk: string) => {
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last && last.id === 'temp-assistant') {
          return [
            ...prev.slice(0, -1),
            { ...last, content: last.content + chunk }
          ];
        }
        return prev;
      });
    });

    socket.on('chat-stream-end', (data: { sources: any[] }) => {
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last && last.id === 'temp-assistant') {
          
          // AI Voice Response (TTS)
          if ('speechSynthesis' in window && last.content) {
            window.speechSynthesis.cancel(); // Cancel any ongoing speech
            const utterance = new SpeechSynthesisUtterance(last.content.replace(/[*_#`]/g, ''));
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
          }

          return [
            ...prev.slice(0, -1),
            { 
              ...last, 
              id: Date.now().toString(),
              sources: data.sources.map(s => s.title)
            }
          ];
        }
        return prev;
      });
    });

    socket.on('chat-stream-error', (err: string) => {
      toast.error(err);
      setIsLoading(false);
      setMessages(prev => prev.filter(m => m.id !== 'temp-assistant'));
    });

    return () => {
      socket.off('chat-stream-start');
      socket.off('chat-stream-chunk');
      socket.off('chat-stream-end');
      socket.off('chat-stream-error');
    };
  }, []);

  useEffect(() => {
    if (location.state?.initialQuery && !hasInitialized.current) {
      hasInitialized.current = true;
      const initialQuery = location.state.initialQuery;
      // We push the initial query manually since handleSend uses form event
      const userMessage: Message = { id: Date.now().toString(), role: 'user', content: initialQuery };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      fetch('http://localhost:3000/ai/ask-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: initialQuery, clientId: socket.id })
      }).catch(e => {
        console.error(e);
        toast.error('Could not connect to AI service');
        setIsLoading(false);
      });
      
      // Clear state so it doesn't fire again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const toggleListening = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice recognition is not supported in this browser.');
      return;
    }
    
    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error !== 'no-speech') {
        toast.error(`Speech error: ${event.error}`);
      }
    };

    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3000/ai/ask-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage.content, clientId: socket.id })
      });
      if (!res.ok) throw new Error('Failed to send message');
    } catch (e) {
      console.error(e);
      toast.error('Could not connect to AI service');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-w-5xl mx-auto glass-panel rounded-2xl my-4 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center px-6 py-4 border-b border-white/5 bg-card/20 backdrop-blur-sm">
        <div className="flex items-center justify-center w-10 h-10 rounded-full ai-gradient-bg text-white mr-4 shadow-lg ring-2 ring-white/10">
          <Bot size={20} />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold tracking-tight ai-gradient-text">AI Knowledge Assistant</h2>
          <p className="text-xs text-muted-foreground flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
            Online • Ready to answer questions
          </p>
        </div>
        {isSpeaking && (
          <div className="flex items-center text-primary text-xs font-medium animate-pulse">
            <Volume2 size={14} className="mr-1" /> AI Speaking...
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full mt-1 shadow-md ring-1 ring-white/10 ${
                msg.role === 'user' ? 'ai-gradient-bg text-white ml-3' : 'glass-card text-foreground mr-3'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>

              {/* Message Bubble */}
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-5 py-3 rounded-2xl shadow-sm overflow-hidden max-w-full ${
                  msg.role === 'user' 
                    ? 'ai-gradient-bg text-white rounded-tr-sm shadow-md' 
                    : 'glass-card text-foreground rounded-tl-sm'
                }`}>
                  <div className={`text-sm leading-relaxed ${msg.role === 'user' ? 'whitespace-pre-wrap' : 'prose prose-sm dark:prose-invert max-w-none'}`}>
                    {msg.role === 'user' ? msg.content : <ReactMarkdown>{msg.content}</ReactMarkdown>}
                    {msg.id === 'temp-assistant' && <span className="inline-block w-2 h-4 ml-1 bg-foreground animate-pulse" />}
                  </div>
                </div>

                {/* Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1">
                    <span className="text-xs font-semibold text-muted-foreground flex items-center">
                      <Info size={12} className="mr-1" /> Sources:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((source, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium bg-secondary/50 text-secondary-foreground border">
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex flex-row max-w-[80%]">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full mt-1 glass-card text-foreground mr-3 shadow-md ring-1 ring-white/10">
                <Bot size={16} />
              </div>
              <div className="px-5 py-4 rounded-2xl glass-card rounded-tl-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm font-medium ai-gradient-text animate-pulse">Searching knowledge base...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 glass border-t border-white/5">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about the organization..."
            className="w-full pl-6 pr-24 py-4 bg-background/50 border border-white/10 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner backdrop-blur-md"
            disabled={isLoading}
          />
          <div className="absolute right-2 flex items-center space-x-1">
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2 rounded-full transition-colors ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse shadow-md' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
              title="Voice Input"
            >
              {isListening ? <Mic size={18} /> : <MicOff size={18} />}
            </button>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2 ai-gradient-bg text-white rounded-full hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg relative w-10 h-10 flex items-center justify-center hover:scale-105 active:scale-95"
            >
              <Send size={16} className={isLoading ? "opacity-0" : "opacity-100 translate-x-[1px]"} />
              {isLoading && <Loader2 size={16} className="absolute animate-spin" />}
            </button>
          </div>
        </form>
        <p className="text-[10px] text-center text-muted-foreground mt-3">
          AI can make mistakes. Verify important organizational information.
        </p>
      </div>
    </div>
  );
};
