import { ToolName, AdoptionStatus, FilterMode, FilterOperator } from '../types';
import { CursorIcon } from './icons/CursorIcon';
import { DevinIcon } from './icons/DevinIcon';
import { GitHubCopilotIcon } from './icons/GitHubCopilotIcon';
import { ChatGPTIcon } from './icons/ChatGPTIcon';
import { ClaudeCodeIcon } from './icons/ClaudeCodeIcon';

interface FilterControlsProps {
  selectedTool: ToolName | "all";
  selectedStatus: AdoptionStatus | "all";
  onToolChange: (tool: ToolName | "all") => void;
  onStatusChange: (status: AdoptionStatus | "all") => void;
  filterMode: FilterMode;
  onFilterModeChange: (mode: FilterMode) => void;
  selectedTools: ToolName[];
  onSelectedToolsChange: (tools: ToolName[]) => void;
  filterOperator: FilterOperator;
  onFilterOperatorChange: (operator: FilterOperator) => void;
}

const tools: ToolName[] = ["Cursor", "Devin", "GitHub Copilot", "ChatGPT", "Claude Code"];
const statuses: (AdoptionStatus | "all")[] = ["all", "全社導入", "一部導入", "導入してない"];

const toolIcons: Record<ToolName, React.ComponentType<{ className?: string }>> = {
  "Cursor": CursorIcon,
  "Devin": DevinIcon,
  "GitHub Copilot": GitHubCopilotIcon,
  "ChatGPT": ChatGPTIcon,
  "Claude Code": ClaudeCodeIcon
};

export function FilterControls({
  selectedTool,
  selectedStatus,
  onToolChange,
  onStatusChange,
  filterMode,
  onFilterModeChange,
  selectedTools,
  onSelectedToolsChange,
  filterOperator,
  onFilterOperatorChange
}: FilterControlsProps) {
  const handleToolCheckboxChange = (tool: ToolName) => {
    if (selectedTools.includes(tool)) {
      onSelectedToolsChange(selectedTools.filter(t => t !== tool));
    } else {
      onSelectedToolsChange([...selectedTools, tool]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Mode Selector - Modern Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            フィルタモード
          </span>
          <div className="relative inline-flex items-center bg-gray-100 dark:bg-gray-700 rounded-full p-1">
            <div
              className={`absolute inset-y-1 transition-all duration-200 ease-in-out bg-blue-500 rounded-full ${
                filterMode === 'single' ? 'left-1 w-20' : 'left-21 w-24'
              }`}
            />
            <button
              type="button"
              onClick={() => onFilterModeChange('single')}
              className={`relative z-10 px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-200 ${
                filterMode === 'single' 
                  ? 'text-white' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              単一
            </button>
            <button
              type="button"
              onClick={() => onFilterModeChange('multiple')}
              className={`relative z-10 px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-200 ${
                filterMode === 'multiple' 
                  ? 'text-white' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              複数選択
            </button>
          </div>
        </div>
      </div>

      {filterMode === 'single' ? (
        /* Single Tool Mode - Enhanced UI */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              ツールでフィルタ
            </label>
            <select
              value={selectedTool}
              onChange={(e) => onToolChange(e.target.value as ToolName | "all")}
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:text-white transition-all duration-200"
            >
              <option value="all">すべてのツール</option>
              {tools.map(tool => (
                <option key={tool} value={tool}>
                  {tool}
                </option>
              ))}
            </select>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              導入状況でフィルタ
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value as AdoptionStatus | "all")}
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:text-white transition-all duration-200"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === "all" ? "すべての状況" : status}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        /* Multiple Tools Mode - Modern Card UI */
        <div className="space-y-4">
          {/* Tool Selection Cards */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              ツールを選択（複数可）
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {tools.map(tool => {
                const Icon = toolIcons[tool];
                const isSelected = selectedTools.includes(tool);
                return (
                  <label
                    key={tool}
                    className={`
                      relative flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToolCheckboxChange(tool)}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3 w-full">
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                      <span className={`text-sm font-medium ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-700 dark:text-gray-300'}`}>
                        {tool}
                      </span>
                    </div>
                    {isSelected && (
                      <svg className="absolute top-3 right-3 w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {selectedTools.length > 0 && (
            <>
              {/* Operator Selection - Inline Segmented Control */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    フィルタ条件
                  </span>
                  <div className="inline-flex rounded-lg shadow-sm">
                    <button
                      type="button"
                      onClick={() => onFilterOperatorChange('AND')}
                      className={`
                        px-4 py-2 text-sm font-medium rounded-l-lg border transition-all duration-200
                        ${filterOperator === 'AND'
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }
                      `}
                    >
                      すべて満たす（AND）
                    </button>
                    <button
                      type="button"
                      onClick={() => onFilterOperatorChange('OR')}
                      className={`
                        px-4 py-2 text-sm font-medium rounded-r-lg border-t border-r border-b transition-all duration-200
                        ${filterOperator === 'OR'
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }
                      `}
                    >
                      いずれか満たす（OR）
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Selection */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  導入状況
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {statuses.map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => onStatusChange(status)}
                      className={`
                        px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                        ${selectedStatus === status
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }
                      `}
                    >
                      {status === "all" ? "すべて" : status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Filter Summary */}
              {selectedStatus !== 'all' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <span className="font-medium">{selectedTools.join(` ${filterOperator} `)}</span> を
                      <span className="font-medium">「{selectedStatus}」</span>している企業を表示
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}