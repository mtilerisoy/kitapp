import { PacmanLoader } from "react-spinners";
import { useState, useEffect } from "react";

const funTexts = [
    "Brewing some interview magic...",
    "Sharpening pencils (virtually)...",
    "Warming up the synapses...",
    "Polishing the questions...",
    "Herding cats (questions, actually)...",
    "Almost there, just a sec...",
    "Patience, young Padawan...",
    "Contemplating the universe (and your interview prep)...",
    "Loading wisdom...",
    "Did you bring snacks? (Questions are loading)",
];

const LoadingIndicator = ({
                              size,
                              withText = true,
                              textChangeInterval = 3000,
                              animationSpeed = 100,
                              animatedColor = '#9CA3AF',
                              textSize = 'xl', // Added textSize prop, default 'lg' (Tailwind text-lg)
                              windowSize = 3,    // Added windowSize prop, default 3 characters
                          }: {
    size: number;
    withText?: boolean;
    textChangeInterval?: number;
    animationSpeed?: number;
    animatedColor?: string;
    textSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'; // Tailwind text sizes
    windowSize?: number;
}) => {
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [windowStart, setWindowStart] = useState(0); // Track start of sliding window
    const [currentText, setCurrentText] = useState("");

    useEffect(() => {
        if (withText) {
            setCurrentText(funTexts[currentTextIndex]);

            const textAnimationIntervalId = setInterval(() => {
                setWindowStart((prevStart) => {
                    const nextStart = prevStart + 1;
                    if (nextStart > currentText.length) {
                        setCurrentTextIndex((prevIndex) => (prevIndex + 1) % funTexts.length);
                        setCurrentText(funTexts[currentTextIndex]);
                        return 0; // Reset window for new text
                    }
                    return nextStart;
                });
            }, animationSpeed);

            const textChangeTimeoutId = setTimeout(() => {
                // Fallback text change
                setCurrentTextIndex((prevIndex) => (prevIndex + 1) % funTexts.length);
                setCurrentText(funTexts[currentTextIndex]);
                setWindowStart(0); // Reset window as well
            }, textChangeInterval);

            return () => {
                clearInterval(textAnimationIntervalId);
                clearTimeout(textChangeTimeoutId);
            };
        }
    }, [withText, textChangeInterval, animationSpeed, currentTextIndex, currentText, animatedColor, windowSize]);

    return (
        <div className="flex flex-col justify-center items-center h-full">
            <PacmanLoader color="#36D7B7" size={size} />
            {withText && (
                <p className={`mt-4 text-gray-500 italic whitespace-nowrap overflow-hidden text-${textSize}`}> {/* Dynamic textSize class */}
                    {currentText.split("").map((char, index) => {
                        const inWindow = index >= windowStart && index < windowStart + windowSize;
                        return (
                            <span
                                key={index}
                                style={{
                                    color: inWindow ? animatedColor : 'inherit',
                                    transition: 'color 0.2s ease-in-out',
                                }}
                            >
                                {char}
                            </span>
                        );
                    })}
                </p>
            )}
        </div>
    );
};

export default LoadingIndicator;