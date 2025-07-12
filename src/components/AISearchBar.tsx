import { useState, useEffect, useCallback } from 'react';
import { ToolName, AdoptionStatus } from '../types';

interface AISearchBarProps {
  onSearchResult: (filters: {
    tools?: ToolName[];
    status?: AdoptionStatus;
    operator?: 'AND' | 'OR';
  }) => void;
  onToggleAI: (enabled: boolean) => void;
}

type ModelAvailability = 'unavailable' | 'downloadable' | 'downloading' | 'available';

interface QueryHistory {
  id: string;
  timestamp: Date;
  query: string;
  prompt: string;
  response: string;
  parsedFilters: {
    tools?: ToolName[];
    status?: AdoptionStatus;
    operator?: 'AND' | 'OR';
  };
  duration: number;
  error?: string;
}

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
  const [showModelDetails, setShowModelDetails] = useState(false);
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([]);
  const [expandedHistoryIds, setExpandedHistoryIds] = useState<Set<string>>(new Set());
  const [chromeVersion, setChromeVersion] = useState<string>('');

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

  // Get Chrome version
  useEffect(() => {
    const match = navigator.userAgent.match(/Chrome\/([\d.]+)/);
    if (match) {
      setChromeVersion(match[1]);
    }
  }, []);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('aiSearchHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setQueryHistory(parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      } catch (err) {
        console.error('Failed to load history:', err);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (queryHistory.length > 0) {
      localStorage.setItem('aiSearchHistory', JSON.stringify(queryHistory.slice(0, 20)));
    }
  }, [queryHistory]);

  const parseAIResponse = (response: string): {
    tools?: ToolName[];
    status?: AdoptionStatus;
    operator?: 'AND' | 'OR';
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

    return filters;
  };

  const handleAISearch = useCallback(async () => {
    if (!query.trim() || !window.LanguageModel) return;

    setIsLoading(true);
    setError(null);
    const startTime = Date.now();

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

例：
クエリ: "ChatGPTとCopilotを全社導入している"
回答:
- ツール: ["ChatGPT", "GitHub Copilot"]
- 導入状況: 全社導入
- 条件: AND`;

      const response = await session.prompt(prompt);
      const filters = parseAIResponse(response);
      
      // Add to history
      const historyEntry: QueryHistory = {
        id: Date.now().toString(),
        timestamp: new Date(),
        query,
        prompt,
        response,
        parsedFilters: filters,
        duration: Date.now() - startTime
      };
      setQueryHistory(prev => [historyEntry, ...prev].slice(0, 20));
      
      onSearchResult(filters);
    } catch (err) {
      console.error('AI search error:', err);
      setError('検索中にエラーが発生しました');
      
      // Add error to history
      const historyEntry: QueryHistory = {
        id: Date.now().toString(),
        timestamp: new Date(),
        query,
        prompt,
        response: '',
        parsedFilters: {},
        duration: Date.now() - startTime,
        error: err instanceof Error ? err.message : '不明なエラー'
      };
      setQueryHistory(prev => [historyEntry, ...prev].slice(0, 20));
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
            {modelStatus === 'available' && (
              <button
                onClick={() => setShowModelDetails(!showModelDetails)}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                [{showModelDetails ? '▼' : '▶'} 詳細]
              </button>
            )}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="text-xs px-2 py-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            title="ステータスを再確認"
          >
            🔄 更新
          </button>
        </div>
        
        {/* Model Details */}
        {showModelDetails && modelStatus === 'available' && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <div>モデル: Gemini Nano</div>
            <div>コンテキスト: 6,000 トークン</div>
            <div>Chrome: {chromeVersion || '不明'}</div>
            <div>最終確認: {new Date().toLocaleString('ja-JP')}</div>
          </div>
        )}
        
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

      {/* Search History */}
      {isAIEnabled && queryHistory.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-300">
              検索履歴 ({queryHistory.length})
            </h3>
            <button
              onClick={() => {
                setQueryHistory([]);
                localStorage.removeItem('aiSearchHistory');
              }}
              className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              クリア
            </button>
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {queryHistory.map((history) => {
              const isExpanded = expandedHistoryIds.has(history.id);
              return (
                <div
                  key={history.id}
                  className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                >
                  <div
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => {
                      const newExpanded = new Set(expandedHistoryIds);
                      if (isExpanded) {
                        newExpanded.delete(history.id);
                      } else {
                        newExpanded.add(history.id);
                      }
                      setExpandedHistoryIds(newExpanded);
                    }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {isExpanded ? '▼' : '▶'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {history.timestamp.toLocaleString('ja-JP')}
                        </span>
                        {history.error && (
                          <span className="text-xs text-red-600 dark:text-red-400">
                            エラー
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        「{history.query}」
                      </div>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 space-y-2 text-xs">
                      <div>
                        <div className="text-gray-600 dark:text-gray-400 font-medium">プロンプト:</div>
                        <div className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded mt-1 whitespace-pre-wrap break-words">
                          {history.prompt.substring(0, 200)}...
                        </div>
                      </div>
                      
                      {history.response && (
                        <div>
                          <div className="text-gray-600 dark:text-gray-400 font-medium">レスポンス:</div>
                          <div className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded mt-1">
                            {history.response}
                          </div>
                        </div>
                      )}
                      
                      {history.error && (
                        <div>
                          <div className="text-red-600 dark:text-red-400 font-medium">エラー:</div>
                          <div className="text-red-700 dark:text-red-300">
                            {history.error}
                          </div>
                        </div>
                      )}
                      
                      {Object.keys(history.parsedFilters).length > 0 && (
                        <div>
                          <div className="text-gray-600 dark:text-gray-400 font-medium">解析結果:</div>
                          <div className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded mt-1">
                            {history.parsedFilters.tools && (
                              <div>ツール: {history.parsedFilters.tools.join(', ')}</div>
                            )}
                            {history.parsedFilters.status && (
                              <div>導入状況: {history.parsedFilters.status}</div>
                            )}
                            {history.parsedFilters.operator && (
                              <div>条件: {history.parsedFilters.operator}</div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="text-gray-500 dark:text-gray-400">
                        処理時間: {history.duration}ms
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}