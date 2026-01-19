import { Metadata } from 'next'
import { Suspense } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ShopGrid from '@/components/ShopGrid'
import Pagination from '@/components/Pagination'
import ShopPageContent from '@/components/ShopPageContent'

export const metadata: Metadata = {
  title: 'Boutique - Tafa Business',
  description: 'Découvrez tous nos produits de qualité. Livraison rapide partout au Sénégal.',
}

interface ShopPageProps {
  searchParams: Promise<{
    page?: string
    categorie?: string
    search?: string
  }>
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams
  const currentPage = parseInt(params.page || '1', 10)
  const pageSize = 24 // Nombre de produits par page

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-lg text-gray-600">Chargement...</div>
          </div>
        </div>
      }>
        <ShopPageContent 
          currentPage={currentPage}
          pageSize={pageSize}
          categorie={params.categorie}
          search={params.search}
        />
      </Suspense>

      <Footer />
    </main>
  )
}

