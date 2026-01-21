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

/**
 * PATCH /api/products/[id]?action=status
 * Modifie uniquement le statut d'un produit (active/inactive)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action')
    
    // Si action=status, modifier uniquement le statut
    if (action === 'status') {
      console.log(`🔍 API Next.js: Modification du statut pour le produit ${id}`)
      
      const body = await request.json()
      const { status } = body
      console.log(`📝 Nouveau statut demandé: ${status}`)

      if (!status || !['active', 'inactive', 'draft', 'archived'].includes(status)) {
        return NextResponse.json(
          { success: false, error: 'Statut invalide. Doit être: active, inactive, draft ou archived' },
          { status: 400 }
        )
      }

      const backendUrl = `${API_BASE_URL}/api/marketplace/products/${id}/status`
      console.log(`🌐 Appel backend: ${backendUrl}`)
      console.log(`📦 Données envoyées:`, { status })

      const response = await fetch(backendUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      console.log(`📡 Réponse backend: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        let errorData = {}
        try {
          const responseText = await response.text()
          console.error(`❌ Réponse backend (texte brut):`, responseText)
          
          try {
            errorData = JSON.parse(responseText)
            console.error(`❌ Erreur backend (JSON):`, errorData)
          } catch (parseError) {
            console.error(`❌ Erreur backend (texte):`, responseText)
            return NextResponse.json(
              { 
                success: false, 
                error: `Backend error (${response.status}): ${responseText || response.statusText}` 
              },
              { status: response.status }
            )
          }
        } catch (e) {
          console.error(`❌ Erreur lors de la lecture de la réponse:`, e)
          return NextResponse.json(
            { 
              success: false, 
              error: `Erreur lors de la lecture de la réponse backend: ${e instanceof Error ? e.message : String(e)}` 
            },
            { status: 500 }
          )
        }
        
        return NextResponse.json(
          { 
            success: false, 
            error: errorData.detail || errorData.error || `Erreur lors de la modification du statut (${response.status})` 
          },
          { status: response.status }
        )
      }

      const data = await response.json()
      console.log('✅ Statut modifié avec succès:', data)
      return NextResponse.json(data)
    }
    
    // Autre action non supportée
    return NextResponse.json(
      { success: false, error: 'Action non supportée' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error updating product status:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de la modification du statut' 
      },
      { status: 500 }
    )
  }
}

