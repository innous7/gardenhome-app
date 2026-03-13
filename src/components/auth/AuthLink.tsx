"use client";

import { type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

interface AuthLinkProps {
  href: string;
  message?: string;
  children: ReactNode;
  className?: string;
}

export function AuthLink({ href, message, children, className }: AuthLinkProps) {
  const router = useRouter();
  const { requireAuth } = useAuth();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (requireAuth(message)) {
      router.push(href);
    }
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
