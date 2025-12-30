import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import api, { clearApiCache } from '../lib/api.js'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })

  useEffect(() => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  }, [token])

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user))
    else localStorage.removeItem('user')
  }, [user])

  // Create stable wrapper functions using useCallback
  const setTokenWrapper = useCallback((newToken) => {
    setToken(newToken)
  }, [])

  const setUserWrapper = useCallback((newUser) => {
    setUser(newUser)
  }, [])

  const logoutWrapper = useCallback(() => {
    console.log('AuthContext logout called, clearing token and user')
    // Clear cache on logout
    clearApiCache()
    setToken('')
    setUser(null)
  }, [])

  const value = useMemo(() => ({
    token,
    setToken: setTokenWrapper,
    user,
    setUser: setUserWrapper,
    isStaff: user?.role ? true : false,
    logout: logoutWrapper,
  }), [token, user, setTokenWrapper, setUserWrapper, logoutWrapper])

  // attach token to axios
  useEffect(() => {
    api.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : ''
  }, [token])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}


