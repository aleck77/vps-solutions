
'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import type { SimpleMDEEditorProps } from 'react-simplemde-editor';

// Dynamically import SimpleMdeReact to avoid SSR issues with its dependency on `window`
const SimpleMdeReact = dynamic(() => import('react-simplemde-editor'), { ssr: false });

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  // Memoize options to prevent re-rendering on every keystroke
  const options: SimpleMDEEditorProps['options'] = useMemo(() => {
    return {
      autofocus: false,
      spellChecker: false,
      // You can customize the toolbar here if needed
      // See https://github.com/Ionaru/easy-markdown-editor#configuration for all options
      toolbar: [
        "bold", "italic", "heading", "|", 
        "quote", "unordered-list", "ordered-list", "|",
        "link", "image", "|",
        "preview", "side-by-side", "fullscreen", "|",
        "guide"
      ],
      minHeight: "150px", // Set a minimum height
      status: false, // Hide the status bar
    };
  }, []);

  return <SimpleMdeReact options={options} value={value} onChange={onChange} />;
}
