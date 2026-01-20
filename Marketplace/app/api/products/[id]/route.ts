import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:8000'

/**
 * GET /api/products/[id]
 * Récupère un produit par ID depuis le backend
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log(`🔍 API: Fetching product ${id} from backend`)

    const backendUrl = `${API_BASE_URL}/api/marketplace/products/${id}`
    console.log(`🌐 API: Backend URL: ${backendUrl}`)

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Ne pas cacher pour avoir les données à jour
    })

    console.log(`📡 API: Backend response status: ${response.status}`)

    if (!response.ok) {
      let errorText = ''
      try {
        errorText = await response.text()
        console.error(`❌ API: Backend API error for product ${id}: ${response.status} ${response.statusText}`, errorText)
      } catch (e) {
        console.error(`❌ API: Backend API error for product ${id}: ${response.status} ${response.statusText}`)
      }
      
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: 'Produit non trouvé', product_id: id },
          { status: 404 }
        )
      }
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log(`✅ API: Product data received for ${id}`)
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ API: Error fetching product:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de la récupération du produit' 
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/products/[id]
 * Modifie un produit sur le marketplace (via le backend)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const response = await fetch(`${API_BASE_URL}/api/marketplace/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.error || 'Erreur lors de la modification')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de la modification' 
      },
      { status: 500 }
    )
  }
}

