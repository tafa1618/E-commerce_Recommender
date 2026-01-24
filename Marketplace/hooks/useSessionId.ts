'use client'

import { useState, useEffect } from 'react'

/**
 * Hook pour gérer le session_id de l'utilisateur
 * Utilise localStorage pour persister la session
 */
export function useSessionId(): string {
  const [sessionId, setSessionId] = useState<string>('')

  useEffect(() => {
    // Récupérer ou créer un session_id
    let id = localStorage.getItem('marketplace_session_id')
    
    if (!id) {
      // Générer un nouvel ID de session
      id = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
      localStorage.setItem('marketplace_session_id', id)
    }
    
    setSessionId(id)
  }, [])

  return sessionId
}

