
import React from 'react';

interface GameOverScreenProps {
  outcome: string;
  onRestart: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ outcome, onRestart }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <h2 className="text-4xl font-bold text-red-500 mb-4">SIMULATION END</h2>
      <p className="text-xl text-gray-300 mb-8 max-w-2xl">{outcome}</p>
      <button
        onClick={onRestart}
        className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-300"
      >
        Re-initialize Simulation
      </button>
    </div>
  );
};
