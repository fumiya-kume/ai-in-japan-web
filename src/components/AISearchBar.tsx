import { useState, useEffect, useCallback } from 'react';
import { ToolName, AdoptionStatus } from '../types';

interface AISearchBarProps {
  onSearchResult: (filters: {
    tools?: ToolName[];
    status?: AdoptionStatus;
    operator?: 'AND' | 'OR';
    searchTerm?: string;
  }) => void;
  onToggleAI: (enabled: boolean) => void;
}

type ModelAvailability = 'unavailable' | 'downloadable' | 'downloading' | 'available';

declare global {
  interface LanguageModel {
    availability(): Promise<ModelAvailability>;
    create(options?: { 
      temperature?: number; 
      topK?: number;
      monitor?: (m: EventTarget) => void;
    }): Promise<{
      prompt(input: string): Promise<string>;
      promptStreaming(input: string): AsyncIterable<string>;
    }>;
  }
  
  interface Window {
    LanguageModel?: LanguageModel;
  }
}

export function AISearchBar({ onSearchResult, onToggleAI }: AISearchBarProps) {
  const [isAIEnabled, setIsAIEnabled] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [modelStatus, setModelStatus] = useState<ModelAvailability>('unavailable');
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [showCopied, setShowCopied] = useState(false);

  // Check if Gemini Nano is available
  useEffect(() => {
    const checkAvailability = async () => {
      if (!window.LanguageModel) {
        setIsAvailable(false);
        setModelStatus('unavailable');
        return;
      }

      try {
        const status = await window.LanguageModel.availability();
        setModelStatus(status);
        setIsAvailable(status === 'available');
      } catch (err) {
        console.error('Error checking model availability:', err);
        setIsAvailable(false);
        setModelStatus('unavailable');
      }
    };

    checkAvailability();
    // Check every 5 seconds
    const interval = setInterval(checkAvailability, 5000);
    return () => clearInterval(interval);
  }, []);

  const parseAIResponse = (response: string): {
    tools?: ToolName[];
    status?: AdoptionStatus;
    operator?: 'AND' | 'OR';
    searchTerm?: string;
  } => {
    const filters: ReturnType<typeof parseAIResponse> = {};
    
    // Parse tools
    const toolMatches = response.match(/ツール:\s*\[(.*?)\]/);
    if (toolMatches) {
      const toolsList = toolMatches[1].split(',').map(t => t.trim().replace(/"/g, ''));
      filters.tools = toolsList.filter(tool => 
        ['Cursor', 'Devin', 'GitHub Copilot', 'ChatGPT', 'Claude Code'].includes(tool)
      ) as ToolName[];
    }

    // Parse status
    const statusMatch = response.match(/導入状況:\s*(全社導入|一部導入|導入してない)/);
    if (statusMatch) {
      filters.status = statusMatch[1] as AdoptionStatus;
    }

    // Parse operator
    const operatorMatch = response.match(/条件:\s*(AND|OR)/);
    if (operatorMatch) {
      filters.operator = operatorMatch[1] as 'AND' | 'OR';
    }

    // Parse company name search
    const searchMatch = response.match(/企業名:\s*"([^"]+)"/);
    if (searchMatch) {
      filters.searchTerm = searchMatch[1];
    }

    return filters;
  };

  const handleAISearch = useCallback(async () => {
    if (!query.trim() || !window.LanguageModel) return;

    setIsLoading(true);
    setError(null);

    try {
      const session = await window.LanguageModel.create({
        temperature: 0.2,
        topK: 3,
        monitor(m) {
          m.addEventListener('downloadprogress', (e: any) => {
            setDownloadProgress(e.loaded);
          });
        }
      });

      const prompt = `あなたは検索クエリを解析するアシスタントです。以下のクエリから検索条件を抽出してください。

使用可能なツール: Cursor, Devin, GitHub Copilot, ChatGPT, Claude Code
使用可能な導入状況: 全社導入, 一部導入, 導入してない

クエリ: "${query}"

以下の形式で回答してください：
- ツール: [ツール名のリスト]
- 導入状況: 導入状況
- 条件: AND または OR（複数ツールの場合）
- 企業名: "検索する企業名"（企業名での検索の場合）

例：
クエリ: "ChatGPTとCopilotを全社導入している企業"
回答:
- ツール: ["ChatGPT", "GitHub Copilot"]
- 導入状況: 全社導入
- 条件: AND`;

      const response = await session.prompt(prompt);
      const filters = parseAIResponse(response);
      
      onSearchResult(filters);
    } catch (err) {
      console.error('AI search error:', err);
      setError('検索中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, [query, onSearchResult]);

  const handleToggleAI = () => {
    const newState = !isAIEnabled;
    setIsAIEnabled(newState);
    onToggleAI(newState);
    if (!newState) {
      setQuery('');
      onSearchResult({});
    }
  };

  const getStatusMessage = () => {
    switch (modelStatus) {
      case 'downloadable':
        return 'Gemini Nanoをダウンロード可能です。';
      case 'downloading':
        return 'Gemini Nanoをダウンロード中...';
      case 'unavailable':
        return 'Gemini Nanoはこのブラウザでサポートされていません。';
      default:
        return null;
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getStatusIcon = () => {
    switch (modelStatus) {
      case 'available':
        return '✅';
      case 'downloading':
        return '⏳';
      case 'downloadable':
        return '📥';
      default:
        return '❌';
    }
  };

  if (!window.LanguageModel) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* AI Status Display */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getStatusIcon()}</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-300">
              AI検索ステータス: {modelStatus === 'available' ? '利用可能' : 
                                modelStatus === 'downloading' ? 'ダウンロード中' :
                                modelStatus === 'downloadable' ? 'ダウンロード可能' : '利用不可'}
            </span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="text-xs px-2 py-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            title="ステータスを再確認"
          >
            🔄 更新
          </button>
        </div>
        
        {modelStatus === 'downloading' && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-2">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${downloadProgress * 100}%` }}
            />
          </div>
        )}
        
        {modelStatus !== 'available' && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {getStatusMessage()}
            {modelStatus === 'unavailable' && (
              <a 
                href="https://developer.chrome.com/docs/ai/get-started" 
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-blue-600 hover:underline"
              >
                設定方法を見る
              </a>
            )}
            {modelStatus === 'downloadable' && (
              <div className="mt-2">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  以下の手順で有効化してください：
                </p>
                <ol className="text-xs text-gray-600 dark:text-gray-400 list-decimal list-inside space-y-1">
                  <li>
                    新しいタブで 
                    <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded mx-1">
                      chrome://components
                    </code>
                    を開く
                    <button
                      onClick={() => copyToClipboard('chrome://components')}
                      className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title="URLをコピー"
                    >
                      {showCopied ? '✓' : '📋'}
                    </button>
                  </li>
                  <li>"Optimization Guide On Device Model" を探す</li>
                  <li>"アップデートを確認" をクリック</li>
                </ol>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isAIEnabled}
            onChange={handleToggleAI}
            disabled={!isAvailable}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-300">
            AI検索を使用（Gemini Nano）
          </span>
        </label>
      </div>

      {isAIEnabled && isAvailable && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
            className="block w-full p-4 pl-10 pr-12 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="自然言語で検索（例: ChatGPTを全社導入している企業）"
            disabled={isLoading}
          />
          <button
            onClick={handleAISearch}
            disabled={isLoading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '検索中...' : '検索'}
          </button>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {isAIEnabled && isAvailable && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          例: 「Copilotを導入している大手企業」「ChatGPTとClaudeの両方を使っている会社」
        </div>
      )}
    </div>
  );
}