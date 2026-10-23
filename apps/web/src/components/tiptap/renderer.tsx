import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import "./styles.css";

interface TiptapRendererProps {
  content: unknown;
  className?: string;
}

export function TiptapRenderer({ content, className }: TiptapRendererProps) {
  const editor = useEditor({
    // Harus mencakup semua node/mark yang bisa dibuat editor admin (tiptap-templates/simple):
    // konten dengan node/mark yang tidak dikenal dibuang seluruhnya oleh Tiptap, sehingga catatan tampil kosong.
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      TaskList,
      TaskItem.configure({ nested: true }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
    ],
    editable: false,
    content: content as object,
  });

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content as object, { emitUpdate: false });
    }
  }, [editor, content]);

  if (!editor) {
    return null;
  }

  return (
    <div className={className}>
      <EditorContent editor={editor} />
    </div>
  );
}
