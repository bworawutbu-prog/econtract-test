"use client";

import { useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import AttachmentIcon from "@/assets/webp/attachment.webp";

interface TextEditorComponentProps {
  onChange: (content: string) => void;
}

export default function TextEditorComponent({
  onChange,
}: TextEditorComponentProps) {
  const editorRef = useRef(null);
  const [attachments, setAttachments] = useState<string[]>([]);

  useEffect(() => {
    const toolbars = document.querySelectorAll(".ql-toolbar");
    if (toolbars.length > 0) {
      toolbars[0].remove();
    }
    if (editorRef.current) {
      const quill = new Quill(editorRef.current, {
        theme: "snow",
        modules: {
            toolbar: {
                container: [
                    [{font: []}, { header: [1, 2, 3, false] },'bold', 'italic', 'underline',{color: []}, {background: []}],
                    [{align: []}, {list: 'bullet'}, {list: 'ordered'}, {indent: '-1'}, {indent: '+1'}],
                    // ['link','image','attachment'],
                    // ['link','image'],
                ]
            }
        }
    });

      // add icon to attachment button(s)
      const attachmentElements =
        document.getElementsByClassName("ql-attachment");
      Array.from(attachmentElements).forEach((el) => {
        const button = el as HTMLElement;
        // Remove any existing children (optional, to avoid duplicates)
        while (button.firstChild) {
          button.removeChild(button.firstChild);
        }
        // Create an img element to use the SVG as an icon
        const iconImg = document.createElement("img");
        iconImg.src = AttachmentIcon.src;
        iconImg.alt = "Attachment";
        iconImg.style.width = "16px";
        iconImg.style.height = "16px";
        iconImg.style.verticalAlign = "middle";
        button.appendChild(iconImg);
        button.style.color = "#454545";
        // add event listener to attachment button
        button.addEventListener("click", () => {
          const fileInput = document.createElement("input");
          fileInput.type = "file";
          // only pdf file
          fileInput.accept = "application/pdf";
          // select one file
          fileInput.multiple = false;
          fileInput.style.display = "none";
          document.body.appendChild(fileInput);
          fileInput.click();
          // add event listener to file input
          const handleChange = (e: Event) => {
            const input = e.target as HTMLInputElement;
            const file = (input.files && input.files[0]) || null;
            if (!file) {
              cleanup();
              return;
            }
            const reader = new FileReader();
            reader.onload = (evt) => {
              const base64 = (evt.target?.result as string) || "";
              setAttachments((prev) => {
                const next = [...prev, base64];
                try {
                  (quill as any)?.emitter?.emit?.("attachment", {
                    attachments: next,
                    file,
                    base64,
                  });
                } catch {}
                return next;
              });
              cleanup();
            };
            reader.readAsDataURL(file);
          };
          const cleanup = () => {
            try {
              fileInput.removeEventListener("change", handleChange);
            } catch {}
            try {
              fileInput.value = "";
            } catch {}
            try {
              fileInput.remove();
            } catch {}
          };
          fileInput.addEventListener("change", handleChange);
        });
      });
      // handle text change
      quill.on("text-change", (delta: any, oldDelta: any, source: any) => {
        const html = quill.root.innerHTML;
        const quillDelta = quill.getContents();
        onChange(html);
      });

      // handle attachment change
      // quill.on('attachment', (delta: any, oldDelta: any, source: any) => {
      //     const quillDelta = quill.getContents();
      //     if (Array.isArray(quillDelta.ops)) {
      //         const lastDelta = quillDelta.ops[quillDelta.ops.length - 1];
      //     }
      //     const html = quill.root.innerHTML;
      //     onChange(html);
      // });
    }
  }, []);

  return (
    <div className="quill-theme">
      <div ref={editorRef} />
    </div>
  );
}
