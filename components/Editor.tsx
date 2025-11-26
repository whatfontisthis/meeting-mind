import React from 'react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">에디터</span>
        <span className="text-xs text-slate-400">마크다운 지원</span>
      </div>
      <textarea
        className="flex-1 w-full p-6 resize-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-100 text-slate-800 leading-relaxed font-mono text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        placeholder="노트가 여기에 표시됩니다..."
      />
    </div>
  );
};
