import { Metadata } from 'next'
import AdminLayout from '@/components/AdminLayout'
import AdminProductsList from '@/components/AdminProductsList'

export const metadata: Metadata = {
  title: 'Produits - Administration - Tafa Business',
  description: 'Gérer les produits du marketplace',
}

export default function AdminProductsPage() {
  return (
    <AdminLayout>
      <AdminProductsList />
    </AdminLayout>
  )
}

