import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:8000'

/**
 * GET /api/products
 * Récupère les produits du marketplace depuis le backend
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    // Si status n'est pas spécifié, ne pas filtrer (pour admin)
    const status = searchParams.get('status')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')
    const categorie = searchParams.get('categorie')
    const search = searchParams.get('search')

    const url = new URL(`${API_BASE_URL}/api/marketplace/products`)
    // Ne pas ajouter status si non spécifié (pour récupérer tous les produits en admin)
    if (status) {
      url.searchParams.set('status', status)
    }
    if (limit) {
      url.searchParams.set('limit', limit)
    }
    if (offset) {
      url.searchParams.set('offset', offset)
    }
    if (categorie) {
      url.searchParams.set('categorie', categorie)
    }
    if (search) {
      url.searchParams.set('search', search)
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }, // Cache pendant 60 secondes
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de la récupération des produits' 
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/products
 * Publie un produit sur le marketplace (via le backend)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${API_BASE_URL}/api/marketplace/publish-product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Erreur lors de la publication')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error publishing product:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de la publication' 
      },
      { status: 500 }
    )
  }
}

