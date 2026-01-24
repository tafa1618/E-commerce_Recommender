import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.MARKETPLACE_API_URL || 'http://localhost:8001'

/**
 * PUT /api/cart/update
 * Modifie la quantité d'un produit dans le panier
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { product_id, quantite, session_id } = body

    if (!product_id || quantite === undefined || !session_id) {
      return NextResponse.json(
        { success: false, error: 'product_id, quantite et session_id sont requis' },
        { status: 400 }
      )
    }

    const response = await fetch(`${API_BASE_URL}/api/marketplace/cart/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ product_id, quantite, session_id }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.error || 'Erreur lors de la modification')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating cart:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de la modification' 
      },
      { status: 500 }
    )
  }
}

