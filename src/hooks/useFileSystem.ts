import { useState } from "react";
import { FileText, Image, Folder, Music, Video } from "lucide-react";

export type FileType = "folder" | "image" | "document" | "video" | "audio";

export interface FileItem {
    id: string;
    name: string;
    type: FileType;
    size?: string;
    modified: string;
}

const initialFiles: FileItem[] = [
    { id: "1", name: "Documents", type: "folder", modified: "2023-10-27" },
    { id: "2", name: "Images", type: "folder", modified: "2023-10-26" },
    { id: "3", name: "Project Proposal.pdf", type: "document", size: "2.4 MB", modified: "2023-10-25" },
    { id: "4", name: "Design Assets.zip", type: "document", size: "156 MB", modified: "2023-10-24" },
    { id: "5", name: "Meeting Recording.mp4", type: "video", size: "450 MB", modified: "2023-10-23" },
    { id: "6", name: "Profile.jpg", type: "image", size: "1.2 MB", modified: "2023-10-22" },
];

export function useFileSystem() {
    const [files, setFiles] = useState<FileItem[]>(initialFiles);
    const [currentPath, setCurrentPath] = useState<string[]>([]);

    const createFolder = (name: string) => {
        const newFolder: FileItem = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            type: "folder",
            modified: new Date().toISOString().split("T")[0],
        };
        setFiles((prev) => [newFolder, ...prev]);
    };

    const uploadFile = (file: File) => {
        const newFile: FileItem = {
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            type: file.type.includes("image") ? "image" : file.type.includes("video") ? "video" : file.type.includes("audio") ? "audio" : "document",
            size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            modified: new Date().toISOString().split("T")[0],
        };
        setFiles((prev) => [newFile, ...prev]);
    };

    return {
        files,
        currentPath,
        createFolder,
        uploadFile,
    };
}
