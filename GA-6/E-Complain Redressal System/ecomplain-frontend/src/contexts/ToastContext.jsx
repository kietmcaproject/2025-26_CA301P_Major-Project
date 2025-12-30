import React, { createContext, useContext, useState, useCallback } from 'react'
import { Snackbar, Alert } from '@mui/material'

const ToastContext = createContext()

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, severity = 'info', duration = 4000) => {
    const id = Date.now() + Math.random()
    const newToast = { id, message, severity, duration }
    
    setToasts((prev) => [...prev, newToast])
    
    // Auto-remove toast after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, duration)
    
    return id
  }, [])

  const showSuccess = useCallback((message, duration) => {
    return showToast(message, 'success', duration)
  }, [showToast])

  const showError = useCallback((message, duration) => {
    return showToast(message, 'error', duration || 6000) // Errors show longer by default
  }, [showToast])

  const showWarning = useCallback((message, duration) => {
    return showToast(message, 'warning', duration)
  }, [showToast])

  const showInfo = useCallback((message, duration) => {
    return showToast(message, 'info', duration)
  }, [showToast])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const value = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Render all toasts */}
      {toasts.map((toast, index) => (
        <Snackbar
          key={toast.id}
          open={true}
          autoHideDuration={toast.duration}
          onClose={() => removeToast(toast.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ 
            top: `${64 + index * 70}px !important`, // Stack toasts vertically
            zIndex: 9999
          }}
        >
          <Alert
            onClose={() => removeToast(toast.id)}
            severity={toast.severity}
            variant="filled"
            sx={{ width: '100%', minWidth: '300px' }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      ))}
    </ToastContext.Provider>
  )
}

