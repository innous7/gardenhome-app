"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Leaf, Search, User, LogOut, LayoutDashboard, MessageCircle, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/app/(auth)/actions";

const CATEGORY_TABS = [
  { label: "홈", href: "/" },
  { label: "포트폴리오", href: "/explore" },
  { label: "조경회사", href: "/companies" },
  { label: "블로그", href: "/blog" },
  { label: "커뮤니티", href: "/community" },
  { label: "식물도감", href: "/plants" },
  { label: "조경관리", href: "/flotren" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, profile, loading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
      setUnreadCount(count || 0);
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const dashboardLink =
    profile?.role === "COMPANY"
      ? "/partner/dashboard"
      : profile?.role === "ADMIN"
        ? "/admin/dashboard"
        : "/mypage";

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      {/* Top row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 shrink-0">
            <Leaf className="w-5 h-5 text-green-600" />
            <span className="text-lg font-bold text-gray-900">
              GardenHome
            </span>
          </Link>

          {/* Search bar - desktop */}
          <Link
            href="/search"
            className="hidden lg:flex items-center gap-2 w-[400px] mx-8 px-4 py-2.5 bg-gray-100 rounded-full text-sm text-gray-400 hover:bg-gray-150 transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4 text-gray-400" />
            <span>어떤 조경을 찾고 계세요?</span>
          </Link>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <Link href="/quote">
              <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-5 h-9 text-sm font-medium">
                견적요청
              </Button>
            </Link>
            {!loading && user ? (
              <div className="flex items-center gap-1">
                <Link href="/chat">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-gray-700 hover:text-gray-900 hover:bg-gray-100 h-9 w-9"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/notifications" className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-gray-700 hover:text-gray-900 hover:bg-gray-100 h-9 w-9"
                  >
                    <Bell className="w-4 h-4" />
                  </Button>
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
                <Link href={dashboardLink}>
                  <Button
                    variant="ghost"
                    className="rounded-full text-gray-700 hover:text-gray-900 hover:bg-gray-100 h-9 px-3 text-sm"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-1.5" />
                    {profile?.name || "마이페이지"}
                  </Button>
                </Link>
                <form action={signOut}>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 h-9 w-9"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            ) : !loading ? (
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="rounded-full text-gray-700 hover:text-gray-900 hover:bg-gray-100 h-9 px-3 text-sm"
                >
                  <User className="w-4 h-4 mr-1.5" />
                  로그인
                </Button>
              </Link>
            ) : null}
          </div>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center gap-1">
            <Link href="/search">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-gray-700 h-9 w-9"
              >
                <Search className="w-5 h-5" />
              </Button>
            </Link>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger className="inline-flex items-center justify-center rounded-full p-2 text-gray-700 hover:bg-gray-100">
                <Menu className="w-5 h-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetTitle className="sr-only">메뉴</SheetTitle>
                <div className="flex flex-col gap-6 mt-8">
                  <Link
                    href="/"
                    className="flex items-center gap-1.5"
                    onClick={() => setOpen(false)}
                  >
                    <Leaf className="w-5 h-5 text-green-600" />
                    <span className="text-lg font-bold text-gray-900">
                      GardenHome
                    </span>
                  </Link>

                  {/* Search in mobile menu */}
                  <Link
                    href="/search"
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-full text-sm text-gray-400"
                    onClick={() => setOpen(false)}
                  >
                    <Search className="w-4 h-4" />
                    <span>어떤 조경을 찾고 계세요?</span>
                  </Link>

                  <nav className="flex flex-col gap-1">
                    {NAV_ITEMS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "text-base font-medium py-2.5 px-3 rounded-lg transition-colors",
                          pathname === item.href
                            ? "text-green-600 bg-green-50"
                            : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                        )}
                        onClick={() => setOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>

                  <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                    <Link href="/quote" onClick={() => setOpen(false)}>
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full">
                        견적요청
                      </Button>
                    </Link>
                    {!loading && user ? (
                      <>
                        <Link
                          href="/chat"
                          onClick={() => setOpen(false)}
                        >
                          <Button
                            variant="outline"
                            className="w-full rounded-full"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            메시지
                          </Button>
                        </Link>
                        <Link
                          href={dashboardLink}
                          onClick={() => setOpen(false)}
                        >
                          <Button
                            variant="outline"
                            className="w-full rounded-full"
                          >
                            <LayoutDashboard className="w-4 h-4 mr-2" />
                            {profile?.name || "마이페이지"}
                          </Button>
                        </Link>
                        <form action={signOut}>
                          <Button
                            type="submit"
                            variant="ghost"
                            className="w-full rounded-full text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            로그아웃
                          </Button>
                        </form>
                      </>
                    ) : !loading ? (
                      <Link href="/login" onClick={() => setOpen(false)}>
                        <Button
                          variant="outline"
                          className="w-full rounded-full"
                        >
                          로그인
                        </Button>
                      </Link>
                    ) : null}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Category navigation - desktop only */}
      <div className="hidden lg:block border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-8 h-12">
            {CATEGORY_TABS.map((tab) => {
              const isActive =
                tab.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "relative h-full inline-flex items-center text-sm font-medium transition-colors",
                    isActive
                      ? "text-green-600"
                      : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  {tab.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
