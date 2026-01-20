import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:8000'

/**
 * POST /api/products/generate-seo
 * Génère une description SEO pour un produit
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nom, categorie } = body

    if (!nom) {
      return NextResponse.json(
        { success: false, error: 'Le nom du produit est requis' },
        { status: 400 }
      )
    }

    // Appeler le backend pour générer la description SEO
    const response = await fetch(`${API_BASE_URL}/api/boutique/generate-description`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        produit: {
          nom,
          categorie: categorie || 'Général',
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Erreur lors de la génération SEO')
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      description: data.description || data,
    })
  } catch (error) {
    console.error('Error generating SEO:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la génération SEO',
      },
      { status: 500 }
    )
  }
}

