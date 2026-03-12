"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { createOrGetChatRoom } from "./actions";

type ChatRoom = {
  id: string;
  last_message: string | null;
  last_message_at: string | null;
  companies: { id: string; company_name: string } | null;
  profiles: { name: string } | null;
  unread_count?: number;
};

function ChatListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const companyParam = searchParams.get("company");
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  // Auto-create/redirect to chat room when ?company= param is present
  useEffect(() => {
    if (!companyParam) return;
    let cancelled = false;
    (async () => {
      const result = await createOrGetChatRoom(companyParam);
      if (!cancelled && result.roomId) {
        router.replace(`/chat/${result.roomId}`);
      }
    })();
    return () => { cancelled = true; };
  }, [companyParam, router]);

  useEffect(() => {
    if (companyParam) return; // skip fetching if redirecting
    const fetchRooms = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: customerRooms } = await supabase
        .from("chat_rooms")
        .select("*, companies(id, company_name)")
        .eq("customer_id", user.id)
        .order("last_message_at", { ascending: false, nullsFirst: false });

      // Count unread messages for each customer room
      const customerRoomsWithUnread = await Promise.all(
        ((customerRooms as ChatRoom[] | null) ?? []).map(async (room) => {
          const { count } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("chat_room_id", room.id)
            .eq("is_read", false)
            .neq("sender_id", user.id);
          return { ...room, unread_count: count || 0 };
        })
      );

      const { data: company } = await supabase.from("companies").select("id").eq("user_id", user.id).single();
      let companyRooms: ChatRoom[] = [];
      if (company) {
        const { data } = await supabase
          .from("chat_rooms")
          .select("*, profiles!chat_rooms_customer_id_fkey(name)")
          .eq("company_id", company.id)
          .order("last_message_at", { ascending: false, nullsFirst: false });

        companyRooms = await Promise.all(
          ((data as ChatRoom[] | null) ?? []).map(async (room) => {
            const { count } = await supabase
              .from("messages")
              .select("*", { count: "exact", head: true })
              .eq("chat_room_id", room.id)
              .eq("is_read", false)
              .neq("sender_id", user.id);
            return { ...room, unread_count: count || 0 };
          })
        );
      }

      setRooms([...customerRoomsWithUnread, ...companyRooms]);
      setLoading(false);
    };
    fetchRooms();
  }, []);

  if (loading || companyParam) return <div className="pt-20 flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" /></div>;

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">메시지</h1>
        {rooms.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-lg">아직 대화가 없습니다</p>
            <p className="text-gray-400 text-sm mt-1">조경회사에 문의하면 대화가 시작됩니다</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {rooms.map(room => {
              const name = room.companies?.company_name || room.profiles?.name || "알 수 없음";
              return (
                <Link key={room.id} href={`/chat/${room.id}`}>
                  <Card className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-600 text-sm">{name.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{name}</p>
                        <p className="text-sm text-gray-500 truncate">{room.last_message || "대화를 시작하세요"}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {room.last_message_at && <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(room.last_message_at).toLocaleDateString("ko-KR")}</span>}
                        {(room.unread_count ?? 0) > 0 && (
                          <span className="bg-green-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{room.unread_count}</span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatListPage() {
  return (
    <Suspense fallback={<div className="pt-20 flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" /></div>}>
      <ChatListContent />
    </Suspense>
  );
}
