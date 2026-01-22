import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.MARKETPLACE_API_URL || 'http://localhost:8001'

/**
 * GET /api/categories
 * Récupère la liste des catégories disponibles
 */
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/marketplace/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 }, // Cache pendant 1 heure
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { 
        success: false, 
        categories: [],
        error: error instanceof Error ? error.message : 'Erreur lors de la récupération des catégories' 
      },
      { status: 500 }
    )
  }
}

