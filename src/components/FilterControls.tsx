import { ToolName, AdoptionStatus, FilterOperator } from '../types';
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
      {/* Status Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          導入状況でフィルタ
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

      {/* Tool Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          ツールでフィルタ
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

        {selectedTools.length > 0 && (
          <>
            {/* Operator Selection */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  複数選択時の条件
                </span>
                <div className="inline-flex rounded-lg shadow-sm">
                  <button
                    type="button"
                    onClick={() => onFilterOperatorChange('AND')}
                    className={`
                      px-3 py-1.5 text-sm font-medium rounded-l-lg border transition-all duration-200
                      ${filterOperator === 'AND'
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }
                    `}
                  >
                    AND
                  </button>
                  <button
                    type="button"
                    onClick={() => onFilterOperatorChange('OR')}
                    className={`
                      px-3 py-1.5 text-sm font-medium rounded-r-lg border-t border-r border-b transition-all duration-200
                      ${filterOperator === 'OR'
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }
                    `}
                  >
                    OR
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Summary */}
            {selectedStatus !== 'all' && (
              <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
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
    </div>
  );
}