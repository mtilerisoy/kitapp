'use client'

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase';
import apiClient from '@/api';

interface  SessionContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    subscriptionStatus: string | null;
    getUserEmail: () => string | null;
    signOut: () => Promise<void>;
    refreshSubscriptionStatus: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);


export const SessionProvider = ({ children }: { children: ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        // Initial session fetch (still useful for page load)
        supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
            setSession(currentSession);
            setUser(currentSession?.user || null);
            setLoading(false);
        }).catch(() => {
            setLoading(false);
        })

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, currentSession) => {
                console.log("Auth State Change Event:", event);
                setSession(currentSession);
                setUser(currentSession?.user ?? null);

                // If somehow was loading, set it to false
                if (loading) {
                    setLoading(false);
                }
            }
        );

        return () => {
            subscription?.unsubscribe(); // Cleanup the subscription on unmount
        };
    }, []);

    const getUserEmail = () => {
        return user?.email ?? null;
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    }

    const refreshSubscriptionStatus = async () => {
        if (!user) {
            setSubscriptionStatus(null);
            return;
        }

        try {
            const response = await apiClient.get('/api/subscription-status');
            setSubscriptionStatus(response.data.subscription_status);
        } catch (error) {
            console.error('Error fetching subscription status:', error);
            setSubscriptionStatus('inactive');
        }
    };

    // Fetch subscription status when user changes
    useEffect(() => {
        if (user && session) {
            refreshSubscriptionStatus();
        } else {
            setSubscriptionStatus(null);
        }
    }, [user, session]);

    return (
        <SessionContext.Provider value={{ 
            session, 
            user, 
            getUserEmail, 
            signOut, 
            loading, 
            subscriptionStatus,
            refreshSubscriptionStatus 
        }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSessionContext = () => {
    const context = useContext(SessionContext);
    if (context === undefined) {
        throw new Error('useSessionContext must be used within a SessionProvider');
    }
    return context;
}