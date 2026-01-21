import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:8000'

/**
 * PATCH /api/products/[id]/status
 * Modifie le statut d'un produit (active/inactive)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
        
        // Essayer de parser en JSON
        try {
          errorData = JSON.parse(responseText)
          console.error(`❌ Erreur backend (JSON):`, errorData)
        } catch (parseError) {
          // Si ce n'est pas du JSON, utiliser le texte brut
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
      
      // Retourner l'erreur avec le code de statut du backend (404, 400, 500, etc.)
      return NextResponse.json(
        { 
          success: false, 
          error: errorData.detail || errorData.error || `Erreur lors de la modification du statut (${response.status})` 
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
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

