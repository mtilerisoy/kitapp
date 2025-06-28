'use client';

import { PacmanLoader } from 'react-spinners';
import { useState, useEffect } from 'react';

const funTexts = [
  'Brewing some magic...',
  'Sharpening pencils (virtually)...',
  'Warming up the synapses...',
  'Polishing the questions...',
  'Loading wisdom...',
  'Almost there, just a sec...',
  'Patience, young Padawan...',
];

const LoadingIndicator = ({
  size,
  withText = true,
}: {
  size: number;
  withText?: boolean;
}) => {
  const [currentText, setCurrentText] = useState(funTexts[0]);

  useEffect(() => {
    if (!withText) return;

    // A simpler interval to cycle through the texts
    const textChangeInterval = setInterval(() => {
      setCurrentText((prevText) => {
        const currentIndex = funTexts.indexOf(prevText);
        const nextIndex = (currentIndex + 1) % funTexts.length;
        return funTexts[nextIndex];
      });
    }, 2500); // Change text every 2.5 seconds

    return () => {
      clearInterval(textChangeInterval);
    };
  }, [withText]);

  return (
    <div className="flex flex-col justify-center items-center h-full">
      <PacmanLoader color="#36D7B7" size={size} />
      {withText && (
        <p className="mt-4 text-gray-500 italic text-lg">{currentText}</p>
      )}
    </div>
  );
};

export default LoadingIndicator;