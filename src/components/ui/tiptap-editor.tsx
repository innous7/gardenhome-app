"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code,
  AlignLeft, AlignCenter, AlignRight,
  ImageIcon, LinkIcon, Undo, Redo, Minus,
} from "lucide-react";

interface TiptapEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
}

export function TiptapEditor({ content = "", onChange, placeholder = "내용을 입력하세요..." }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-green max-w-none min-h-[300px] p-4 focus:outline-none",
      },
    },
  });

  if (!editor) return null;

  const ToolButton = ({ onClick, active, children, title }: { onClick: () => void; active?: boolean; children: React.ReactNode; title?: string }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-lg transition-colors ${active ? "bg-green-100 text-green-700" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"}`}
    >
      {children}
    </button>
  );

  const addImage = () => {
    const url = window.prompt("이미지 URL을 입력하세요:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const addLink = () => {
    const url = window.prompt("링크 URL을 입력하세요:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap gap-0.5">
        {/* Text formatting */}
        <ToolButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="굵게">
          <Bold className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="기울임">
          <Italic className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="밑줄">
          <UnderlineIcon className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="취소선">
          <Strikethrough className="w-4 h-4" />
        </ToolButton>

        <div className="w-px bg-gray-200 mx-1" />

        {/* Headings */}
        <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="제목 1">
          <Heading1 className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="제목 2">
          <Heading2 className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="제목 3">
          <Heading3 className="w-4 h-4" />
        </ToolButton>

        <div className="w-px bg-gray-200 mx-1" />

        {/* Lists */}
        <ToolButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="목록">
          <List className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="번호 목록">
          <ListOrdered className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="인용구">
          <Quote className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="코드 블록">
          <Code className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="구분선">
          <Minus className="w-4 h-4" />
        </ToolButton>

        <div className="w-px bg-gray-200 mx-1" />

        {/* Alignment */}
        <ToolButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="왼쪽 정렬">
          <AlignLeft className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="가운데 정렬">
          <AlignCenter className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="오른쪽 정렬">
          <AlignRight className="w-4 h-4" />
        </ToolButton>

        <div className="w-px bg-gray-200 mx-1" />

        {/* Media */}
        <ToolButton onClick={addImage} title="이미지">
          <ImageIcon className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={addLink} title="링크">
          <LinkIcon className="w-4 h-4" />
        </ToolButton>

        <div className="w-px bg-gray-200 mx-1" />

        {/* Undo/Redo */}
        <ToolButton onClick={() => editor.chain().focus().undo().run()} title="실행 취소">
          <Undo className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().redo().run()} title="다시 실행">
          <Redo className="w-4 h-4" />
        </ToolButton>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
