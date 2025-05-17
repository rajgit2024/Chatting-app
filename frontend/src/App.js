import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { ChatProvider } from "./contexts/ChatContext"
import { SocketProvider } from "./contexts/SocketProvider"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ChatDashboard from "./pages/ChatDashboard"
import ProtectedRoute from "./components/ProtectedRoute"
import UserProfile from "./pages/UserProfile"

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <ChatProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/chat" element={<ChatDashboard />} />
                {/* Add other protected routes here */}
                <Route path="/profile" element={<UserProfile/>} />
              </Route>

              {/* Redirect to login by default */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </ChatProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
