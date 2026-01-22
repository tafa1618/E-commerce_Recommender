import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.MARKETPLACE_API_URL || 'http://localhost:8001'

/**
 * GET /api/categories/[categorie]/produits
 * Récupère les produits d'une catégorie depuis le backend
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { categorie: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get('limit') || '20'
    const categorie = decodeURIComponent(params.categorie)

    const url = new URL(`${API_BASE_URL}/api/marketplace/categories/${encodeURIComponent(categorie)}/produits`)
    url.searchParams.set('limit', limit)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }, // Cache pendant 1 minute
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching products by category:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de la récupération des produits' 
      },
      { status: 500 }
    )
  }
}

