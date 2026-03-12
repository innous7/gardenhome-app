"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, Check, FileText, MessageCircle, Star, Hammer, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/notifications";

const TYPE_ICONS: Record<string, React.ElementType> = {
  QUOTE_REQUEST: FileText,
  QUOTE_RECEIVED: FileText,
  CONTRACT_SIGNED: FileText,
  PROJECT_UPDATE: Hammer,
  REVIEW: Star,
  MESSAGE: MessageCircle,
  SYSTEM: AlertCircle,
};

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      setNotifications((data as Notification[] | null) ?? []);
      setLoading(false);
    };
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markNotificationRead(notification.id);
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
    }
  };

  if (loading) return <div className="pt-20 flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" /></div>;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">알림</h1>
            {unreadCount > 0 && <p className="text-sm text-gray-500 mt-0.5">읽지 않은 알림 {unreadCount}개</p>}
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" onClick={handleMarkAllRead} className="text-sm text-green-600 hover:text-green-700">
              <Check className="w-4 h-4 mr-1" /> 모두 읽음
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-lg">알림이 없습니다</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map(notification => {
              const IconComponent = TYPE_ICONS[notification.type] || Bell;
              const content = (
                <Card className={`p-4 cursor-pointer transition-colors ${notification.is_read ? "bg-white" : "bg-green-50 border-green-200"}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${notification.is_read ? "bg-gray-100" : "bg-green-100"}`}>
                      <IconComponent className={`w-4 h-4 ${notification.is_read ? "text-gray-500" : "text-green-600"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${notification.is_read ? "text-gray-700" : "font-medium text-gray-900"}`}>{notification.title}</p>
                      {notification.message && <p className="text-xs text-gray-500 mt-0.5">{notification.message}</p>}
                      <p className="text-[10px] text-gray-400 mt-1">{new Date(notification.created_at).toLocaleString("ko-KR")}</p>
                    </div>
                    {!notification.is_read && <div className="w-2 h-2 bg-green-600 rounded-full shrink-0 mt-2" />}
                  </div>
                </Card>
              );

              return notification.link ? (
                <Link key={notification.id} href={notification.link} onClick={() => handleClick(notification)}>
                  {content}
                </Link>
              ) : (
                <div key={notification.id} onClick={() => handleClick(notification)}>
                  {content}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
