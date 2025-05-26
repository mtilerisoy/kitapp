'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import LoadingIndicator from "@/components/LoadingIndicator";

interface LoadingContextProps {
    isLoading: boolean;
    setIsLoading: (value: boolean) => void;
}

const LoadingContext = createContext<LoadingContextProps>({
    isLoading: false,
    setIsLoading: () => {},
});

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
            {children}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white pointer-events-none">
                    <LoadingIndicator size={60}/>
                </div>
            )}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => useContext(LoadingContext);