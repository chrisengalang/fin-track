import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Moon, Sun, Menu } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Budgets from './pages/Budgets';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import MonthSelector from './components/MonthSelector';
import Sidebar from './components/Sidebar';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth > 1024);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true); // Automatically re-open when resizing back to desktop
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  return (
    <Router>
      <div className="min-h-screen flex bg-[var(--bg-primary)] transition-colors duration-300 relative">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && window.innerWidth < 1024 && (
          <div
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen && window.innerWidth >= 1024 ? 'ml-64' : 'lg:ml-20 ml-0'}`}>
          <header className="sticky top-0 z-30 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-4 lg:px-8 py-4 flex justify-between items-center shadow-sm">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-blue-500 transition-colors border border-[var(--border-color)]"
              >
                <Menu size={20} />
              </button>
              <h2 className="text-lg lg:text-xl font-bold text-[var(--text-primary)]">Overview</h2>
              <MonthSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
            </div>

            <div className="flex items-center space-x-3 lg:space-x-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-blue-500 transition-colors border border-[var(--border-color)]"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-blue-500/30">
                CE
              </div>
            </div>
          </header>

          <main className="p-4 lg:p-8 container mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard selectedMonth={selectedDate} />} />
              <Route path="/budgets" element={<Budgets selectedMonth={selectedDate} />} />
              <Route path="/transactions" element={<Transactions selectedMonth={selectedDate} />} />
              <Route path="/categories" element={<Categories />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
