import Hero from '@/components/Hero'
import Features from '@/components/Features'
import Categories from '@/components/Categories'
import Products from '@/components/Products'
import Testimonials from '@/components/Testimonials'
import CTA from '@/components/CTA'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

async function getFeaturedProducts() {
  try {
    const apiUrl = process.env.BACKEND_API_URL || 'http://localhost:8000'
    const res = await fetch(`${apiUrl}/api/marketplace/products?status=active&limit=4`, {
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      return []
    }

    const data = await res.json()
    return data.produits || []
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return []
  }
}

export default async function Home() {
  const featuredProducts = await getFeaturedProducts()

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Features />
      <Categories />
      <Products products={featuredProducts} />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  )
}
