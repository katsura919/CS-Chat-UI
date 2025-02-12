"use client";
import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("http://localhost:5000/api/ask/chat", { query: input });

      // Format response content for proper markdown rendering
      const formattedContent = response.data.answer
        .replace(/\d+\./g, "\n$&") // Ensure proper spacing for numbered lists
        .trim();

      const aiMessage: Message = { role: "ai", content: formattedContent };
      console.log(aiMessage)
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setError("Oops! Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-4">AI Helpdesk</h1>
      
      <Card className="flex-1 overflow-y-auto p-4 bg-gray-50 rounded-lg shadow-md">
        <div className="flex flex-col space-y-3">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`p-3 rounded-lg max-w-xs ${
                  msg.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
                }`}
              >
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </motion.div>
          ))}

          {loading && (
            <motion.p
              className="text-sm text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
            >
              AI is typing...
            </motion.p>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </Card>

      <div className="flex items-center gap-2 mt-4">
        <Input
          className="flex-1"
          placeholder="Ask a question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button onClick={sendMessage} disabled={loading}>
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
