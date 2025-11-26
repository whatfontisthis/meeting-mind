import React from 'react';

interface HeaderProps {
  onApiKeyClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onApiKeyClick }) => {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-2 rounded-lg shadow-md">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">MeetingMind</h1>
          <p className="text-xs text-slate-500 font-medium">AI 전사 및 어시스턴트</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <a 
          href="#" 
          className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
          onClick={(e) => e.preventDefault()} // Placeholder logic
        >
          기록
        </a>
        <button
          onClick={onApiKeyClick}
          className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
        >
          설정
        </button>
        <div className="w-px h-6 bg-slate-200 mx-2"></div>
        <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                JD
            </div>
        </div>
      </div>
    </header>
  );
};
