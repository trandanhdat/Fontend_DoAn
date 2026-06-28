import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, Strikethrough, Heading2, List, ListOrdered, Quote, Undo, Redo } from 'lucide-react';

interface ArticleEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ArticleEditor({ value, onChange }: ArticleEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[300px] max-w-none p-4',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleStrike = () => editor.chain().focus().toggleStrike().run();
  const toggleHeading = () => editor.chain().focus().toggleHeading({ level: 2 }).run();
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run();
  const toggleBlockquote = () => editor.chain().focus().toggleBlockquote().run();
  const undo = () => editor.chain().focus().undo().run();
  const redo = () => editor.chain().focus().redo().run();

  return (
    <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
      <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap gap-1 items-center">
        <MenuButton onClick={toggleBold} active={editor.isActive('bold')} icon={<Bold className="w-4 h-4" />} title="Bold" />
        <MenuButton onClick={toggleItalic} active={editor.isActive('italic')} icon={<Italic className="w-4 h-4" />} title="Italic" />
        <MenuButton onClick={toggleStrike} active={editor.isActive('strike')} icon={<Strikethrough className="w-4 h-4" />} title="Strikethrough" />
        <div className="w-px h-6 bg-slate-300 mx-1"></div>
        <MenuButton onClick={toggleHeading} active={editor.isActive('heading', { level: 2 })} icon={<Heading2 className="w-4 h-4" />} title="Heading 2" />
        <div className="w-px h-6 bg-slate-300 mx-1"></div>
        <MenuButton onClick={toggleBulletList} active={editor.isActive('bulletList')} icon={<List className="w-4 h-4" />} title="Bullet List" />
        <MenuButton onClick={toggleOrderedList} active={editor.isActive('orderedList')} icon={<ListOrdered className="w-4 h-4" />} title="Ordered List" />
        <MenuButton onClick={toggleBlockquote} active={editor.isActive('blockquote')} icon={<Quote className="w-4 h-4" />} title="Blockquote" />
        <div className="w-px h-6 bg-slate-300 mx-1"></div>
        <MenuButton onClick={undo} active={false} icon={<Undo className="w-4 h-4" />} title="Undo" disabled={!editor.can().undo()} />
        <MenuButton onClick={redo} active={false} icon={<Redo className="w-4 h-4" />} title="Redo" disabled={!editor.can().redo()} />
      </div>
      <EditorContent editor={editor} className="min-h-[300px] cursor-text" onClick={() => editor.commands.focus()} />
    </div>
  );
}

function MenuButton({ onClick, active, icon, title, disabled }: { onClick: () => void; active: boolean; icon: React.ReactNode; title: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded hover:bg-slate-200 transition-colors ${active ? 'bg-slate-200 text-[#15718E]' : 'text-slate-600'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {icon}
    </button>
  );
}
