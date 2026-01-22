import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.MARKETPLACE_API_URL || 'http://localhost:8001'

/**
 * POST /api/products/generate-seo
 * Génère une description SEO-friendly pour un produit
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { texte_produit } = body

    if (!texte_produit || !texte_produit.trim()) {
      return NextResponse.json(
        { success: false, error: 'Le texte du produit est requis' },
        { status: 400 }
      )
    }

    const response = await fetch(`${API_BASE_URL}/api/marketing/generate-seo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ texte_produit: texte_produit.trim() }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.error || 'Erreur lors de la génération SEO')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error generating SEO description:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de la génération de la description SEO' 
      },
      { status: 500 }
    )
  }
}
