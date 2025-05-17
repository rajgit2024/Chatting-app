"use client"

import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useEffect } from "react"

const ProtectedRoute = () => {
  const { isAuthenticated, loading, refreshAuth } = useAuth()

  // Try to refresh auth status when component mounts
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      refreshAuth()
    }
  }, [isAuthenticated, loading, refreshAuth])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Render child routes if authenticated
  return <Outlet />
}

export default ProtectedRoute;


