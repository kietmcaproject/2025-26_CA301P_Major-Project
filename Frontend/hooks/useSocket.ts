"use client"

import { useEffect, useRef } from "react"
import { io, Socket } from "socket.io-client"

let globalSocket: Socket | null = null

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Reuse global socket instance to avoid multiple connections
    if (!globalSocket) {
      globalSocket = io("http://localhost:5000", {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      })

      globalSocket.on("connect", () => {
        console.log("✅ Socket connected:", globalSocket?.id)
      })

      globalSocket.on("disconnect", () => {
        console.log("❌ Socket disconnected")
      })

      globalSocket.on("error", (error) => {
        console.error("Socket error:", error)
      })
    }

    socketRef.current = globalSocket

    return () => {
      // Don't disconnect here; keep the socket alive for reuse
    }
  }, [])

  return socketRef
}
