import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, User, ChevronRight } from "lucide-react";
import { Message, UserProfile } from "../types";

interface ChatWidgetProps {
  donationId: string;
  currentUser: UserProfile;
}

export default function ChatWidget({ donationId, currentUser }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = () => {
    fetch(`/api/messages/${donationId}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data);
        setIsLoading(false);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000); // Poll messages every 4 seconds for immediate feel
    return () => clearInterval(interval);
  }, [donationId]);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const body = {
      donationId,
      senderId: currentUser.id,
      senderName: `${currentUser.name} (${currentUser.role.toUpperCase()})`,
      text: inputText.trim()
    };

    setInputText("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const newMsg = await res.json();
      setMessages((prev) => [...prev, newMsg]);

      // Simple AI/collaboration reply simulation to make the portal feel active
      setTimeout(async () => {
        const simulatedReply = {
          donationId,
          senderId: "system_coordinator",
          senderName: "System Assistant (Auto-Match)",
          text: `Acknowledged! Coordination details updated. Route metrics active on live dashboard monitor.`
        };

        await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(simulatedReply)
        });
        fetchMessages();
      }, 3000);

    } catch (err) {
      console.error("Message delivery failed:", err);
    }
  };

  return (
    <div id="direct_chat_communication_box" className="bg-white rounded-3xl p-5 border border-lime-100 shadow-sm flex flex-col h-[380px]">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
        <div className="w-8 h-8 rounded-xl bg-lime-100 text-lime-700 flex items-center justify-center">
          <MessageSquare className="w-4.5 h-4.5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-800">Direct Delivery Chat Line</h4>
          <p className="text-[10px] text-slate-400">Negotiate and align logistics direct with partners</p>
        </div>
      </div>

      {/* Chat logs render body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3.5 pr-1 pb-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-slate-400 font-mono text-xs">
            Connecting secure secure websocket...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-300 py-10">
            <MessageSquare className="w-12 h-12 stroke-slate-200" />
            <p className="text-xs text-slate-400 font-medium mt-2">No messages posted on this thread.</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Send a coordinate update to begin!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isSelf = msg.senderId === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${
                  isSelf ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <span className="text-[9px] text-slate-400 font-medium block mb-0.5">
                  {msg.senderName}
                </span>
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    isSelf
                      ? "bg-emerald-600 text-white rounded-tr-none"
                      : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/50"
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                <span className="text-[8px] text-slate-400 font-mono mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Reply input control */}
      <form onSubmit={handleSendMessage} className="mt-2.5 flex items-center gap-2 border-t border-slate-100 pt-2.5">
        <input
          type="text"
          placeholder="Type message & coordinate pickup..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-emerald-500 rounded-2xl px-4 py-3 text-slate-800"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl flex items-center justify-center cursor-pointer transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
