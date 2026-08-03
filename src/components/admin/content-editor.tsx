"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Link2,
  ImageIcon,
  Quote,
  List,
  ListOrdered,
  Code,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentEditorProps {
  content: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ContentEditor({
  content,
  onChange,
  placeholder = "Start writing…",
}: ContentEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        // StarterKit includes bold, italic, blockquote, bulletList, orderedList, code, horizontalRule
      }),
      Heading.configure({ levels: [2, 3] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-mark underline" } }),
      Image,
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // Sync external content changes (e.g., when opening edit form)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current !== content) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [editor, content]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", prev ?? "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Image URL");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  const toolbarBtnClass = (active: boolean) =>
    cn(
      "p-1.5 rounded-md transition-colors text-sm",
      active
        ? "bg-mark text-white"
        : "text-soft hover:text-ink hover:bg-stone/50"
    );

  return (
    <div className="rounded-lg border border-rule bg-paper overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-rule bg-surface">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={toolbarBtnClass(editor.isActive("bold"))}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={toolbarBtnClass(editor.isActive("italic"))}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>

        <span className="w-px h-4 bg-rule mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={toolbarBtnClass(editor.isActive("heading", { level: 2 }))}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={toolbarBtnClass(editor.isActive("heading", { level: 3 }))}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <span className="w-px h-4 bg-rule mx-1" />

        <button
          type="button"
          onClick={setLink}
          className={toolbarBtnClass(editor.isActive("link"))}
          title="Link"
        >
          <Link2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={addImage}
          className={toolbarBtnClass(false)}
          title="Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <span className="w-px h-4 bg-rule mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={toolbarBtnClass(editor.isActive("blockquote"))}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={toolbarBtnClass(editor.isActive("bulletList"))}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={toolbarBtnClass(editor.isActive("orderedList"))}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={toolbarBtnClass(editor.isActive("code"))}
          title="Inline Code"
        >
          <Code className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={toolbarBtnClass(false)}
          title="Horizontal Rule"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none px-4 py-3 min-h-[220px] text-ink focus-within:outline-none"
      />
    </div>
  );
}
