import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.MARKETPLACE_API_URL || 'http://localhost:8001'

/**
 * POST /api/products/track
 * Enregistre un événement pour le tracking ML
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { product_id, event_type, user_id, session_id, device_type, source, metadata } = body

    if (!product_id || !event_type) {
      return NextResponse.json(
        { success: false, error: 'product_id et event_type sont requis' },
        { status: 400 }
      )
    }

    const response = await fetch(`${API_BASE_URL}/api/marketplace/track-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id,
        event_type,
        user_id,
        session_id,
        device_type,
        source,
        metadata,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Erreur lors de l\'enregistrement')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error tracking event:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de l\'enregistrement' 
      },
      { status: 500 }
    )
  }
}

