"use client"

import { useState, useEffect } from "react"
import { Search, X, UserPlus, AlertCircle } from 'lucide-react'
import axios from "axios"
import { useAuth } from "../contexts/AuthContext"
import { useChat } from "../contexts/ChatContext"

const NewPrivateChat = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useAuth()
  const { chats, createPrivateChat } = useChat()

  // Reset search when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm("")
      setSearchResults([])
      setError(null)
    }
  }, [isOpen])

  // Search users when search term changes
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchTerm || searchTerm.length < 2) {
        setSearchResults([])
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const res = await axios.get(`/api/users/search?query=${encodeURIComponent(searchTerm)}`)
        console.log("Search results:", res.data)

        // Filter out current user and users already in chats
        const existingUserIds = new Set()

        // Add current user to filtered list
        existingUserIds.add(user.id)

        // Add users from existing chats
        chats.forEach((chat) => {
          if (!chat.is_group) {
            // Handle both members and participants fields
            const members = chat.members || chat.participants || []
            members.forEach((member) => {
              if (member.id !== user.id) {
                existingUserIds.add(member.id)
              }
            })
          }
        })

        // Filter search results
        const filteredResults = res.data.filter((u) => !existingUserIds.has(u.id))
        setSearchResults(filteredResults)
      } catch (err) {
        console.error("Error searching users:", err)
        setError("Failed to search users. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    const delaySearch = setTimeout(() => {
      if (searchTerm && searchTerm.length >= 2) {
        searchUsers()
      }
    }, 500)

    return () => clearTimeout(delaySearch)
  }, [searchTerm, user, chats])

  const handleStartChat = async (otherUser) => {
    try {
      setIsLoading(true)
      console.log("Starting private chat with user ID:", otherUser.id)

      await createPrivateChat(otherUser.id)
      onClose()
    } catch (err) {
      console.error("Error creating chat:", err)
      setError("Failed to start conversation. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold">New Chat</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              autoFocus
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
              <span className="text-red-800 dark:text-red-300 text-sm">{error}</span>
            </div>
          )}

          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : searchResults.length > 0 ? (
              <ul className="space-y-2">
                {searchResults.map((user) => (
                  <li
                    key={user.id}
                    className="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => handleStartChat(user)}
                  >
                    <div className="h-10 w-10 rounded-full bg-gray-300 overflow-hidden">
                      <img
                        src={user.profile_pic || "/placeholder.svg?height=40&width=40"}
                        alt={user.username}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="font-medium">{user.username}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                    <button
                      className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full"
                      title="Start chat"
                    >
                      <UserPlus size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : searchTerm.length >= 2 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">No users found</div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Search for users to start a conversation
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewPrivateChat
