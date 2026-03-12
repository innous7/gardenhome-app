import Link from "next/link";
import { Leaf } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="p-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">GardenHome</span>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 pb-20">
        {children}
      </div>
    </div>
  );
}
