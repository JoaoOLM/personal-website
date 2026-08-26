"use client";

import { useState, useRef, useEffect } from "react";
import { FaTerminal, FaPaperPlane, FaChevronRight, FaVolumeUp, FaVolumeMute, FaDesktop } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import { playKeypressSound, playMessageStartSound } from "@/utils/audio";

type Message = {
  role: "user" | "ai";
  content: string;
};

export default function Terminal() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: "Olá, sou o assistente IA do João. Como posso te ajudar a explorar o perfil dele hoje?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [crtEnabled, setCrtEnabled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent, presetMessage?: string) => {
    if (e) e.preventDefault();
    const query = presetMessage || input;
    if (!query.trim() || loading) return;

    if (soundEnabled) playKeypressSound();

    setMessages((prev) => [...prev, { role: "user", content: query }]);
    if (!presetMessage) setInput("");
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      if (!response.ok) throw new Error("Erro na rede.");
      if (!response.body) throw new Error("Sem corpo na resposta");

      setLoading(false);
      if (soundEnabled) playMessageStartSound();
      setMessages((prev) => [...prev, { role: "ai", content: "" }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastIdx = newMessages.length - 1;
            const lastMessage = { ...newMessages[lastIdx] };
            
            if (lastMessage.role === "ai") {
              lastMessage.content += chunk;
            }
            newMessages[lastIdx] = lastMessage;
            return newMessages;
          });
        }
      }
    } catch (error) {
      setLoading(false);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Erro ao conectar com a IA. O backend está rodando?" },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (soundEnabled && e.key !== 'Enter') {
       playKeypressSound();
    }
  };

  const quickActions = [
    "> quem é o joão?",
    "> hobbys & leituras",
    "> fases do mestrado",
    "> stack e preferencias",
  ];

  return (
    <div className={`glass rounded-2xl overflow-hidden flex flex-col h-[500px] w-full max-w-4xl mx-auto shadow-2xl border-earth-border relative glow-green-hover ${crtEnabled ? 'crt-overlay flicker' : ''}`}>
      {/* Subtle glow effect on top edge */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-forest-primary/40 to-transparent"></div>

      {/* Terminal Header */}
      <div className="bg-earth-dark/80 p-3 border-b border-earth-border flex items-center gap-3">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_6px_rgba(239,68,68,0.4)]"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-[0_0_6px_rgba(234,179,8,0.4)]"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-[0_0_6px_rgba(34,197,94,0.4)]"></div>
        </div>
        <div className="flex items-center gap-2 text-foreground/70 text-sm font-[family-name:var(--font-mono)] ml-4">
          <FaTerminal size={14} />
          <span>joao@portfolio:~</span>
          <div className="w-1.5 h-1.5 rounded-full bg-forest-primary animate-pulse shadow-[0_0_6px_#22c55e] ml-2 mr-4"></div>
        </div>
        <div className="ml-auto flex items-center gap-4 text-foreground/50">
          <button type="button" onClick={() => setCrtEnabled(!crtEnabled)} className={`hover:text-forest-primary transition-colors ${crtEnabled ? 'text-forest-primary drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]' : ''}`} title="Modo CRT">
            <FaDesktop size={14} />
          </button>
          <button type="button" onClick={() => setSoundEnabled(!soundEnabled)} className={`hover:text-amber-accent transition-colors ${soundEnabled ? 'text-amber-accent drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]' : ''}`} title="Efeitos Sonoros">
            {soundEnabled ? <FaVolumeUp size={14} /> : <FaVolumeMute size={14} />}
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto font-[family-name:var(--font-mono)] text-sm space-y-4 scroll-smooth">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] p-3 rounded-xl ${
                msg.role === "user"
                  ? "bg-forest-dark/30 border border-forest-primary/40 text-green-100 rounded-tr-none shadow-[0_0_10px_rgba(34,197,94,0.1)] whitespace-pre-wrap"
                  : "bg-earth-dark/50 border border-earth-border/60 text-foreground rounded-tl-none"
              }`}
            >
              {msg.role === "ai" ? (
                <div className="prose-sm prose-invert max-w-none break-words [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:mb-2 [&>ol]:list-decimal [&>ol]:pl-4 [&>ol]:mb-2 [&>code]:bg-black/30 [&>code]:px-1 [&>code]:rounded">
                  <ReactMarkdown>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-earth-dark/50 border border-earth-border/60 text-foreground p-3 rounded-xl rounded-tl-none">
              <span className="inline-flex gap-1">
                <span className="w-2 h-2 bg-forest-primary/60 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                <span className="w-2 h-2 bg-forest-primary/60 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                <span className="w-2 h-2 bg-forest-primary/60 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 flex flex-wrap gap-2 border-t border-earth-border/30 bg-earth-dark/20">
        {quickActions.map((action) => (
          <button
            key={action}
            onClick={() => handleSubmit(undefined, action)}
            className="text-xs font-[family-name:var(--font-mono)] px-3 py-1.5 rounded-full border border-earth-border/50 hover:border-forest-primary/60 text-foreground/70 hover:text-forest-primary transition-all hover:shadow-[0_0_10px_rgba(34,197,94,0.15)]"
          >
            {action}
          </button>
        ))}
      </div>

      {/* Terminal Input */}
      <form
        onSubmit={handleSubmit}
        className="p-4 bg-earth-dark/40 border-t border-earth-border/30 flex items-center gap-3"
      >
        <FaChevronRight className="text-forest-primary" size={14} />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite um comando ou faça uma pergunta..."
          className="flex-1 bg-transparent border-none outline-none font-[family-name:var(--font-mono)] text-foreground placeholder:text-foreground/30 focus:ring-0"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2 rounded-lg bg-forest-dark/60 hover:bg-forest-primary text-white disabled:opacity-30 transition-all hover:shadow-[0_0_12px_rgba(34,197,94,0.3)]"
        >
          <FaPaperPlane size={14} />
        </button>
      </form>
    </div>
  );
}
