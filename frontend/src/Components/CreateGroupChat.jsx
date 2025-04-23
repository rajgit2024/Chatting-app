import { useState, useEffect } from "react";
import { Search, Users, AlertCircle } from "lucide-react";
import { useChat } from "../contexts/ChatContext";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

const CreateGroupChat = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const { createGroupChat } = useChat();
  const [groupName, setGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (open) {
      fetchUsers();
    } else {
      setGroupName("");
      setSearchTerm("");
      setSelectedUsers([]);
      setError("");
    }
  }, [open]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/users/all");
      const filtered = res.data.filter((u) => u.id !== user?.id);
      setUsers(filtered);
    } catch (err) {
      console.error(err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (u) => u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );  

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return setError("Group name is required");
    if (selectedUsers.length === 0) return setError("Please select at least one user");

    setCreating(true);
    setError("");

    try {
      await createGroupChat(groupName, selectedUsers);
      onOpenChange(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create group");
    } finally {
      setCreating(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Create New Group</h2>

        {error && (
          <div className="flex items-center text-red-600 text-sm mb-3 bg-red-100 dark:bg-red-800 px-3 py-2 rounded-md">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Group Name */}
          <div>
            <label htmlFor="groupName" className="block text-sm font-medium mb-1">
              Group Name
            </label>
            <input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Search Users */}
          <div>
            <label className="block text-sm font-medium mb-1">Add Participants</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div>
              <span className="text-xs text-gray-500">
                Selected ({selectedUsers.length}):
              </span>
              <div className="flex flex-wrap gap-2 mt-1">
                {selectedUsers.map((userId) => {
                  const u = users.find((u) => u.id === userId);
                  return (
                    <span
                      key={u.id}
                      className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-white px-2 py-1 rounded-full text-xs"
                    >
                      {u.username}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Users List */}
          <div className="max-h-64 overflow-y-auto border rounded-md p-2 space-y-1">
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <div
                  key={u.id}
                  onClick={() => toggleUserSelection(u.id)}
                  className="flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-md"
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(u.id)}
                    readOnly
                    className="mr-3"
                  />
                  <img
                    src={u.profile_pic || "/placeholder.svg"}
                    alt={u.username}
                    className="w-8 h-8 rounded-full object-cover mr-3"
                  />
                  <span className="text-sm">{u.username}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                {searchTerm ? "No users found" : "No users available"}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-md border text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateGroup}
            disabled={creating}
            className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 flex items-center"
          >
            {creating ? (
              <>
                <span className="h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full animate-spin"></span>
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
  );
};

export default CreateGroupChat;
