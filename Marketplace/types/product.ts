/**
 * Types TypeScript pour les produits du marketplace
 * ML-ready avec toutes les métadonnées nécessaires
 */

export interface Product {
  id: number
  product_id: string
  nom: string
  description_seo?: string
  meta_description?: string
  mots_cles?: string
  prix: number
  prix_texte: string
  image?: string
  lien?: string
  categorie?: string
  marque?: string
  note?: string
  remise?: string
  source: string
  
  // Métadonnées ML
  validation_score?: number
  validated?: boolean
  niche_score?: number
  niche_level?: string
  
  // Traçabilité
  created_at: string
  updated_at: string
  published_at?: string
  status: 'active' | 'draft' | 'archived'
  
  // Contexte
  source_channel?: string
  user_id?: string
  session_id?: string
  
  // Données structurées
  features?: {
    validation?: any
    niche?: any
    original_product?: any
  }
  events?: any[]
}

export interface ProductEvent {
  id: number
  product_id: string
  event_type: 'view' | 'click' | 'add_to_cart' | 'purchase' | 'abandon'
  user_id?: string
  session_id?: string
  device_type?: 'mobile' | 'desktop' | 'tablet'
  source?: string
  timestamp: string
  metadata?: Record<string, any>
}

export interface PublishProductRequest {
  produit: {
    nom: string
    prix: number
    prix_texte: string
    image?: string
    lien?: string
    categorie?: string
    marque?: string
    note?: string
    remise?: string
    source?: string
  }
  description_seo?: {
    description_seo: string
    meta_description: string
    mots_cles: string
  }
  validation_data?: {
    score: number
    validated: boolean
    keywords?: string[]
  }
  niche_data?: {
    score: number
    level: string
  }
  user_id?: string
  session_id?: string
}

