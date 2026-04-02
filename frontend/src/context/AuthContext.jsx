import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiLogin, apiSignup } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('momato_user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('momato_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const data = await apiLogin(email, password)
    localStorage.setItem('momato_user', JSON.stringify(data))
    setUser(data)
    return data
  }

  const signup = async (name, email, phone, password, role = 'user') => {
    const data = await apiSignup(name, email, phone, password, role)
    localStorage.setItem('momato_user', JSON.stringify(data))
    setUser(data)
    return data
  }

  const logout = () => {
    localStorage.removeItem('momato_user')
    setUser(null)
  }

  const updateUser = (data) => {
    const updated = { ...user, ...data }
    localStorage.setItem('momato_user', JSON.stringify(updated))
    setUser(updated)
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
