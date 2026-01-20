import { Metadata } from 'next'
import AdminLayout from '@/components/AdminLayout'
import AddProductForm from '@/components/AddProductForm'

export const metadata: Metadata = {
  title: 'Ajouter un produit - Administration - Tafa Business',
  description: 'Ajouter un nouveau produit au marketplace',
}

export default function AddProductPage() {
  return (
    <AdminLayout>
      <AddProductForm />
    </AdminLayout>
  )
}

