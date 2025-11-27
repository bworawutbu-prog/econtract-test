"use client";

import { Search, Bell, Plus, Filter } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { FileGrid } from "@/components/file-browser/FileGrid";
import { useFileSystem } from "@/hooks/useFileSystem";

export default function Home() {
  const { files, createFolder, uploadFile } = useFileSystem();

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search files, folders..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 ml-4">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"></div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Cloud</h1>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter size={18} />
                <span>Filter</span>
              </button>
              <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow cursor-pointer">
                <Plus size={18} />
                <span>New Upload</span>
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
            <h2 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Recent Files</h2>
            <FileGrid files={files} />
          </div>
        </div>
      </main>
    </div>
  );
}
