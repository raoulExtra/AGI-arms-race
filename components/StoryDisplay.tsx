
import React, { useState, useEffect } from 'react';

interface StoryDisplayProps {
  text: string;
}

export const StoryDisplay: React.FC<StoryDisplayProps> = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText(''); // Reset on new text
    let i = 0;
    const intervalId = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(intervalId);
      }
    }, 20); // Adjust speed of typing here

    return () => clearInterval(intervalId);
  }, [text]);

  return (
    <div>
      <h2 className="text-xl font-semibold text-cyan-400 mb-4">Situation Report:</h2>
      <p className="text-lg leading-relaxed whitespace-pre-wrap">
        {displayedText}
        <span className="animate-ping">_</span>
      </p>
    </div>
  );
};
