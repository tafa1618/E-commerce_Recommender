import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.MARKETPLACE_API_URL || 'http://localhost:8001'

/**
 * GET /api/cart?session_id=...
 * Récupère le panier d'un utilisateur
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const session_id = searchParams.get('session_id')

    if (!session_id) {
      return NextResponse.json(
        { success: false, error: 'session_id est requis' },
        { status: 400 }
      )
    }

    const response = await fetch(`${API_BASE_URL}/api/marketplace/cart?session_id=${encodeURIComponent(session_id)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.error || 'Erreur lors de la récupération du panier')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de la récupération du panier' 
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/cart?session_id=...
 * Vide complètement le panier
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const session_id = searchParams.get('session_id')

    if (!session_id) {
      return NextResponse.json(
        { success: false, error: 'session_id est requis' },
        { status: 400 }
      )
    }

    const response = await fetch(`${API_BASE_URL}/api/marketplace/cart?session_id=${encodeURIComponent(session_id)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.error || 'Erreur lors du vidage du panier')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error clearing cart:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors du vidage du panier' 
      },
      { status: 500 }
    )
  }
}

