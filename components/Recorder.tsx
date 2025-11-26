import React, { useState, useRef, useEffect } from 'react';
import { AppState } from '../types';

interface RecorderProps {
  appState: AppState;
  setAppState: (state: AppState) => void;
  onRecordingComplete: (blob: Blob, mimeType: string) => void;
}

export const Recorder: React.FC<RecorderProps> = ({ appState, setAppState, onRecordingComplete }) => {
  const [timer, setTimer] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Determine supported mime type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        onRecordingComplete(blob, mimeType);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setAppState(AppState.RECORDING);
      setTimer(0);
      
      timerIntervalRef.current = window.setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("마이크에 접근할 수 없습니다. 권한이 허용되었는지 확인해주세요.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  if (appState === AppState.RECORDING) {
    return (
      <div className="flex flex-col items-center justify-center space-y-8 p-8 animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 bg-red-500 rounded-full opacity-20 animate-ping"></div>
          <div className="relative bg-white p-8 rounded-full shadow-xl border-4 border-red-100">
            <svg className="w-16 h-16 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          </div>
        </div>
        
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight font-mono">
            {formatTime(timer)}
          </h2>
          <p className="text-slate-500 mt-2">녹음 중...</p>
        </div>

        <button
          onClick={stopRecording}
          className="group relative inline-flex items-center justify-center px-8 py-4 font-semibold text-white transition-all duration-200 bg-red-500 rounded-full hover:bg-red-600 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-red-300"
        >
          <span className="mr-2">■</span> 회의 중지
        </button>
      </div>
    );
  }

  // Idle State
  return (
    <div className="flex flex-col items-center justify-center space-y-8 p-8">
      <div className="p-8 bg-blue-50 rounded-full mb-4">
        <svg className="w-16 h-16 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </div>

      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">새 세션 시작</h1>
        <p className="text-slate-500 leading-relaxed">
          회의 토론을 녹음하세요. 오디오를 전사하고 구조화된 비즈니스 노트를 자동으로 생성해드립니다.
        </p>
      </div>

      <button
        onClick={startRecording}
        className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-300 active:translate-y-0"
      >
        <svg className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
        녹음 시작
      </button>
    </div>
  );
};
