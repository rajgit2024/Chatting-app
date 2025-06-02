"use client"

import { useState, useEffect } from "react"
import { IoPerson, IoAddCircle } from "react-icons/io5"
import { TbArrowBackUp } from "react-icons/tb"
import { useAuth } from "../contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const UserProfile = () => {
  const { user, setUser, logout, loading } = useAuth()
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [currentProfilePic, setCurrentProfilePic] = useState(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const navigate = useNavigate()

  // Simple placeholder image
  const PLACEHOLDER_IMAGE = "https://via.placeholder.com/200x200/e2e8f0/64748b?text=User"

  // Set initial profile picture when user data loads
  useEffect(() => {
    if (user?.profile_pic) {
      setCurrentProfilePic(user.profile_pic)
    }
  }, [user])

  // Function to determine which image to display
  const getDisplayImageUrl = () => {
    if (previewUrl) return previewUrl
    if (currentProfilePic) return currentProfilePic
    if (user?.profile_pic) return user.profile_pic
    return PLACEHOLDER_IMAGE
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.match("image.*")) {
      setUploadError("Please select an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be less than 5MB")
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setUploadError(null)
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError("Please select an image first")
      return
    }

    if (!user?.id) {
      setUploadError("User ID is missing. Please log in again.")
      return
    }

    setUploadLoading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append("profile_pic", selectedFile)

      const token = localStorage.getItem("token")
      if (!token) throw new Error("Authentication token not found")

      const response = await axios.post("http://localhost:5000/api/users/upload-profile-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.message === "Profile image uploaded successfully!") {
        const newProfilePicUrl = response.data.fullUrl
        setUser({ ...user, profile_pic: newProfilePicUrl })
        setCurrentProfilePic(newProfilePicUrl)
        setSelectedFile(null)
        setPreviewUrl(null)

        const fileInput = document.getElementById("fileInput")
        if (fileInput) fileInput.value = ""

        alert("Profile picture updated successfully!")
      } else {
        throw new Error(response.data.message || "Upload failed")
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Failed to update profile picture"
      setUploadError(msg)
    } finally {
      setUploadLoading(false)
    }
  }

  const handleImageError = (e) => {
    e.target.onerror = null
    e.target.src = PLACEHOLDER_IMAGE
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
      >
        <div className="bg-white p-8 rounded-3xl shadow-2xl text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg font-medium">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
      >
        <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <IoPerson className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access your profile</p>
          <button
            className="w-full bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-2xl mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <IoPerson className="text-2xl text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">User Profile</h1>
                  <p className="text-white text-opacity-80">Manage your account</p>
                </div>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
              >
                <TbArrowBackUp className="text-2xl text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Profile Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Profile Image Section */}
          <div className="p-8 text-center">
            <div className="relative inline-block mb-6">
              <img
                src={getDisplayImageUrl() || "/placeholder.svg"}
                alt="Profile"
                className="w-48 h-48 rounded-3xl object-cover shadow-xl border-4 border-gray-100"
                onError={handleImageError}
              />
              <button
                onClick={() => document.getElementById("fileInput").click()}
                className="absolute -bottom-4 -right-4 w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-xl hover:bg-blue-600 transition-colors border-4 border-white"
              >
                <IoAddCircle className="text-2xl text-white" />
              </button>
              <input id="fileInput" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>

            <h2 className="text-4xl font-bold text-gray-800 mb-2">{user.username}</h2>
            <p className="text-xl text-gray-600 mb-6">{user.email}</p>

            {/* Status Badges */}
            <div className="flex justify-center space-x-3 mb-8">
              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">✓ Verified</span>
              <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Active User</span>
            </div>

            {/* Upload Section */}
            {selectedFile && (
              <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                <p className="text-blue-700 font-medium mb-2">Ready to upload: {selectedFile.name}</p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => {
                      setSelectedFile(null)
                      setPreviewUrl(null)
                      setUploadError(null)
                      document.getElementById("fileInput").value = ""
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploadLoading}
                    className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    {uploadLoading ? "Uploading..." : "Upload Photo"}
                  </button>
                </div>
              </div>
            )}

            {uploadError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                <p className="text-red-600">{uploadError}</p>
              </div>
            )}
          </div>

          {/* User Details Section */}
          <div className="p-8 border-t border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Account Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <IoPerson className="text-xl text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Full Name</p>
                    <p className="text-gray-800 text-lg font-semibold">{user.username}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl text-purple-600">@</span>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Email</p>
                    <p className="text-gray-800 text-lg font-semibold break-all">{user.email}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl text-green-600">#</span>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium">User ID</p>
                    <p className="text-gray-800 text-lg font-semibold">{user.id}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl text-pink-600">📅</span>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Member Since</p>
                    <p className="text-gray-800 text-lg font-semibold">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Not available"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div className="p-8 border-t border-gray-200 text-center">
            <button
              onClick={logout}
              className="bg-red-500 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-red-600 transition-colors shadow-lg hover:shadow-xl"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
