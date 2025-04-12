import React, { useState, useEffect } from "react";
import axios from "axios";

const CreateGroupChat = ({ onGroupCreated }) => {
  const [groupName, setGroupName] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Fetch all users from your backend
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/api/users"); // adjust route as needed
        setAllUsers(res.data);
      } catch (error) {
        setErrorMsg("Failed to load users.");
      }
    };
    fetchUsers();
  }, []);

  const handleToggleUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName || selectedUsers.length < 2) {
      setErrorMsg("Group name and at least 2 members are required.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("/api/chats/group", {
        name: groupName,
        isGroup: true,
        members: selectedUsers,
      });

      onGroupCreated(res.data);
      setGroupName("");
      setSelectedUsers([]);
      setErrorMsg("");
    } catch (error) {
      setErrorMsg("Error creating group chat.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-semibold text-center mb-4">Create Group Chat</h2>

      {errorMsg && <p className="text-red-500 text-sm mb-3 text-center">{errorMsg}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Group Name"
          className="w-full p-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />

        <div className="mb-4 max-h-48 overflow-y-auto border p-2 rounded">
          <p className="text-gray-600 mb-2">Select Members:</p>
          {allUsers.map((user) => (
            <label key={user.id} className="block mb-1 cursor-pointer">
              <input
                type="checkbox"
                className="mr-2"
                checked={selectedUsers.includes(user.id)}
                onChange={() => handleToggleUser(user.id)}
              />
              {user.name}
            </label>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
        >
          {loading ? "Creating..." : "Create Group"}
        </button>
      </form>
    </div>
  );
};

export default CreateGroupChat;
