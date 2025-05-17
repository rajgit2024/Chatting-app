"use client"

import { useState, useEffect } from "react"
import { useChat } from "../contexts/ChatContext"
import { useAuth } from "../contexts/AuthContext"
import { Search, X, Check, Users } from "lucide-react"
import axios from "axios"

const CreateGroupChat = ({ open, onOpenChange }) => {
  const [groupName, setGroupName] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const { user } = useAuth()
  const { createGroupChat } = useChat()

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setGroupName("")
      setSearchTerm("")
      setSearchResults([])
      setSelectedUsers([])
      setError(null)
    }
  }, [open])

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

        // Filter out current user and already selected users
        const selectedUserIds = new Set(selectedUsers.map((u) => u.id))
        const filteredResults = res.data.filter((u) => u.id !== user?.id && !selectedUserIds.has(u.id))

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
  }, [searchTerm, selectedUsers, user])

  const handleSelectUser = (user) => {
    setSelectedUsers((prev) => [...prev, user])
    setSearchResults((prev) => prev.filter((u) => u.id !== user.id))
    setSearchTerm("")
  }

  const handleRemoveUser = (userId) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId))
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError("Group name is required")
      return
    }

    if (selectedUsers.length === 0) {
      setError("Please select at least one user")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Extract just the IDs for the API call
      const memberIds = selectedUsers.map((u) => u.id)

      await createGroupChat(groupName, memberIds)
      onOpenChange(false)
    } catch (err) {
      console.error("Error creating group:", err)
      setError("Failed to create group. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Create Group Chat</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="groupName" className="block text-sm font-medium mb-1">
              Group Name
            </label>
            <input
              id="groupName"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              placeholder="Enter group name"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Add Members</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Selected users */}
          {selectedUsers.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Selected Users ({selectedUsers.length})</h3>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-sm"
                  >
                    <span>{user.username}</span>
                    <button
                      onClick={() => handleRemoveUser(user.id)}
                      className="ml-1 p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search results */}
          <div className="max-h-60 overflow-y-auto">
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
                    onClick={() => handleSelectUser(user)}
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
                      title="Add to group"
                    >
                      <Check size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : searchTerm.length >= 2 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">No users found</div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Search for users to add to the group
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateGroup}
              disabled={isLoading || selectedUsers.length === 0 || !groupName.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Create Group
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateGroupChat
