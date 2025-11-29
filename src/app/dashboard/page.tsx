"use client";

import { useState } from "react";
import { Search, Bell, Plus, Filter, Clock, Menu } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { FileGrid } from "@/components/file-browser/FileGrid";
import { useFileSystem } from "@/hooks/useFileSystem";

export default function Home() {
  const { files, createFolder, uploadFile } = useFileSystem();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F7F5F2]">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <main className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="h-16 md:h-20 border-b border-gray-200 flex items-center justify-between px-4 md:px-8 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 md:gap-4 flex-1 max-w-2xl">
            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} />
            </button>

            <div className="relative flex-1 group">
              <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 md:pl-12 pr-4 py-2 md:py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm text-sm md:text-base"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6 ml-2 md:ml-4">
            <button className="p-2 text-gray-500 hover:bg-white hover:shadow-md rounded-full transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-3 md:pl-6 border-l border-gray-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-gray-900">John Doe</p>
                <p className="text-xs text-gray-500">Pro Plan</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg shadow-blue-500/20 ring-2 ring-white"></div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">My Cloud</h1>
              <p className="text-sm md:text-base text-gray-500 mt-1">Manage your files and folders</p>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <button className="flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm hover:shadow text-sm md:text-base">
                <Filter size={18} />
                <span className="hidden md:inline">Filter</span>
              </button>
              <label className="flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-gray-900 text-white rounded-xl hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer text-sm md:text-base">
                <Plus size={18} />
                <span className="hidden md:inline">New Upload</span>
                <span className="md:hidden">Upload</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      uploadFile(e.target.files[0]);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-sm font-bold text-gray-400 mb-4 md:mb-6 uppercase tracking-wider flex items-center gap-2">
              <Clock size={16} />
              Recent Files
            </h2>
            <FileGrid files={files} />
          </div>
        </div>
      </main>
    </div>
  );
}
