"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Send, ThumbsUp, ThumbsDown } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  id?: string;
  role: "user" | "ai";
  content: string;
  feedback?: boolean | null; // true (liked), false (disliked), null (no feedback)
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  console.log(messages)
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
  
    const userMessage: Message = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage]; // Include new message
  
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    setError(null);
  
    try {
      const response = await axios.post("http://localhost:5000/api/ask/chat", {
        query: input,
        history: updatedMessages, // Pass chat history
      });
  
      const aiMessage: Message = {
        id: response.data.id, // Assuming backend returns an ID
        role: "ai",
        content: response.data.answer.trim(),
        feedback: null,
      };
  
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setError("Oops! Something went wrong. Please try again.");
    }
  
    setLoading(false);
  };
  

  const sendFeedback = async (chatId: string, feedback: boolean) => {
    try {
      await axios.post("http://localhost:5000/api/feedback", { chatId, action: feedback ? "like" : "dislike" });
      setMessages((prev) =>
        prev.map((msg) => (msg.id === chatId ? { ...msg, feedback } : msg))
      );
    } catch (error) {
      console.error("Error sending feedback:", error);
    }
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
              <div className="p-3 rounded-lg max-w-xs bg-gray-200 text-black relative">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
                {msg.role === "ai" && msg.id && (
                  <div className="flex gap-4 mt-2 items-center text-gray-600">
                    <button
                      className={`flex items-center gap-1 text-sm transition-all ${msg.feedback === true ? "text-green-600" : "hover:text-gray-800"}`}
                      onClick={() => sendFeedback(msg.id!, true)}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button
                      className={`flex items-center gap-1 text-sm transition-all ${msg.feedback === false ? "text-red-600" : "hover:text-gray-800"}`}
                      onClick={() => sendFeedback(msg.id!, false)}
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex items-center space-x-1 bg-gray-200 px-3 py-2 rounded-lg w-fit">
              <motion.div
                className="w-2 h-2 bg-gray-500 rounded-full"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
              />
              <motion.div
                className="w-2 h-2 bg-gray-500 rounded-full"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay: 0.2 }}
              />
              <motion.div
                className="w-2 h-2 bg-gray-500 rounded-full"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay: 0.4 }}
              />
            </div>
          )}

          <div ref={chatEndRef} />
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
