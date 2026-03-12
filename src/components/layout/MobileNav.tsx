"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PenSquare, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export default function MobileNav() {
  const pathname = usePathname();
  const { profile } = useAuth();

  const myPageHref =
    profile?.role === "COMPANY"
      ? "/partner/dashboard"
      : profile?.role === "ADMIN"
        ? "/admin/dashboard"
        : "/mypage";

  const navItems = [
    { label: "홈", href: "/", icon: Home },
    { label: "탐색", href: "/explore", icon: Search },
    { label: "견적요청", href: "/quote", icon: PenSquare },
    { label: "메시지", href: "/chat", icon: MessageCircle },
    { label: "MY", href: myPageHref, icon: User },
  ];

  // Hide on certain pages like chat room, login, etc.
  const hiddenPaths = ["/login", "/register", "/forgot-password"];
  const isChatRoom = pathname.startsWith("/chat/");
  if (hiddenPaths.includes(pathname) || isChatRoom) return null;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-1 transition-colors",
                isActive ? "text-green-600" : "text-gray-400"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
