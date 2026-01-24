import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.MARKETPLACE_API_URL || 'http://localhost:8001'

/**
 * DELETE /api/cart/[product_id]?session_id=...
 * Supprime un produit du panier
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ product_id: string }> }
) {
  try {
    const { product_id } = await params
    const searchParams = request.nextUrl.searchParams
    const session_id = searchParams.get('session_id')

    if (!session_id) {
      return NextResponse.json(
        { success: false, error: 'session_id est requis' },
        { status: 400 }
      )
    }

    const response = await fetch(`${API_BASE_URL}/api/marketplace/cart/${product_id}?session_id=${encodeURIComponent(session_id)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.error || 'Erreur lors de la suppression')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error removing from cart:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression' 
      },
      { status: 500 }
    )
  }
}

