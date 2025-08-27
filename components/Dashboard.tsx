
import React from 'react';
import type { Resources } from '../types';

interface DashboardProps {
  resources: Resources;
}

const ProgressBar: React.FC<{ value: number; label: string; icon: string; color: string }> = ({ value, label, icon, color }) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-1 text-cyan-200">
      <span className="flex items-center">
        <span className="mr-2 text-lg">{icon}</span>
        {label}
      </span>
      <span className={`font-bold ${value < 20 ? 'text-red-400' : 'text-cyan-400'}`}>{value}%</span>
    </div>
    <div className="w-full bg-cyan-900/50 rounded-full h-2.5">
      <div className={`${color} h-2.5 rounded-full transition-all duration-500 ease-out`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ resources }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-cyan-400 border-b-2 border-cyan-700/50 pb-2 mb-4">Project Status</h2>
      <ProgressBar value={resources.aiProgress} label="AGI Progress" icon="🧠" color="bg-green-500" />
      <ProgressBar value={resources.compute} label="Compute Power" icon="💻" color="bg-blue-500" />
      <ProgressBar value={resources.talent} label="Research Talent" icon="👩‍🔬" color="bg-purple-500" />
      <ProgressBar value={resources.funding} label="Funding" icon="💰" color="bg-yellow-500" />
      <ProgressBar value={resources.publicTrust} label="Public Trust" icon="🌍" color="bg-pink-500" />
    </div>
  );
};
