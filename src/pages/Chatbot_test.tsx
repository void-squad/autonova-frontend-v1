import React from "react";
import { useChatbotStatus } from "../hooks/useChatbotStatus";

const Chatbot_test: React.FC = () => {
  const { pushStatus, setStatusComplete, setStatusFailed } = useChatbotStatus();

  const startFlow = async () => {
    const id = pushStatus("Thinking...");
    // simulate async
    setTimeout(() => setStatusComplete(id), 2000);
  };

  const failFlow = () => {
    const id = pushStatus("Preparing workflow...");
    setTimeout(() => setStatusFailed(id), 1500);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Chatbot Test</h2>
      <p className="mb-3 text-sm text-muted-foreground">Use these buttons to push status messages to the global chatbot status area.</p>
      <div className="flex gap-2">
        <button onClick={startFlow} className="px-3 py-2 bg-indigo-600 text-white rounded">Push "Thinking..."</button>
        <button onClick={failFlow} className="px-3 py-2 bg-red-600 text-white rounded">Push "Preparing workflow..." (fail)</button>
      </div>
    </div>
  );
};

export default Chatbot_test;
