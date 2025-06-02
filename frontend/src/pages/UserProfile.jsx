"use client"

import { useState } from "react"
import { IoPerson, IoAddCircle } from "react-icons/io5"
import { TbArrowBackUp } from "react-icons/tb"
import { useAuth } from "../contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const UserProfile = () => {
  const { user, setUser, logout, loading } = useAuth()
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const navigate = useNavigate()

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.match("image.*")) {
      setUploadError("Please select an image file")
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be less than 5MB")
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setUploadError(null)
  }

  // Handle profile picture upload
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError("Please select an image first")
      return
    }

    if (!user) {
      setUploadError("You must be logged in to update your profile picture")
      return
    }

    setUploadLoading(true)
    setUploadError(null)

    try {
      console.log("Starting profile picture upload for user:", user.id)

      // Create form data
      const formData = new FormData()
      formData.append("profile_pic", selectedFile)

      console.log("FormData created with file:", selectedFile.name)

      // Get token from localStorage
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication token not found")
      }

      console.log("Making API request to upload profile image...")

      // Make API request to upload profile image
      const response = await axios.post("http://localhost:5000/api/users/upload-profile-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Profile picture upload response:", response.data)

      // Check if upload was successful
      if (response.data.message === "Profile image uploaded successfully!") {
        // Your backend returns filePath, so we need to construct the full URL
        const profilePicUrl = `http://localhost:5000${response.data.filePath}`

        console.log("Profile picture URL:", profilePicUrl)

        // Update user state with new profile picture
        setUser({
          ...user,
          profile_pic: profilePicUrl,
        })

        // Clear file selection and preview
        setSelectedFile(null)
        setPreviewUrl(null)

        // Show success message
        alert("Profile picture updated successfully!")
      } else {
        throw new Error(response.data.message || "Failed to update profile picture")
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error)

      // Handle different types of errors
      let errorMessage = "Failed to update profile picture. Please try again."

      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || errorMessage
        console.error("Server error:", error.response.data)
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "Network error. Please check your connection."
        console.error("Network error:", error.request)
      } else {
        // Something else happened
        errorMessage = error.message || errorMessage
        console.error("Error:", error.message)
      }

      setUploadError(errorMessage)
    } finally {
      setUploadLoading(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-center mt-4 text-gray-700">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Not authenticated state
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <p className="text-center text-gray-700">Please log in to view your profile.</p>
          <button
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-full shadow-md hover:bg-blue-600 w-full"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  // Main profile view
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="bg-white shadow-xl rounded-2xl w-[90%] max-w-3xl p-6 backdrop-blur-lg bg-opacity-80">
        {/* Header */}
        <div className="w-full bg-gradient-to-r from-blue-400 to-blue-700 flex items-center justify-between px-6 h-14 rounded-t-2xl shadow-md">
          <IoPerson className="text-2xl text-white" />
          <h1 className="text-lg font-semibold text-white">User Profile</h1>
          <TbArrowBackUp
            className="text-2xl text-white cursor-pointer hover:scale-110 transition"
            onClick={() => navigate(-1)}
          />
        </div>

        {/* Profile Picture Section */}
        <div className="mt-6 flex flex-col items-center">
          <div className="relative">
            <img
              src={user.profile_pic 
                 ? `http://localhost:5000${
                      user.profile_image
                    }?t=${new Date().getTime()}`: "https://via.placeholder.com/150"
                  }
              alt="Profile"
              className="rounded-full border-4 border-blue-500 w-44 h-44 shadow-lg transition-transform hover:scale-105 object-cover"
            />
            <IoAddCircle
              className="absolute bottom-0 right-0 text-blue-500 text-4xl cursor-pointer hover:text-blue-700 transition bg-white rounded-full"
              onClick={() => document.getElementById("imageInput").click()}
            />
            <input id="imageInput" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>

          {/* User Info */}
          <div className="text-center mt-4">
            <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
            <p className="text-gray-600 text-sm">{user.email}</p>
          </div>

          {/* Error Message */}
          {uploadError && (
            <div className="mt-2 text-red-500 text-sm bg-red-50 p-3 rounded-md border border-red-200">
              {uploadError}
            </div>
          )}

          {/* Success Message for File Selection */}
          {selectedFile && !uploadError && (
            <div className="mt-2 text-green-600 text-sm bg-green-50 p-3 rounded-md border border-green-200">
              File selected: {selectedFile.name} - Ready to upload!
            </div>
          )}
        </div>

        {/* User Details */}
        <div className="mt-6 px-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center underline decoration-blue-400">
            Your Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { label: "Name", value: user.username },
              { label: "Email", value: user.email },
              { label: "Phone", value: user.phone_number },
            ].map(({ label, value }, index) => (
              <div key={index} className="bg-gray-100 p-4 rounded-lg shadow-sm hover:shadow-md transition">
                <p className="font-medium text-gray-700">{label}:</p>
                <p className="text-gray-900 font-semibold">{value || "Not provided"}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Upload Button */}
        <div className="mt-6 px-6 text-center">
          <button
            className={`${
              uploadLoading
                ? "bg-gray-400 cursor-not-allowed"
                : selectedFile
                  ? "bg-blue-500 hover:bg-blue-600 hover:scale-105"
                  : "bg-gray-300 cursor-not-allowed"
            } text-white px-8 py-3 rounded-full shadow-md transition font-semibold flex items-center justify-center mx-auto min-w-[150px]`}
            onClick={handleUpload}
            disabled={uploadLoading || !selectedFile}
          >
            {uploadLoading ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                Uploading...
              </>
            ) : selectedFile ? (
              "Upload Image"
            ) : (
              "Select Image First"
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex space-x-4 px-6 pb-6 justify-center">
          <button
            className="bg-blue-500 text-white px-6 py-2 shadow-md hover:bg-blue-600 hover:scale-105 rounded-full font-semibold transition"
            onClick={() => navigate("/profile/password")}
          >
            Update Password
          </button>
          <button
            className="bg-red-500 text-white px-6 py-2 rounded-full shadow-md hover:bg-red-600 hover:scale-105 font-semibold transition"
            onClick={logout}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
