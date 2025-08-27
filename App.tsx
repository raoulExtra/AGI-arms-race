
import React, { useState, useEffect, useCallback } from 'react';
import type { GameState, Choice, Resources, GameHistory } from './types';
import { getNextGameState } from './services/geminiService';
import { Dashboard } from './components/Dashboard';
import { StoryDisplay } from './components/StoryDisplay';
import { ChoiceButtons } from './components/ChoiceButtons';
import { LoadingSpinner } from './components/LoadingSpinner';
import { GameOverScreen } from './components/GameOverScreen';
import { FeedbackDisplay } from './components/FeedbackDisplay';

const INITIAL_RESOURCES: Resources = {
  compute: 60,
  talent: 50,
  funding: 70,
  publicTrust: 80,
  aiProgress: 10,
};

const INITIAL_STATE: GameState = {
  storyText: 'You are the lead researcher of Project Chimera. The board has just approved your massive budget request. The goal: create the world\'s first true AGI. Your rival, Aethelred Inc., is rumored to be months ahead. The world watches. Your first move is critical.',
  resources: INITIAL_RESOURCES,
  choices: [
    { id: 'focus_talent', text: 'Launch a major hiring initiative to poach Aethelred\'s top talent.' },
    { id: 'boost_compute', text: 'Invest heavily in a next-generation supercomputing cluster.' },
    { id: 'public_relations', text: 'Start a PR campaign to build public support and attract investors.' },
  ],
  isGameOver: false,
  outcomeText: '',
  feedback: '',
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const startGame = () => {
    setGameState(INITIAL_STATE);
    setHistory([]);
    setIsLoading(false);
    setError(null);
  }
  
  const handleChoice = useCallback(async (choice: Choice) => {
    if (isLoading) return;

    if (choice.id === 'restart') {
      startGame();
      return;
    }

    setIsLoading(true);
    setError(null);

    const currentHistory : GameHistory = { story: gameState.storyText, choice: choice.text };
    const updatedHistory = [...history, currentHistory];
    
    try {
        const nextState = await getNextGameState(gameState, choice.text, updatedHistory);
        setGameState(nextState);
        setHistory(updatedHistory);
    } catch (e) {
        setError('Failed to get next game state. Please try again.');
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  }, [gameState, isLoading, history]);

  return (
    <div className="min-h-screen bg-gray-900 text-cyan-300 font-mono p-4 sm:p-6 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Dashboard */}
        <aside className="lg:w-1/3 w-full bg-black bg-opacity-30 p-6 rounded-lg border border-cyan-700/50">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">AGI Arms Race</h1>
          <p className="text-sm text-gray-400 mb-6">Your decisions will shape the future.</p>
          <Dashboard resources={gameState.resources} />
        </aside>

        {/* Right Column: Game */}
        <main className="lg:w-2/3 w-full bg-black bg-opacity-30 p-6 rounded-lg border border-cyan-700/50 flex flex-col" style={{ minHeight: '60vh' }}>
          {gameState.isGameOver ? (
            <GameOverScreen outcome={gameState.outcomeText} onRestart={startGame} />
          ) : (
            <>
              <div className="flex-grow mb-6">
                <StoryDisplay key={gameState.storyText} text={gameState.storyText} />
                <FeedbackDisplay text={gameState.feedback} />
              </div>
              {error && <p className="text-red-400 mb-4">Error: {error}</p>}
              <div className="mt-auto">
                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <ChoiceButtons choices={gameState.choices} onChoice={handleChoice} />
                )}
              </div>
            </>
          )}
        </main>
      </div>
       <footer className="text-center mt-8 text-gray-600 text-xs">
        <p>Powered by Google Gemini. This is a fictional simulation.</p>
      </footer>
    </div>
  );
};

export default App;