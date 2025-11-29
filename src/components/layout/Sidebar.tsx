import Link from "next/link";
import { Folder, Clock, Star, Trash2, Cloud, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "All Files", icon: Folder, href: "/dashboard" },
    { name: "Recent", icon: Clock, href: "/dashboard/recent" },
    { name: "Favorites", icon: Star, href: "/dashboard/favorites" },
    { name: "Trash", icon: Trash2, href: "/dashboard/trash" },
];

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps = {}) {
    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Sidebar Container */}
            <div className={cn(
                "fixed md:static inset-y-0 left-0 z-50 w-64 bg-gray-50 border-r border-gray-200 h-screen flex flex-col p-4 transition-transform duration-300 md:transform-none",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex items-center justify-between px-2 mb-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                            <Cloud size={20} />
                        </div>
                        <span className="font-bold text-xl text-gray-900">CloudDoc</span>
                    </div>
                    {/* Close button for mobile */}
                    <button onClick={onClose} className="md:hidden p-1 text-gray-500 hover:bg-gray-200 rounded-lg">
                        <Settings size={20} className="rotate-45" /> {/* Using Settings as X icon for now or could import X */}
                    </button>
                </div>

                <nav className="flex-1 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={onClose}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                item.name === "All Files"
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            )}
                        >
                            <item.icon size={18} />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto pt-4 border-t border-gray-200">
                    <Link
                        href="/settings"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    >
                        <Settings size={18} />
                        Settings
                    </Link>
                </div>
            </div>
        </>
    );
}
