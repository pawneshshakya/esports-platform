
// apps/web/src/components/blog/RichTextEditor.tsx
'use client';

import { useEditor, EditorContent } from '@tiptap/react'; // npm install @tiptap/react @tiptap/starter-kit
import StarterKit from '@tiptap/starter-kit';

export const RichTextEditor = ({ content, onChange }: { content: string, onChange: (html: string) => void }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    }
  });

  if (!editor) return null;

  return (
    <div className="bg-muted border border-border rounded-lg overflow-hidden">
      <div className="flex gap-2 p-2 border-b border-border bg-card">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1 rounded ${editor.isActive('bold') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>Bold</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1 rounded ${editor.isActive('italic') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>Italic</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-1 rounded ${editor.isActive('heading') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>H2</button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-1 rounded ${editor.isActive('bulletList') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>List</button>
      </div>
      <EditorContent editor={editor} className="p-4 min-h-[200px] prose prose-invert max-w-none" />
    </div>
  );
};