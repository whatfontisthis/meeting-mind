import React from 'react';

export const Processing: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">회의 분석 중</h2>
      <p className="text-slate-500 max-w-sm">
        Gemini가 오디오를 전사하고 구조화된 노트를 생성하고 있습니다. 녹음 길이에 따라 시간이 걸릴 수 있습니다.
      </p>
    </div>
  );
};
