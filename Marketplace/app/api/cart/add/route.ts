import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.MARKETPLACE_API_URL || 'http://localhost:8001'

/**
 * POST /api/cart/add
 * Ajoute un produit au panier
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { product_id, quantite = 1, session_id } = body

    if (!product_id || !session_id) {
      return NextResponse.json(
        { success: false, error: 'product_id et session_id sont requis' },
        { status: 400 }
      )
    }

    const response = await fetch(`${API_BASE_URL}/api/marketplace/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ product_id, quantite, session_id }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.error || 'Erreur lors de l\'ajout au panier')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de l\'ajout au panier' 
      },
      { status: 500 }
    )
  }
}

