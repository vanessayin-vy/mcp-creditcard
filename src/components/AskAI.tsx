import React, { useState, useRef, useEffect, useMemo, ReactNode } from "react";
import { ChatMessage, CreditCard } from "../types";
import { Send, Bot, User, Sparkles, HelpCircle, Loader2 } from "lucide-react";

interface AskAIProps {
  cards: CreditCard[];
  initialPrompt?: string; // If navigated here with a contextual query
}

export default function AskAI({ cards, initialPrompt }: AskAIProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Set default messages on mount, with state dependency on cards length inside welcome
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "model",
        content: `👋 **Welcome to SGCashMax Premium AI Consultation!** \n\nI have successfully synced with your **${cards.length} active Singapore credit cards**. \n\nAsk me any question: \n- *\"Which card fits my mobile bill from Circles.Life?\"* \n- *\"Should I apply for Maybank Family & Friends for retail?\"* \n- *\"Will I hit my UOB One target spend this cycle?\"*`,
        timestamp: new Date().toISOString(),
      }
    ]);
  }, [cards.length]);

  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Suggestions chips
  const suggestionQueries = [
    "Which card for my Circles.Life bill?",
    "Will I hit my UOB One spend tier this month?",
    "Should I apply for Maybank Family & Friends?",
    "How does the HSBC Live+ compare for dining?",
  ];

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Handle contextual query passed from Monthly Report "See what to fix"
  useEffect(() => {
    if (initialPrompt) {
      handleSendPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSendPrompt = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `m_user_${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setLoading(true);

    try {
      const historyMsg = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyMsg }),
      });

      const data = await res.json();

      if (res.ok && data.content) {
        setMessages((prev) => [
          ...prev,
          {
            id: `m_bot_${Date.now()}`,
            role: "model",
            content: data.content,
            timestamp: data.timestamp || new Date().toISOString(),
          },
        ]);
      } else {
        throw new Error(data.error || "Failed API call");
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `m_bot_err_${Date.now()}`,
          role: "model",
          content: "Sorry, I ran into an error processing that message. Please ensure the server is fully started and check your `GEMINI_API_KEY` configuration in Settings > Secrets.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-indigo-950 text-indigo-100 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col h-[calc(100vh-160px)] min-h-[520px]" id="ask-ai-root">
      {/* Header Panel */}
      <div className="flex items-center justify-between gap-3 mb-4 shrink-0 pb-3 border-b border-indigo-900/60" id="ai-chat-header">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></div>
          <h3 className="font-bold text-white tracking-tight">Ask Max AI Advisor</h3>
        </div>
        <span className="text-[10px] font-mono text-indigo-300 bg-indigo-900 px-2 py-0.5 rounded border border-indigo-800">
          gemini-3.5-flash
        </span>
      </div>

      {/* Connected Wallet Context list */}
      <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-3 block shrink-0">
        Wallet Context: {cards.length} cards tracked inline
      </p>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 max-h-[calc(100vh-320px)] scrollbar-thin">
        {messages.map((msg) => {
          const isBot = msg.role === "model";
          return (
            <div 
              key={msg.id} 
              className={`flex gap-3 max-w-[90%] ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border ${
                isBot 
                  ? 'bg-indigo-900 text-emerald-450 border-indigo-805' 
                  : 'bg-white text-indigo-950 border-white'
              }`}>
                {isBot ? <Sparkles className="h-4 w-4 text-emerald-400" /> : <User className="h-4 w-4 text-indigo-950" />}
              </div>

              <div className={`rounded-3xl p-4 text-xs leading-relaxed space-y-2 ${
                isBot 
                  ? 'bg-white/10 border border-white/5 text-indigo-100 shadow-inner' 
                  : 'bg-indigo-900/50 text-indigo-50 border border-indigo-800'
              }`}>
                {msg.content.split('\n\n').map((paragraph, pIdx) => {
                  return (
                    <div key={pIdx}>
                      {paragraph.split('\n').map((line, lIdx) => {
                        // Detect and style bold text
                        let formattedText: ReactNode = line;
                        if (line.includes('**')) {
                          const parts = line.split('**');
                          formattedText = parts.map((part, idx) => 
                            idx % 2 === 1 ? <strong key={idx} className="font-bold text-emerald-400">{part}</strong> : part
                          );
                        }

                        // Check if line starts with a list bullet
                        const isBullet = line.trim().startsWith('-') || line.trim().startsWith('•');
                        if (isBullet) {
                          const listContent = line.replace(/^[-•]\s*/, '');
                          return (
                            <div key={lIdx} className="flex gap-2 pl-2 my-1">
                              <span className="text-emerald-400">•</span>
                              <span>{listContent}</span>
                            </div>
                          );
                        }

                        return <p key={lIdx}>{formattedText}</p>;
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex gap-3 mr-auto max-w-[80%]">
            <div className="h-8 w-8 rounded-full bg-indigo-900 border border-indigo-800 flex items-center justify-center animate-spin">
              <Loader2 className="h-4 w-4 text-emerald-405 text-emerald-400" />
            </div>
            <div className="bg-white/5 text-indigo-300 rounded-3xl p-4 border border-white/5 text-xs flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
              <span>Querying Singapore cards schema...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-3 pt-1 shrink-0 scrollbar-none" id="chat-suggestions">
        {suggestionQueries.map((query, index) => (
          <button
            key={index}
            onClick={() => handleSendPrompt(query)}
            className="bg-[#1e1b4b]/60 hover:bg-[#1e1b4b] border border-indigo-900/60 text-indigo-200 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="h-3 w-3 text-emerald-400" />
            {query}
          </button>
        ))}
      </div>

      {/* Input panel matches screen 4 of theme */}
      <div className="shrink-0 pt-2 border-t border-indigo-900/40">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt(inputVal);
          }}
          className="flex gap-2 relative"
        >
          <input 
            type="text" 
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={loading}
            placeholder="Type your finance query..." 
            className="w-full bg-indigo-900 border-none rounded-xl py-3.5 pl-4 pr-12 text-xs text-white placeholder-indigo-400 outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={!inputVal.trim() || loading}
            className="absolute right-2 top-2 p-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-550 transition-colors disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
