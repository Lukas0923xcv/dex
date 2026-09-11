import React from 'react';
import { Sparkles, Trophy } from 'lucide-react';

interface ProgressBarProps {
  caught: number;
  total: number;
  percentage: number;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ caught, total, percentage, label }) => {
  const isComplete = total > 0 && caught === total;

  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-4 shadow-lg mb-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <Trophy className="w-5 h-5 text-amber-400 animate-bounce-short" />
          ) : (
            <Sparkles className="w-5 h-5 text-blue-400" />
          )}
          <span className="text-sm font-semibold text-slate-200 tracking-wide">
            {label || 'Collection Progress'}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-white tabular-nums tracking-tight">
            {caught} <span className="text-sm font-normal text-slate-400">/ {total}</span>
          </span>
          <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
            isComplete
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
          }`}>
            {percentage}%
          </span>
        </div>
      </div>

      {/* Progress Bar Track */}
      <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700/60">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out shadow-sm ${
            isComplete
              ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 shadow-amber-500/50'
              : 'bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 shadow-blue-500/40'
          }`}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
    </div>
  );
};
