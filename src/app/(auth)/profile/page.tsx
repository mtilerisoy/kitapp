'use client'

import { useState, useEffect } from 'react'
import { Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'

export default function Profile() {
    const router = useRouter();
    const [session, setSession] = useState<Session | null>(null)
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
        })
    }, []);

    if (!session) {
        return <div>Loading...</div> //router.push('/signin')
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="text-black">Logged in as {session.user.email}</div>
            <button
                onClick={() => {
                    supabase.auth.signOut()
                    router.push('/login')
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
                Sign Out
            </button>
        </div>
    )
}