import { ToolName, AdoptionStatus } from '../types';

interface FilterControlsProps {
  selectedTool: ToolName | "all";
  selectedStatus: AdoptionStatus | "all";
  onToolChange: (tool: ToolName | "all") => void;
  onStatusChange: (status: AdoptionStatus | "all") => void;
}

const tools: (ToolName | "all")[] = ["all", "Cursor", "Devin", "GitHub Copilot", "ChatGPT", "Claude Code"];
const statuses: (AdoptionStatus | "all")[] = ["all", "全社導入", "一部導入", "導入してない"];

export function FilterControls({
  selectedTool,
  selectedStatus,
  onToolChange,
  onStatusChange
}: FilterControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          ツールでフィルタ
        </label>
        <select
          value={selectedTool}
          onChange={(e) => onToolChange(e.target.value as ToolName | "all")}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          {tools.map(tool => (
            <option key={tool} value={tool}>
              {tool === "all" ? "すべてのツール" : tool}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          導入状況でフィルタ
        </label>
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value as AdoptionStatus | "all")}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          {statuses.map(status => (
            <option key={status} value={status}>
              {status === "all" ? "すべての状況" : status}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}