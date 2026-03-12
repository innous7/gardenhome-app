"use client";

import { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import { ArrowLeft, Send, CheckCheck, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { sendMessage, sendImageMessage } from "../actions";

type Attachment = { type: string; url: string };
type Message = { id: string; sender_id: string; content: string; created_at: string; is_read: boolean; attachments: Attachment[] };

export default function ChatRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: roomId } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [otherName, setOtherName] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabaseRef = useRef(createClient());
  const userIdRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    const supabase = supabaseRef.current;
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      userIdRef.current = user.id;

      const { data: room } = await supabase
        .from("chat_rooms")
        .select("*, companies(company_name), profiles!chat_rooms_customer_id_fkey(name)")
        .eq("id", roomId).single();

      if (room) {
        setOtherName(room.customer_id === user.id ? (room as any).companies?.company_name || "조경회사" : (room as any).profiles?.name || "고객");
      }

      const { data: msgs } = await supabase.from("messages").select("*").eq("chat_room_id", roomId).order("created_at", { ascending: true });
      setMessages((msgs as Message[] | null) || []);

      await supabase.from("messages").update({ is_read: true }).eq("chat_room_id", roomId).neq("sender_id", user.id);
    };
    init();

    const channel = supabase.channel(`room-${roomId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `chat_room_id=eq.${roomId}` },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages(prev => [...prev, newMsg]);
          // Mark as read if it's from the other person
          if (newMsg.sender_id !== userIdRef.current) {
            supabase.from("messages").update({ is_read: true }).eq("id", newMsg.id).then();
          }
        })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages", filter: `chat_room_id=eq.${roomId}` },
        (payload) => {
          setMessages(prev => prev.map(m => m.id === payload.new.id ? { ...m, ...payload.new } as Message : m));
        })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    await sendMessage(roomId, newMessage.trim());
    setNewMessage("");
    setSending(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSending(true);
    const supabase = supabaseRef.current;
    const fileExt = file.name.split(".").pop();
    const fileName = `${roomId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const { data, error } = await supabase.storage.from("chat-images").upload(fileName, file);
    if (error) { setSending(false); return; }
    const { data: urlData } = supabase.storage.from("chat-images").getPublicUrl(data.path);
    await sendImageMessage(roomId, urlData.publicUrl);
    setSending(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b sticky top-16 lg:top-20 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/chat"><Button variant="ghost" size="icon" className="rounded-xl"><ArrowLeft className="w-5 h-5" /></Button></Link>
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-600 text-sm">{otherName.charAt(0) || "?"}</div>
          <span className="font-semibold text-gray-900">{otherName}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
          {messages.map(msg => {
            const isMine = msg.sender_id === userId;
            return (
              <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${isMine ? "bg-green-600 text-white rounded-br-md" : "bg-white text-gray-900 rounded-bl-md shadow-sm"}`}>
                  {(msg.attachments as Attachment[])?.length > 0 && (msg.attachments as Attachment[]).map((att, i) => (
                    att.type === "image" && <img key={i} src={att.url} alt="" className="rounded-lg max-w-full mb-1" />
                  ))}
                  {msg.content && <p>{msg.content}</p>}
                  <div className={`flex items-center gap-1 mt-1 ${isMine ? "justify-end" : ""}`}>
                    <span className={`text-[10px] ${isMine ? "text-green-200" : "text-gray-400"}`}>{new Date(msg.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}</span>
                    {isMine && <CheckCheck className={`w-3 h-3 ${msg.is_read ? "text-green-200" : "text-green-400/50"}`} />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white border-t sticky bottom-0">
        <div className="max-w-2xl mx-auto px-4 py-3 flex gap-2">
          <Input placeholder="메시지를 입력하세요" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()} className="h-11 rounded-xl flex-1" />
          <button onClick={() => fileInputRef.current?.click()} disabled={sending} className="text-gray-400 hover:text-green-600 transition-colors p-2">
            <ImagePlus className="w-5 h-5" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          <Button onClick={handleSend} disabled={!newMessage.trim() || sending} className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-11 px-4"><Send className="w-5 h-5" /></Button>
        </div>
      </div>
    </div>
  );
}
