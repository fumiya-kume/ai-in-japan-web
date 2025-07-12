import { useState } from 'react';
import { Company, ToolName, SortField, SortDirection } from '../types';
import { AdoptionBadge } from './AdoptionBadge';
import { parseMarkdownLinks } from '../utils/parseMarkdownLinks';
import { CursorIcon } from './icons/CursorIcon';
import { DevinIcon } from './icons/DevinIcon';
import { GitHubCopilotIcon } from './icons/GitHubCopilotIcon';
import { ChatGPTIcon } from './icons/ChatGPTIcon';
import { ClaudeCodeIcon } from './icons/ClaudeCodeIcon';

interface CompanyTableProps {
  companies: Company[];
}

export function CompanyTable({ companies }: CompanyTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [sortField, setSortField] = useState<SortField>('company_name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedCompanies = [...companies].sort((a, b) => {
    let aVal: string, bVal: string;
    
    if (sortField === 'company_name') {
      aVal = a.company_name;
      bVal = b.company_name;
    } else {
      aVal = a.tools[sortField as ToolName];
      bVal = b.tools[sortField as ToolName];
    }
    
    const comparison = aVal.localeCompare(bVal, 'ja');
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const tools: ToolName[] = ["Cursor", "Devin", "GitHub Copilot", "ChatGPT", "Claude Code"];
  
  const toolIcons: Record<ToolName, React.ComponentType<{ className?: string }>> = {
    "Cursor": CursorIcon,
    "Devin": DevinIcon,
    "GitHub Copilot": GitHubCopilotIcon,
    "ChatGPT": ChatGPTIcon,
    "Claude Code": ClaudeCodeIcon
  };

  return (
    <div className="overflow-x-auto shadow-lg rounded-lg">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => handleSort('company_name')}
            >
              <div className="flex items-center">
                企業名
                <span className="ml-2">
                  {sortField === 'company_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </span>
              </div>
            </th>
            {tools.map(tool => (
              <th
                key={tool}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort(tool)}
              >
                <div className="flex items-center">
                  {(() => {
                    const Icon = toolIcons[tool];
                    return <Icon className="w-5 h-5 mr-2 flex-shrink-0" />;
                  })()}
                  <span className="truncate">{tool}</span>
                  <span className="ml-2">
                    {sortField === tool && (sortDirection === 'asc' ? '↑' : '↓')}
                  </span>
                </div>
              </th>
            ))}
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">詳細</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {sortedCompanies.map((company, index) => (
            <>
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                  {company.company_name}
                </td>
                {tools.map(tool => (
                  <td key={tool} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    <AdoptionBadge status={company.tools[tool]} />
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => toggleRow(index)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {expandedRows.has(index) ? '閉じる' : '詳細'}
                  </button>
                </td>
              </tr>
              {expandedRows.has(index) && (
                <tr key={`${index}-expanded`}>
                  <td colSpan={7} className="px-6 py-4 bg-gray-50 dark:bg-gray-800">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      <p className="font-medium mb-2">ソース:</p>
                      <div dangerouslySetInnerHTML={{ __html: parseMarkdownLinks(company.source) }} />
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}