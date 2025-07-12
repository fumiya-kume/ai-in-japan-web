import { useState, useEffect, useMemo } from 'react';
import { Company, ToolName, AdoptionStatus } from './types';
import { CompanyTable } from './components/CompanyTable';
import { SearchBar } from './components/SearchBar';
import { FilterControls } from './components/FilterControls';

function App() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTool, setSelectedTool] = useState<ToolName | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<AdoptionStatus | "all">("all");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/fumiya-kume/ai-in-japan/refs/heads/master/data.json');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setCompanies(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      // Hide レバレジーズ株式会社
      if (company.company_name === "レバレジーズ株式会社") {
        return false;
      }
      
      const matchesSearch = company.company_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTool = selectedTool === "all" || 
        (selectedStatus === "all" ? true : company.tools[selectedTool] === selectedStatus);
      
      const matchesStatus = selectedStatus === "all" || 
        (selectedTool === "all" 
          ? Object.values(company.tools).some(status => status === selectedStatus)
          : company.tools[selectedTool] === selectedStatus);
      
      return matchesSearch && matchesTool && matchesStatus;
    });
  }, [companies, searchTerm, selectedTool, selectedStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400">エラー: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              日本企業のAIツール導入状況
            </h1>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
          
          <div className="grid gap-4 md:gap-6">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
            <FilterControls
              selectedTool={selectedTool}
              selectedStatus={selectedStatus}
              onToolChange={setSelectedTool}
              onStatusChange={setSelectedStatus}
            />
          </div>
          
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            {filteredCompanies.length} / {companies.length} 企業を表示中
          </div>
        </header>

        <main>
          <CompanyTable companies={filteredCompanies} />
        </main>
      </div>
    </div>
  );
}

export default App;