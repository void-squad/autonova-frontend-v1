import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import useChatbotStatus from "../hooks/useChatbotStatus";
import { getAiResponse } from "../lib/api/chatbot";

type Props = {
  disabledPaths?: string[];
};

function isPathDisabled(pathname: string, patterns?: string[]) {
  if (!patterns || patterns.length === 0) return false;
  return patterns.some((p) => {
    if (p.endsWith("/*")) {
      const prefix = p.slice(0, -1);
      return pathname.startsWith(prefix);
    }
    if (p.endsWith("*")) {
      const prefix = p.slice(0, -1);
      return pathname.startsWith(prefix);
    }
    return pathname === p;
  });
}

const Spinner: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <span
    className="inline-block rounded-full border-2 border-t-transparent"
    style={{ width: size, height: size, borderColor: "rgba(0,0,0,0.15)" }}
  >
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <span style={{ display: "block", width: size, height: size, borderTop: "2px solid rgba(0,0,0,0.6)", borderRadius: "9999px", animation: "spin 1s linear infinite" }} />
  </span>
);

const Chatbot: React.FC<Props> = ({ disabledPaths }) => {
  const location = useLocation();
  const disabled = isPathDisabled(location.pathname, disabledPaths);
  const [open, setOpen] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const { status, pushStatus, setStatusComplete, setStatusFailed } = useChatbotStatus();
  
  type Message = { id: number; from: "user" | "bot"; text: string; time: number };
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);
  const msgId = useRef(1);

  useEffect(() => {
    // scroll to bottom on messages change
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!open) {
      // close websocket when closed
      if (wsRef.current) {
        try { wsRef.current.close(); } catch {};
        wsRef.current = null;
      }
      return;
    }

    // open websocket when chat opened
    try {
      const ws = new WebSocket("ws://localhost:4000");
      wsRef.current = ws;

      ws.onopen = () => {
        const id = pushStatus("Connected to socket");
        // mark complete after brief moment
        setTimeout(() => setStatusComplete(id), 600);
      };

      ws.onmessage = (ev) => {
        // treat message as status text
        try {
          const payload = ev.data;
          const id = pushStatus(String(payload));
          // keep loading until server sends explicit complete/failed message — not implemented.
          // For demo, mark complete after 1s
          setTimeout(() => setStatusComplete(id), 1200);
        } catch (e) {
          console.warn(e);
        }
      };

      ws.onclose = () => {
        const id = pushStatus("Socket closed");
        setTimeout(() => setStatusFailed(id), 800);
        wsRef.current = null;
      };
      ws.onerror = () => {
        const id = pushStatus("Socket error");
        setTimeout(() => setStatusFailed(id), 800);
      };
    } catch (e) {
      const id = pushStatus("Failed to open socket");
      setTimeout(() => setStatusFailed(id), 800);
    }

    return () => {
      if (wsRef.current) {
        try { wsRef.current.close(); } catch {};
        wsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // handle sending messages using AI service
  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    const id = msgId.current++;
    const userMsg: Message = { id, from: "user", text, time: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    const s1 = pushStatus("Thinking...");
    try {
      const result = await getAiResponse(text);
      setStatusComplete(s1);

      // optional small follow-up status
      const s2 = pushStatus("Preparing workflow...");
      setTimeout(() => setStatusComplete(s2), 600);

      const bid = msgId.current++;
      setMessages((m) => [...m, { id: bid, from: "bot", text: result.response ?? "", time: Date.now() }]);
      // (optional) you can use result.tokens if you want to display token info
    } catch (err) {
      setStatusFailed(s1);
      const bid = msgId.current++;
      const message = err instanceof Error ? err.message : String(err);
      setMessages((m) => [...m, { id: bid, from: "bot", text: `Error: ${message}`, time: Date.now() }]);
    }
  };

  if (disabled) return null;

  return (
    <>
      {/* Floating button */}
      <div className="fixed z-50 right-5 bottom-5">
        <button
          aria-label="Open Chatbot"
          onClick={() => setOpen((v) => !v)}
          className="bg-white/0 rounded-full w-14 h-14 shadow-lg flex items-center justify-center ring-2 ring-white/60"
        >
          {/* Use the same gradient icon as the header */}
          <div className="w-9 h-9 bg-gradient-to-tr from-sky-500 to-blue-400 rounded-md flex items-center justify-center text-white font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4-.8L3 20l1.2-3.2A7.962 7.962 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        </button>
      </div>

      {/* Chat panel */}
      <div className={`fixed z-50 right-5 bottom-24 w-96 max-w-full transition-transform duration-200 ${open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
  <div className="bg-white/95 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden h-[420px]">
          <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: 'rgba(224,242,254,0.8)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-tr from-sky-500 to-blue-400 rounded-md flex items-center justify-center text-white font-semibold">AI</div>
              <div>
                <div className="text-sm font-medium">Autonova Chat</div>
                <div className="text-xs text-muted-foreground">How can I help today?</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setOpen(false)} aria-label="Close chat" className="p-1 rounded hover:bg-gray-200/60">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex flex-col h-[calc(100%-64px)]">{/* subtract header height */}
            {/* Horizontal status bar (no label when idle) */}
            <div className="px-3 py-2 border-b bg-gray-50 dark:bg-gray-800">
              <div className="h-8 flex items-center">
                {status ? (
                  <div key={status.id} className="flex items-center gap-2 transition-opacity duration-300">
                    {status.iconStatus === "loading" ? <Spinner size={14} /> : status.iconStatus === "complete" ? (
                      <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    ) : (
                      <svg className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    )}
                    <div className="text-sm">{status.text}</div>
                  </div>
                ) : (
                  <div className="h-2" />
                )}
              </div>
            </div>

            {/* Main chat area */}
              <div className="p-4 flex-1 overflow-auto" ref={listRef}>
                {messages.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No messages yet — say hi!</div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {messages.map((m) => (
                      <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`rounded-md px-3 py-2 max-w-[80%] text-sm ${
                            m.from === "user"
                              ? "bg-gradient-to-tr from-sky-600 to-blue-500 text-white dark:from-sky-500 dark:to-blue-400"
                              : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                          }`}
                        >
                          {m.text}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            {/* Input area */}
            <div className="p-3 border-t flex items-center gap-2">
              <input
                placeholder="Type a message..."
                className="flex-1 rounded-md border px-3 py-2 text-sm"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button onClick={() => handleSend()} className="w-10 h-10 rounded-md flex items-center justify-center bg-gradient-to-tr from-sky-500 to-blue-400 text-white shadow">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-7-9 7-9-9 2-9-2 7 9-7 9 9-2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chatbot;

