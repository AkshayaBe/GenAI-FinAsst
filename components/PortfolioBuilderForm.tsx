import React, { useState, useCallback } from 'react';
import type { PortfolioProfile } from '../types';
import { PortfolioIcon } from './Icons';

interface Props {
  onSubmit: (profile: PortfolioProfile) => void;
  isGenerating: boolean;
}

export const PortfolioBuilderForm: React.FC<Props> = ({ onSubmit, isGenerating }) => {
  const [riskTolerance, setRiskTolerance] = useState<'Conservative' | 'Moderate' | 'Aggressive'>('Moderate');
  const [financialGoals, setFinancialGoals] = useState<string[]>([]);
  const [timeline, setTimeline] = useState<number>(10);

  const allGoals = ["Retirement", "Wealth Creation", "Tax Saving", "Buying a House", "Child's Education"];

  const handleGoalToggle = (goal: string) => {
    setFinancialGoals(prev => 
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (financialGoals.length > 0) {
      onSubmit({ riskTolerance, financialGoals, timeline });
    } else {
      alert("Please select at least one financial goal.");
    }
  }, [onSubmit, riskTolerance, financialGoals, timeline]);

  return (
    <div className="bg-slate-800 rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-lg mx-auto">
      <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-slate-700 rounded-full">
              <PortfolioIcon className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
              <h2 className="text-xl font-bold text-white">Build Your Portfolio</h2>
              <p className="text-slate-400">Tell us about your investment style to get a sample portfolio.</p>
          </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Risk Tolerance */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">What is your risk tolerance?</label>
          <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-700 p-1">
            {(['Conservative', 'Moderate', 'Aggressive'] as const).map(level => (
              <button type="button" key={level} onClick={() => setRiskTolerance(level)} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${riskTolerance === level ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-600'}`}>
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Financial Goals */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">What are your financial goals?</label>
          <div className="flex flex-wrap gap-2">
            {allGoals.map(goal => (
              <button type="button" key={goal} onClick={() => handleGoalToggle(goal)} className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${financialGoals.includes(goal) ? 'bg-cyan-500 border-cyan-500 text-slate-900 font-semibold' : 'border-slate-600 text-slate-300 hover:bg-slate-700'}`}>
                {goal}
              </button>
            ))}
          </div>
        </div>

        {/* Investment Timeline */}
        <div>
          <label htmlFor="timeline" className="block text-sm font-medium text-slate-300 mb-2">Investment Timeline: <span className="font-bold text-white">{timeline} years</span></label>
          <input
            id="timeline"
            type="range"
            min="1"
            max="30"
            value={timeline}
            onChange={e => setTimeline(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4">
          <button type="submit" className="px-6 py-2 w-full rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed" disabled={financialGoals.length === 0 || isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate Portfolio'}
          </button>
        </div>
      </form>
    </div>
  );
};
