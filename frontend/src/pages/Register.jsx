import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { AlertCircle } from "lucide-react"

const Register = () => {
    // name, email, password, phone_number
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone_number,setPhone_number]=useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!username||!email||!password ||!phone_number) {
      alert("All field are required!");
      return
    }

    setLoading(true)

    try {
      await register(username, email, password,phone_number)
      navigate("/login")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to register. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold">Create an account</h2>
          <p className="text-gray-600 dark:text-gray-400">Enter your details to create your account</p>
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            <AlertCircle className="w-5 h-5 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white"
              placeholder="johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
  <label htmlFor="phone_number" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
    Phone Number
  </label>
  <input
    id="phone_number"
    type="text"
    name="phone_number"
    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white"
    placeholder="+91 1234567890"
    value={phone_number}
    onChange={(e) => setPhone_number(e.target.value)}
    required
  />
</div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
                Creating account...
              </div>
            ) : (
              "Register"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:text-blue-700">
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Register
