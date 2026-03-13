"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";

type AuthContextType = {
  user: { id: string; email?: string } | null;
  loading: boolean;
  requireAuth: (message?: string) => boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  requireAuth: () => false,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ? { id: user.id, email: user.email ?? undefined } : null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email ?? undefined } : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const requireAuth = useCallback((message?: string): boolean => {
    if (user) return true;
    setModalMessage(message || "이 기능을 사용하려면 로그인이 필요합니다.");
    setModalOpen(true);
    return false;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, requireAuth }}>
      {children}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-sm text-center">
          <DialogHeader className="items-center">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Sprout className="w-7 h-7 text-green-600" />
            </div>
            <DialogTitle className="text-lg">로그인이 필요합니다</DialogTitle>
            <DialogDescription className="mt-1">
              {modalMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-2">
            <Button
              onClick={() => { setModalOpen(false); router.push("/login"); }}
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl h-11"
            >
              <LogIn className="w-4 h-4 mr-2" />
              로그인하기
            </Button>
            <Button
              variant="outline"
              onClick={() => { setModalOpen(false); router.push("/register"); }}
              className="w-full rounded-xl h-11"
            >
              회원가입하기
            </Button>
            <button
              onClick={() => setModalOpen(false)}
              className="text-sm text-gray-400 hover:text-gray-600 mt-1"
            >
              나중에 할게요
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </AuthContext.Provider>
  );
}
