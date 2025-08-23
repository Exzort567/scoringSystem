"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ReactNode } from "react";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: "📊" },
  { name: "Contestants", href: "/admin/contestants", icon: "👤" },
  { name: "Judges", href: "/admin/judges", icon: "⚖️" },
  { name: "Rounds", href: "/admin/rounds", icon: "🔒" },
  { name: "Scores", href: "/admin/scores", icon: "📝" },
  { name: "Results", href: "/admin/results", icon: "🏆" },
  { name: "Reports", href: "/admin/reports", icon: "📑" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-gray-700">
          🎤 Pageant Admin
        </div>
        <nav className="flex-1 px-2 py-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition 
                ${pathname === item.href ? "bg-gray-700" : "hover:bg-gray-800"}`}
            >
              <span>{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-6">{children}</main>
    </div>
  );
}
