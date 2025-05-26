'use client'

import React, {useState, useEffect} from 'react'
import {useRouter} from 'next/navigation'
import {useSessionContext} from "@/context/SessionContext";
import {supabase} from "@/utils/supabase";
import {logger} from '../../../utils/logger'
import LoadingIndicator from "@/components/LoadingIndicator";

export default function App() {
    // Define state variables
    const {session, loading: sessionLoading, user} = useSessionContext();
    const [email, setEmail] = useState('')
    const [formLoading, setFormLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter();


    // Effect to redirect if user is already logged in
    useEffect(() => {
        // Only redirect if session is loaded (sessionLoading is false) AND a session exists
        if (!sessionLoading && session) {
            logger.info(`User already logged in. User: ${user?.email} Redirecting to /my-books`);
            router.push('/my-books');
        }
    }, [session, sessionLoading, router, user]);

    // Send OTP
    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormLoading(true)
        setError(null)

        const {error: optError} = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: true,
            },
        })


        if (optError) {
            setError(optError.message)
        } else {
            router.push(`/login/verify?email=${encodeURIComponent(email)}`);
        }
        setFormLoading(false)
    }

    if (sessionLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                <LoadingIndicator size={50}/>
            </div>
        );
    }

    if (session) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                <LoadingIndicator size={50}/>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full p-8 rounded-xl shadow-lg bg-white border border-gray-100 space-y-6">
                <div>
                    <h2 className="mt-6 text-center text-2xl font-bold text-green-600">
                        Sign in to KitApp
                    </h2>
                    <p className="mt-2 text-center text-gray-700">
                        Enter your email to paswordless sign in.
                    </p>
                </div>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSendOTP} className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="email" className="sr-only">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="appearance-none bg-gray-50 border border-gray-200 rounded w-full py-2 px-3 text-gray-500 leading-tight focus:outline-none focus:border-green-500"
                            placeholder="Your email address"
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={formLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                            {formLoading ? 'Sending OTP...' : 'Send Verification Code'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}