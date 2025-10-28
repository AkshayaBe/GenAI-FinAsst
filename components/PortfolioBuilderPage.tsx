import React, { useState, useCallback } from 'react';
import { getPortfolioSuggestionStream } from '../services/geminiService';
import type { PortfolioProfile } from '../types';
import { PortfolioBuilderForm } from './PortfolioBuilderForm';
import { BotIcon } from './Icons';

const PortfolioBuilderPage: React.FC = () => {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePortfolioSubmit = useCallback(async (profile: PortfolioProfile) => {
    setIsLoading(true);
    setError(null);
    setSuggestion('');

    try {
        const stream = await getPortfolioSuggestionStream(profile);
        let modelResponse = '';

        for await (const chunk of stream) {
            modelResponse += chunk.text;
            setSuggestion(modelResponse);
        }
    } catch (e) {
        console.error("Error generating portfolio:", e);
        setError("Sorry, I couldn't generate a portfolio suggestion. Please try again.");
    } finally {
        setIsLoading(false);
    }
  }, []);

  const handleStartOver = () => {
    setSuggestion(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="h-full max-w-4xl mx-auto p-4 md:p-6 overflow-y-auto">
      {!suggestion && !error && (
        <PortfolioBuilderForm onSubmit={handlePortfolioSubmit} isGenerating={isLoading} />
      )}
      
      {error && (
        <div className="text-center">
          <p className="text-red-400 my-4">{error}</p>
          <button onClick={handleStartOver} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-500 transition-colors">
            Try Again
          </button>
        </div>
      )}

      {suggestion && (
        <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-cyan-500">
                        <BotIcon />
                    </div>
                    <h2 className="text-lg font-bold text-white">Your Sample Portfolio Suggestion</h2>
                </div>
                <button onClick={handleStartOver} className="bg-slate-700 text-white font-semibold px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors">
                    Start Over
                </button>
            </div>
            <div className="text-white whitespace-pre-wrap prose prose-invert prose-p:text-white prose-headings:text-cyan-400 prose-strong:text-white">
                 {suggestion.split('\n').map((paragraph, index) => {
                    if (paragraph.startsWith('## ')) {
                        return <h2 key={index} className="text-xl font-bold mt-4 mb-2 text-cyan-400">{paragraph.substring(3)}</h2>;
                    }
                    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                         return <p key={index} className="font-bold my-2">{paragraph.substring(2, paragraph.length-2)}</p>
                    }
                    return <p key={index} className="my-2">{paragraph}</p>;
                 })}
            </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioBuilderPage;
