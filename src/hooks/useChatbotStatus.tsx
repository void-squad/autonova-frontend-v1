import React, { createContext, useCallback, useContext, useState, useRef } from "react";

export type IconStatus = "loading" | "complete" | "failed";

export type ChatbotStatus = {
  id: number;
  text: string;
  iconStatus: IconStatus;
};

type ContextShape = {
  status: ChatbotStatus | null;
  pushStatus: (text: string) => number; // returns id
  setStatusComplete: (id: number) => void;
  setStatusFailed: (id: number) => void;
};

const ChatbotStatusContext = createContext<ContextShape | undefined>(undefined);

let globalId = 1;

export const ChatbotStatusProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [status, setStatus] = useState<ChatbotStatus | null>(null);
  const hideTimer = useRef<number | null>(null);

  // pushStatus: animate old out, then show new one
  const pushStatus = useCallback((text: string) => {
    const id = globalId++;
    // Fade out old, then replace
    setStatus((prev) => {
      // Immediately replace for simplicity but still let UI animate via key change
      return { id, text, iconStatus: "loading" };
    });

    // clear any existing hide timer
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }

    // auto hide after a long time — but we let caller set complete/failed
    hideTimer.current = window.setTimeout(() => {
      setStatus(null);
      hideTimer.current = null;
    }, 12000);

    return id;
  }, []);

  const setStatusComplete = useCallback((id: number) => {
    setStatus((s) => (s && s.id === id ? { ...s, iconStatus: "complete" } : s));
    // hide shortly after completion
    window.setTimeout(() => setStatus((s) => (s && s.id === id ? null : s)), 1200);
  }, []);

  const setStatusFailed = useCallback((id: number) => {
    setStatus((s) => (s && s.id === id ? { ...s, iconStatus: "failed" } : s));
    window.setTimeout(() => setStatus((s) => (s && s.id === id ? null : s)), 2000);
  }, []);

  return (
    <ChatbotStatusContext.Provider value={{ status, pushStatus, setStatusComplete, setStatusFailed }}>
      {children}
    </ChatbotStatusContext.Provider>
  );
};

export function useChatbotStatus() {
  const ctx = useContext(ChatbotStatusContext);
  if (!ctx) throw new Error("useChatbotStatus must be used within ChatbotStatusProvider");
  return ctx;
}

export default useChatbotStatus;
