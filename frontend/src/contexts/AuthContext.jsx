import { createContext, useState, useContext, useEffect } from "react"
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
  const [token, setToken] = useState(() => localStorage.getItem("token"))
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem("token"))
  const [loading, setLoading] = useState(true)

  // ✅ Set axios defaults immediately
  axios.defaults.baseURL = "http://localhost:5000"

  // ✅ This sets the Authorization header as soon as the token exists
  useEffect(() => {
    const localToken = localStorage.getItem("token")
    if (localToken) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${localToken}`
    } else {
      delete axios.defaults.headers.common["Authorization"]
    }
  }, [])

  // ✅ Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const localToken = localStorage.getItem("token")

      if (!localToken) {
        setLoading(false)
        return
      }

      axios.defaults.headers.common["Authorization"] = `Bearer ${localToken}`

      try {
        const res = await axios.get("/api/users/profile")
        setUser(res.data)
        setIsAuthenticated(true)
      } catch (error) {
        console.error("Error loading user:", error?.response?.data || error.message)
        localStorage.removeItem("token")
        setToken(null)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (email, password) => {
    try {
      const res = await axios.post("/api/users/login", { email, password })
      const { token: newToken, user: userData } = res.data

      localStorage.setItem("token", newToken)
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`

      setToken(newToken)
      setUser(userData)
      setIsAuthenticated(true)
    } catch (error) {
      console.error("Login error:", error?.response?.data || error.message)
      throw error
    }
  }

  const register = async (username, email, password, phone_number) => {
    try {
      const res = await axios.post("/api/users/register", {
        username,
        email,
        password,
        phone_number,
      })
      const { token: newToken, user: userData } = res.data

      localStorage.setItem("token", newToken)
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`

      setToken(newToken)
      setUser(userData)
      setIsAuthenticated(true)
    } catch (error) {
      console.error("Registration error:", error?.response?.data || error.message)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
    delete axios.defaults.headers.common["Authorization"]

    axios.post("/api/users/logout").catch((err) =>
      console.error("Logout error:", err?.response?.data || err.message)
    )
  }

  const updateProfilePicture = async (file) => {
    if (!user) return

    const formData = new FormData()
    formData.append("profile_pic", file)

    try {
      const res = await axios.put(`/api/users/profile/${user.id}/picture`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      setUser({ ...user, profile_pic: res.data.profile_pic })
    } catch (error) {
      console.error("Error updating profile picture:", error?.response?.data || error.message)
      throw error
    }
  }

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateProfilePicture,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
