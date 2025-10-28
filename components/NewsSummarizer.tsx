import React, { useState, useCallback } from 'react';
import { getNewsSummary } from '../services/geminiService';
import type { WebSource } from '../types';
import { LinkIcon, NewsIcon } from './Icons';

const NewsSummarizer: React.FC = () => {
    const [summary, setSummary] = useState<string | null>(null);
    const [sources, setSources] = useState<WebSource[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFetchNews = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setSummary(null);
        setSources([]);

        try {
            const { text, sources } = await getNewsSummary();
            setSummary(text);
            setSources(sources);
        } catch (e) {
            console.error("Error fetching news:", e);
            setError("Sorry, I couldn't fetch the latest news. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <div className="h-full max-w-4xl mx-auto p-4 md:p-6 overflow-y-auto">
            <div className="bg-slate-800 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-700 rounded-full">
                        <NewsIcon className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Real-Time Market News</h2>
                        <p className="text-slate-400">Get concise summaries of the latest financial news from India.</p>
                    </div>
                </div>
                <button 
                    onClick={handleFetchNews}
                    disabled={isLoading}
                    className="mt-4 w-full sm:w-auto bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Fetching News...' : 'Get Latest News Summary'}
                </button>
            </div>

            {error && <p className="text-red-400 text-center my-4">{error}</p>}

            {summary && (
                <div className="bg-slate-800 rounded-lg p-6">
                    <h3 className="text-lg font-bold mb-4 text-cyan-400">Summary</h3>
                    <div className="text-white whitespace-pre-wrap prose prose-invert prose-p:text-white prose-headings:text-cyan-400 prose-strong:text-white">
                        {summary.split('\n').map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>
                    
                    {sources.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-slate-700">
                            <h4 className="text-sm font-semibold text-slate-300 mb-3">Sources:</h4>
                            <div className="flex flex-col gap-2">
                                {sources.map((source, i) => (
                                    <a
                                    key={i}
                                    href={source.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-cyan-400 hover:underline flex items-start gap-2 p-2 bg-slate-700/50 rounded-md"
                                    >
                                        <LinkIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <span className="truncate">{source.title}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NewsSummarizer;
