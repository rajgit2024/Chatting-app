import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"

export default function Login() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulated login delay
    setTimeout(() => {
      setIsLoading(false)
      navigate("/chats")
    }, 1000)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-chat-light to-white">
      <div className="w-full max-w-md border border-chat-accent shadow-lg rounded-lg bg-white">
        <div className="space-y-1 p-6">
          <h2 className="text-2xl font-bold text-center text-chat-dark">Login</h2>
          <p className="text-center text-sm text-chat-gray-500">
            Enter your email and password to access your account
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 p-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-chat-gray-700 block">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                className="w-full text-sm border border-chat-gray-300 px-3 py-2 rounded focus:outline-none focus:border-chat-primary focus:ring-1 focus:ring-chat-primary"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="font-medium text-chat-gray-700">
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm text-chat-secondary hover:text-chat-primary">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                className="w-full border border-chat-gray-300 px-3 py-2 rounded focus:outline-none focus:border-chat-primary focus:ring-1 focus:ring-chat-primary"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-chat-primary text-white py-2 rounded hover:bg-chat-dark transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-chat-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-chat-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="border text-sm font-medium border-chat-gray-300 hover:bg-chat-light hover:text-chat-primary flex items-center justify-center py-2 rounded"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="mr-2 h-4 w-4" />
                Google
              </button>
              <button
                type="button"
                className="border text-sm font-medium border-chat-gray-300 hover:bg-chat-light hover:text-chat-primary flex items-center justify-center py-2 rounded"
              >
                <img src="https://www.svgrepo.com/show/512317/github-142.svg" alt="GitHub" className="mr-2 h-4 w-4" />
                GitHub
              </button>
            </div>
          </div>
        </form>
        <div className="flex justify-center p-4 border-t">
          <p className="text-sm text-chat-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-chat-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
