import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import { BotIcon, NewsIcon, PortfolioIcon } from './components/Icons';
import NewsSummarizer from './components/NewsSummarizer';
import PortfolioBuilderPage from './components/PortfolioBuilderPage';

type Page = 'chat' | 'news' | 'portfolio';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('chat');

  const NavLink: React.FC<{
    page: Page;
    title: string;
    icon: React.ReactNode;
  }> = ({ page, title, icon }) => (
    <button
      onClick={() => setCurrentPage(page)}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        currentPage === page
          ? 'bg-slate-700 text-cyan-400'
          : 'text-slate-300 hover:bg-slate-700/50'
      }`}
    >
      {icon}
      {title}
    </button>
  );

  const renderPage = () => {
    switch (currentPage) {
      case 'news':
        return <NewsSummarizer />;
      case 'portfolio':
        return <PortfolioBuilderPage />;
      case 'chat':
      default:
        return <ChatInterface />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 p-4 shadow-lg sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <h1 className="text-xl font-bold text-cyan-400">GenAI Financial Assistant</h1>
          </div>
          <nav className="flex items-center gap-2">
            <NavLink page="chat" title="Chat" icon={<BotIcon className="w-5 h-5" />} />
            <NavLink page="news" title="Market News" icon={<NewsIcon className="w-5 h-5" />} />
            <NavLink page="portfolio" title="Portfolio Builder" icon={<PortfolioIcon className="w-5 h-5" />} />
          </nav>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
