import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Send, Paperclip, Sparkles } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  avatar?: string;
  name?: string;
}

interface ChatInterfaceProps {
  messages?: ChatMessage[];
  onSendMessage?: (message: string) => void;
  placeholder?: string;
  showSuggestions?: boolean;
}

const suggestions = [
  "帮我策划一场年会活动",
  "生成本周的营销数据报告",
  "创作一篇关于AI的科普文章",
  "设计一个产品介绍海报",
];

export function ChatInterface({ 
  messages = [], 
  onSendMessage,
  placeholder = "描述你的需求，AI项目经理会为你组建团队...",
  showSuggestions = true,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage?.(input);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50">
              <Sparkles className="size-8 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">
                欢迎使用 Jobcc AI 项目经理
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                告诉我你的需求，我会为你组建专业团队
              </p>
            </div>

            {showSuggestions && (
              <div className="mt-6 grid w-full max-w-2xl gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="rounded-lg border border-neutral-200 bg-white px-4 py-3 text-left text-sm text-neutral-700 transition-colors hover:border-blue-300 hover:bg-blue-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-purple-50 text-sm">
                  {message.avatar || (message.role === "user" ? "👤" : "🤖")}
                </div>
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-neutral-200 text-neutral-900"
                  }`}
                >
                  {message.name && (
                    <div className="mb-1 text-xs font-medium opacity-70">
                      {message.name}
                    </div>
                  )}
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        <div className="flex items-end gap-2">
          <Button variant="ghost" size="icon" className="shrink-0">
            <Paperclip className="size-5" />
          </Button>
          
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[60px] resize-none"
            rows={2}
          />
          
          <Button 
            onClick={handleSend} 
            disabled={!input.trim()}
            className="shrink-0"
            size="icon"
          >
            <Send className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
