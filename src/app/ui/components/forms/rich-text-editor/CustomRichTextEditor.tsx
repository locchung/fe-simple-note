'use client';

import dynamic from 'next/dynamic';
import React, { useRef } from 'react';
import 'react-quill/dist/quill.snow.css';
import './CustomRichTextEditor.css';


const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill');
    return ({ forwardedRef, ...props }: any) => <RQ ref={forwardedRef} {...props} />;
  },
  { ssr: false }
);

interface CustomRichTextEditorProps {
  value: string | undefined;
  setValue: (value: string) => void;
  [key: string]: any;
}

const CustomRichTextEditor: React.FC<CustomRichTextEditorProps> = ({
  value,
  setValue,
  ...props
}) => {
  const quillRef = useRef<any>(null);

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        [{ font: [] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: '' }, { align: 'center' }, { align: 'right' }, { align: 'justify' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        // image: imageHandler
      }
    },
    clipboard: {
      matchVisual: false
    },
    history: {
      delay: 1000,
      maxStack: 50,
      userOnly: true
    }
  };

  const formats = [
    'header',
    'font',
    'bold',
    'italic',
    'underline',
    'strike',
    'color',
    'background',
    'list',
    'bullet',
    'align',
    'blockquote',
    'code-block',
    'link',
    'image'
  ];

  return (
    <div className="rich-text-editor">
      <ReactQuill
        forwardedRef={quillRef}
        theme="snow"
        value={value}
        onChange={setValue}
        modules={modules}
        formats={formats}
        {...props}
      />
    </div>
  );
};

export default CustomRichTextEditor;
