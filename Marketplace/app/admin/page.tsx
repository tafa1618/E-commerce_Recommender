import { Metadata } from 'next'
import AdminLayout from '@/components/AdminLayout'
import AdminDashboard from '@/components/AdminDashboard'

export const metadata: Metadata = {
  title: 'Administration - Tafa Business',
  description: 'Panneau d\'administration du marketplace',
}

export default function AdminPage() {
  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  )
}
