"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import Button from "./ui/Button";
import { useOrderContext } from "./OrderContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const { orders, isLoading: isOrdersLoading } = useOrderContext();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey! 👋 How can I help you with your nsanity order today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(isOpen);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    isOpenRef.current = isOpen;
    if (isOpen) setHasUnread(false);
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        chatWindowRef.current &&
        !chatWindowRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    const conversationMessages = [
      ...messages.filter((msg, idx) => idx !== 0 || msg.role === "user"),
      userMessage,
    ];

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversationMessages,
          orders: orders.map((o) => ({
            id: o.id,
            orderCode: o.orderCode,
            status: o.status,
            totalAmount: o.totalAmount,
            createdAt: o.createdAt,
            orderItems: o.orderItems?.map((item) => ({
              quantity: item.quantity,
              product: { name: item.product?.name },
            })),
          })),
          ordersLoading: isOrdersLoading,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);

      if (!isOpenRef.current) {
        setHasUnread(true);
      }

      setHasUnread((prevUnread) => {
        if (!isOpen) return true;
        return prevUnread;
      });
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble right now. Please try again! 😅",
        },
      ]);

      setHasUnread((prevUnread) => {
        if (!isOpen) return true;
        return prevUnread;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 300) {
      setInput(value);
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-linear-to-br from-nsanity-orange to-nsanity-darkorange hover:shadow-2xl text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 group hover:cursor-pointer"
          aria-label="Open chat"
        >
          <MessageCircle
            size={24}
            className="group-hover:rotate-12 transition-transform"
          />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nsanity-pink opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-nsanity-pink"></span>
            </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-linear-to-r from-nsanity-orange to-nsanity-darkorange text-white">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="animate-pulse" />
              <div>
                <span className="font-semibold block">NSANITY Assistant</span>
                <span className="text-xs opacity-90">Powered by Gemini</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-linear-to-b from-gray-50 to-white">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl shadow-sm break-words ${
                    msg.role === "user"
                      ? "bg-linear-to-br from-nsanity-orange to-nsanity-darkorange text-white"
                      : "bg-white text-gray-800 border border-gray-200"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-nsanity-orange rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-nsanity-orange rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-nsanity-orange rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Text area */}
          <div className="p-4 border-t bg-white">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <textarea
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-nsanity-orange focus:border-transparent text-sm sm:text-base resize-none"
                  disabled={isLoading}
                  maxLength={300}
                  style={{ fontSize: "16px" }}
                  rows={2}
                />
                <Button
                  onClick={sendMessage}
                  variant="primary"
                  size="sm"
                  disabled={isLoading || !input.trim()}
                  className="rounded-xl px-4 shrink-0"
                >
                  <Send size={18} />
                </Button>
              </div>
              <div className="text-xs text-gray-500 text-right">
                {input.length}/300
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
