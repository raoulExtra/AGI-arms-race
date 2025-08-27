
import React from 'react';
import type { Choice } from '../types';

interface ChoiceButtonsProps {
  choices: Choice[];
  onChoice: (choice: Choice) => void;
}

export const ChoiceButtons: React.FC<ChoiceButtonsProps> = ({ choices, onChoice }) => {
  return (
    <div>
       <h3 className="text-lg font-semibold text-cyan-400 mb-3">Available Actions:</h3>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {choices.map((choice) => (
        <button
          key={choice.id}
          onClick={() => onChoice(choice)}
          className="w-full text-left bg-cyan-900/50 hover:bg-cyan-800/70 border border-cyan-700 text-cyan-200 font-semibold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          {`> ${choice.text}`}
        </button>
      ))}
    </div>
    </div>
  );
};
