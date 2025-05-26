import { useState } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { logger } from '@/utils/logger'

interface OtpVerificationProps {
  email: string
  onBack: () => void
  supabase: SupabaseClient
}

export default function OtpVerification({ email, onBack, supabase }: OtpVerificationProps) {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter();

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    logger.info('Verifying OTP')
    logger.info('Verifying OTP')
    logger.info('Email:', { email })
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email'
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/my-books')
    }
    setLoading(false)
  }

  return (
      <>
        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              {error}
            </div>
        )}
        <form onSubmit={handleVerifyOTP} className="mt-8 space-y-6">
          <div>
            <label htmlFor="otp" className="sr-only">
              Enter OTP
            </label>
            <input
                id="otp"
                name="otp"
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-200 rounded w-full py-2 px-3 text-gray-500 leading-tight focus:outline-none focus:border-green-500" // **Hardcoded Input Style**
                placeholder="Enter OTP"
            />
          </div>
          <div>
            <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50" // **Hardcoded Button Style**
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
          <div className="text-center">
            <button
                type="button"
                onClick={onBack}
                className="inline-block text-sm font-medium text-green-600 hover:text-green-800" // Keep link style
            >
              Use different email
            </button>
          </div>
        </form>
      </>
  )
}