'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { Button } from '@/components/ui/button'
import {
   Bold, Italic, Heading2, Heading3, List, ListOrdered,
   Link as LinkIcon, Image as ImageIcon, Undo, Redo, Code,
} from 'lucide-react'
import { useCallback } from 'react'

interface RichEditorProps {
   value: string
   onChange: (html: string) => void
   disabled?: boolean
   placeholder?: string
}

export function RichEditor({ value, onChange, disabled, placeholder }: RichEditorProps) {
   const editor = useEditor({
      extensions: [
         StarterKit,
         Link.configure({ openOnClick: false }),
         Image,
         Placeholder.configure({ placeholder: placeholder || 'Icerik yazin...' }),
      ],
      content: value,
      editable: !disabled,
      onUpdate: ({ editor }) => {
         onChange(editor.getHTML())
      },
   })

   const addLink = useCallback(() => {
      if (!editor) return
      const url = window.prompt('URL giriniz:')
      if (url) {
         editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
      }
   }, [editor])

   const addImage = useCallback(() => {
      if (!editor) return
      const url = window.prompt('Gorsel URL giriniz:')
      if (url) {
         editor.chain().focus().setImage({ src: url }).run()
      }
   }, [editor])

   if (!editor) return null

   return (
      <div className="border rounded-md">
         <div className="flex flex-wrap gap-0.5 border-b p-1 bg-muted/30">
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => editor.chain().focus().toggleBold().run()} data-active={editor.isActive('bold')}>
               <Bold className="h-3.5 w-3.5" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => editor.chain().focus().toggleItalic().run()} data-active={editor.isActive('italic')}>
               <Italic className="h-3.5 w-3.5" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} data-active={editor.isActive('heading', { level: 2 })}>
               <Heading2 className="h-3.5 w-3.5" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} data-active={editor.isActive('heading', { level: 3 })}>
               <Heading3 className="h-3.5 w-3.5" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => editor.chain().focus().toggleBulletList().run()} data-active={editor.isActive('bulletList')}>
               <List className="h-3.5 w-3.5" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => editor.chain().focus().toggleOrderedList().run()} data-active={editor.isActive('orderedList')}>
               <ListOrdered className="h-3.5 w-3.5" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => editor.chain().focus().toggleCodeBlock().run()} data-active={editor.isActive('codeBlock')}>
               <Code className="h-3.5 w-3.5" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={addLink}>
               <LinkIcon className="h-3.5 w-3.5" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={addImage}>
               <ImageIcon className="h-3.5 w-3.5" />
            </Button>
            <div className="ml-auto flex gap-0.5">
               <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
                  <Undo className="h-3.5 w-3.5" />
               </Button>
               <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
                  <Redo className="h-3.5 w-3.5" />
               </Button>
            </div>
         </div>
         <EditorContent editor={editor} className="prose prose-sm dark:prose-invert max-w-none p-4 min-h-[300px] focus-within:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none" />
      </div>
   )
}
