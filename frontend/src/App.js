import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Profile from "./pages/Profile"
import { AuthProvider } from "./contexts/AuthContext"
import { ChatProvider } from "./contexts/ChatContext"
import { SocketProvider } from "./contexts/SocketProvider"
import PrivateRoute from "./components/PrivateRoute"
import ChatDashboard from "./pages/ChatDashboard"

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <ChatProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/chat"
                  element={
                    <PrivateRoute>
                      <ChatDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/chat" replace />} />
              </Routes>
            </div>
          </ChatProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
