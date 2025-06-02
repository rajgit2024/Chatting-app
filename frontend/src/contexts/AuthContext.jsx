"use client"

import { createContext, useState, useContext, useEffect, useCallback } from "react"
import axios from "axios"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token")
    }
    return null
  })
  const [isAuthenticated, setIsAuthenticated] = useState(false) // Start with false until verified
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  // Set axios defaults immediately
  axios.defaults.baseURL = "http://localhost:5000"

  // Create a reusable function to load user data
  const loadUser = useCallback(async (authToken = null) => {
    const tokenToUse = authToken || localStorage.getItem("token")

    if (!tokenToUse) {
      console.log("No token found, user not authenticated")
      setLoading(false)
      setIsAuthenticated(false)
      return false
    }

    // Set the token in axios headers
    axios.defaults.headers.common["Authorization"] = `Bearer ${tokenToUse}`

    try {
      console.log("Fetching user profile with token:", tokenToUse.substring(0, 10) + "...")
      const res = await axios.get("/api/users/profile")
      console.log("User profile fetched successfully:", res.data)

      // Ensure user object has the expected structure
      setUser(res.data)
      setIsAuthenticated(true)
      setAuthError(null)

      // Log user ID for debugging
      console.log("User authenticated with ID:", res.data.id)
      return true
    } catch (error) {
      console.error("Error loading user:", error?.response?.data || error.message)

      // Check if the error is due to an invalid token
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.log("Token invalid or expired, clearing authentication")
        localStorage.removeItem("token")
        delete axios.defaults.headers.common["Authorization"]
        setToken(null)
        setUser(null)
        setAuthError("Session expired. Please log in again.")
      } else {
        // For other errors, keep the token but show an error
        setAuthError("Could not connect to server. Please try again later.")
      }

      setIsAuthenticated(false)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Load user on mount
  useEffect(() => {
    loadUser()
  }, [loadUser])

  // This sets the Authorization header as soon as the token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      console.log("Auth token set in axios defaults:", token.substring(0, 10) + "...")
    } else {
      delete axios.defaults.headers.common["Authorization"]
      console.log("No auth token found, removed from axios defaults")
    }
  }, [token])

  const login = async (email, password) => {
    try {
      setLoading(true)
      console.log("Attempting login for:", email)
      const res = await axios.post("/api/users/login", { email, password })
      const { token: newToken, user: userData } = res.data

      console.log("Login successful, user data:", userData)

      // Store token in localStorage
      localStorage.setItem("token", newToken)

      // Update state
      setToken(newToken)
      setUser(userData)
      setIsAuthenticated(true)
      setAuthError(null)

      // Log user ID for debugging
      console.log("User authenticated with ID:", userData.id)

      return { success: true, user: userData }
    } catch (error) {
      console.error("Login error:", error?.response?.data || error.message)
      setAuthError(error?.response?.data?.message || "Login failed. Please check your credentials.")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (username, email, password, phone_number) => {
    try {
      setLoading(true)
      console.log("Attempting registration for:", email)
      const res = await axios.post("/api/users/register", {
        username,
        email,
        password,
        phone_number,
      })
      const { token: newToken, user: userData } = res.data

      console.log("Registration successful, user data:", userData)

      // Store token in localStorage
      localStorage.setItem("token", newToken)

      // Update state
      setToken(newToken)
      setUser(userData)
      setIsAuthenticated(true)
      setAuthError(null)

      // Log user ID for debugging
      console.log("User registered with ID:", userData.id)

      return { success: true, user: userData }
    } catch (error) {
      console.error("Registration error:", error?.response?.data || error.message)
      setAuthError(error?.response?.data?.message || "Registration failed. Please try again.")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    console.log("Logging out user:", user?.id)

    // Clear token from localStorage
    localStorage.removeItem("token")

    // Update state
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
    setAuthError(null)

    // Clear authorization header
    window.dispatchEvent(new Event("tokenChanged"))

    // Notify server (but don't wait for response)
    axios.post("/api/users/logout").catch((err) => console.error("Logout error:", err?.response?.data || err.message))

    console.log("User logged out successfully")
  }

  // Check authentication status - useful for debugging
  useEffect(() => {
    console.log("Auth state changed:", {
      isAuthenticated,
      userId: user?.id,
      tokenExists: !!token,
      loading,
    })
  }, [isAuthenticated, user, token, loading])

  // Provide the context value
  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    authError,
    login,
    register,
    logout,
    refreshAuth: loadUser, // Expose this function to manually refresh auth
    setUser, // Expose setUser to allow profile updates
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
