import { FileText, Image, Folder, Music, Video, MoreVertical } from "lucide-react";
import { FileItem } from "@/hooks/useFileSystem";
import { cn } from "@/lib/utils";

interface FileGridProps {
    files: FileItem[];
}

const FileIcon = ({ type, className }: { type: string; className?: string }) => {
    switch (type) {
        case "folder":
            return <Folder className={cn("text-blue-500", className)} />;
        case "image":
            return <Image className={cn("text-purple-500", className)} />;
        case "video":
            return <Video className={cn("text-red-500", className)} />;
        case "audio":
            return <Music className={cn("text-yellow-500", className)} />;
        default:
            return <FileText className={cn("text-gray-500", className)} />;
    }
};

export function FileGrid({ files }: FileGridProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {files.map((file) => (
                <div
                    key={file.id}
                    className="group relative bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                >
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                            <FileIcon type={file.type} className="w-6 h-6" />
                        </div>
                        <button className="p-1 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical size={16} className="text-gray-500" />
                        </button>
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-900 truncate" title={file.name}>
                            {file.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            {file.size ? file.size : file.modified}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
