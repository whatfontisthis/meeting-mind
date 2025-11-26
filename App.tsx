import React, { useState, useEffect } from 'react';
import { AppState } from './types';
import { generateMeetingNotes } from './services/geminiService';
import { Header } from './components/Header';
import { Recorder } from './components/Recorder';
import { Editor } from './components/Editor';
import { Processing } from './components/Processing';
import { ApiKeyModal } from './components/ApiKeyModal';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  useEffect(() => {
    // 페이지 로드 시 localStorage에서 API 키 확인
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    } else {
      setShowApiKeyModal(true);
    }
  }, []);

  const handleApiKeySet = (key: string) => {
    setApiKey(key);
    setShowApiKeyModal(false);
  };

  const handleRecordingComplete = async (blob: Blob, mimeType: string) => {
    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }

    setAppState(AppState.PROCESSING);
    setError(null);
    try {
      const generatedNotes = await generateMeetingNotes(blob, mimeType, apiKey);
      setNotes(generatedNotes);
      setAppState(AppState.REVIEW);
    } catch (err) {
      console.error(err);
      setError("노트 생성에 실패했습니다. API 키를 확인해주세요.");
      setAppState(AppState.ERROR);
    }
  };

  const handleShare = () => {
    const subject = encodeURIComponent("회의 노트");
    const body = encodeURIComponent(notes);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleReset = () => {
    if (confirm("새로운 회의를 시작하시겠습니까? 저장하지 않으면 현재 노트가 손실됩니다.")) {
      setNotes('');
      setAppState(AppState.IDLE);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <Header onApiKeyClick={() => setShowApiKeyModal(true)} />
      
      {/* API 키 모달 */}
      {showApiKeyModal && (
        <ApiKeyModal 
          onApiKeySet={handleApiKeySet} 
          onClose={() => apiKey ? setShowApiKeyModal(false) : undefined}
          isOpen={showApiKeyModal}
        />
      )}
      
      <main className="flex-1 overflow-hidden relative">
        
        {/* Error Notification */}
        {error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-200 text-red-700 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center">
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
            <button onClick={() => setError(null)} className="ml-4 text-red-900 font-bold">&times;</button>
          </div>
        )}

        {/* Content Area */}
        <div className="h-full w-full max-w-5xl mx-auto p-6 flex flex-col">
          
          {(appState === AppState.IDLE || appState === AppState.RECORDING) && (
             <div className="flex-1 flex flex-col justify-center bg-white rounded-2xl shadow-sm border border-slate-200 m-4">
              <Recorder 
                appState={appState} 
                setAppState={setAppState} 
                onRecordingComplete={handleRecordingComplete} 
              />
            </div>
          )}

          {appState === AppState.PROCESSING && (
             <div className="flex-1 flex flex-col justify-center bg-white rounded-2xl shadow-sm border border-slate-200 m-4">
              <Processing />
            </div>
          )}

          {appState === AppState.REVIEW && (
            <div className="flex-1 flex flex-col space-y-4 h-full">
              
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm shrink-0">
                <div>
                   <h2 className="text-lg font-bold text-slate-800">회의 노트 검토</h2>
                   <p className="text-sm text-slate-500">공유하기 전에 노트를 편집하고 다듬어보세요.</p>
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={handleReset}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    새 회의
                  </button>
                  <button 
                    onClick={handleShare}
                    className="flex items-center px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all hover:shadow-lg active:scale-95"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    이메일로 공유
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0">
                <Editor value={notes} onChange={setNotes} />
              </div>
            </div>
          )}

           {appState === AppState.ERROR && (
             <div className="flex-1 flex flex-col justify-center items-center bg-white rounded-2xl shadow-sm border border-slate-200 m-4 p-8 text-center">
                <div className="text-red-500 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">문제가 발생했습니다</h3>
                <p className="text-slate-500 mb-6">오디오를 처리할 수 없습니다. 네트워크 문제이거나 녹음 시간이 너무 짧을 수 있습니다.</p>
                <button 
                  onClick={() => setAppState(AppState.IDLE)}
                  className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
                >
                  다시 시도
                </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default App;
