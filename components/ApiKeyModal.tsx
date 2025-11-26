import React, { useState, useEffect } from 'react';
import { validateApiKey } from '../services/geminiService';

interface ApiKeyModalProps {
  onApiKeySet: (apiKey: string) => void;
  onClose?: () => void;
  isOpen: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onApiKeySet, onClose, isOpen }) => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // localStorage에서 저장된 API 키 확인
      const savedApiKey = localStorage.getItem('gemini_api_key');
      if (savedApiKey) {
        setApiKey(savedApiKey);
      } else {
        setApiKey('');
      }
      setError('');
      setIsValidating(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('API 키를 입력해주세요.');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const isValid = await validateApiKey(apiKey.trim());
      
      if (isValid) {
        localStorage.setItem('gemini_api_key', apiKey.trim());
        onApiKeySet(apiKey.trim());
        if (onClose) {
          onClose();
        }
      } else {
        setError('유효하지 않은 API 키입니다. 키를 확인해주세요.');
      }
    } catch (err) {
      setError('API 키 검증 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsValidating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in">
        <div className="flex items-center mb-4">
          <div className="bg-blue-100 p-2 rounded-lg mr-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Gemini API 키 입력</h2>
        </div>
        
        <p className="text-sm text-slate-600 mb-4">
          회의 녹음을 전사하고 노트를 생성하기 위해 Gemini API 키가 필요합니다.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="apiKey" className="block text-sm font-medium text-slate-700 mb-2">
              API 키
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setError('');
              }}
              placeholder="AIza..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="flex space-x-3">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                취소
              </button>
            )}
            <button
              type="submit"
              disabled={isValidating}
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isValidating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  검증 중...
                </>
              ) : (
                '저장하고 시작'
              )}
            </button>
          </div>
        </form>

        <p className="mt-4 text-xs text-slate-500">
          API 키는 브라우저에 로컬로 저장되며, 서버로 전송되지 않습니다.
        </p>
      </div>
    </div>
  );
};

