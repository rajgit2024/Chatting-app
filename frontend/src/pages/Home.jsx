import React from "react"
import { Link } from "react-router-dom"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-chat-light to-white p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-chat-dark">Palsio</h1>
          <p className="mt-3 text-chat-gray-600">Vibes, Chats & Good Times</p>
        </div>

        <div className="mt-10 flex flex-col space-y-4">
          <Link to="/login">
            <button className="w-full bg-chat-primary hover:bg-chat-dark text-white text-lg py-2 rounded-md transition-colors">
              Login
            </button>
          </Link>

          <Link to="/register">
            <button className="w-full border border-chat-primary text-chat-primary hover:bg-chat-light text-lg py-2 rounded-md transition-colors">
              Create Account
            </button>
          </Link>

          {/* Demo shortcut */}
          <div className="pt-4 text-center">
            <Link to="/chats">
              <button className="text-chat-secondary hover:text-chat-primary text-sm font-medium underline">
                View Demo
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
