"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, LayoutDashboard, FileEdit, Users, Building2, FileText, BarChart3, Settings, LogOut, Sprout, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/(auth)/actions";

const sidebarItems = [
  { label: "대시보드", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "블로그 관리", href: "/admin/blog", icon: FileEdit },
  { label: "회원 관리", href: "/admin/users", icon: Users },
  { label: "조경회사 관리", href: "/admin/companies", icon: Building2 },
  { label: "포트폴리오 관리", href: "/admin/portfolios", icon: Briefcase },
  { label: "거래 관리", href: "/admin/transactions", icon: FileText },
  { label: "Flotren 관리", href: "/admin/flotren", icon: Sprout },
  { label: "통계", href: "/admin/stats", icon: BarChart3 },
  { label: "설정", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden lg:flex w-64 bg-gray-900 text-white flex-col fixed inset-y-0 left-0 z-40">
        <div className="p-6 border-b border-gray-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold">GardenHome</span>
              <span className="text-xs text-green-400 block -mt-0.5">관리자</span>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                pathname.startsWith(item.href)
                  ? "bg-green-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <form action={signOut}>
            <button type="submit" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white w-full transition-colors">
              <LogOut className="w-5 h-5" />
              로그아웃
            </button>
          </form>
        </div>
      </aside>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold">Admin</span>
        </Link>
        <nav className="flex gap-1">
          {sidebarItems.slice(0, 6).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn("p-2 rounded-lg", pathname.startsWith(item.href) ? "bg-green-600" : "text-gray-400")}
            >
              <item.icon className="w-5 h-5" />
            </Link>
          ))}
        </nav>
      </div>

      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
