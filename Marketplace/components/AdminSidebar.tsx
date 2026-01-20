'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings,
  Users,
  FileText
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ReactNode
}

const navigation: NavItem[] = [
  { name: 'Tableau de bord', href: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
  { name: 'Produits', href: '/admin/products', icon: <Package className="w-5 h-5" /> },
  { name: 'Ajouter un produit', href: '/admin/products/add', icon: <Package className="w-5 h-5" /> },
  { name: 'Commandes', href: '/admin/orders', icon: <ShoppingCart className="w-5 h-5" /> },
  { name: 'Statistiques', href: '/admin/stats', icon: <BarChart3 className="w-5 h-5" /> },
  { name: 'Utilisateurs', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
  { name: 'Rapports', href: '/admin/reports', icon: <FileText className="w-5 h-5" /> },
  { name: 'Paramètres', href: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white transition-transform lg:translate-x-0">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <img 
              src="/logo-Tafa.png" 
              alt="Tafa Business Admin" 
              className="h-8 w-auto"
            />
            <span className="text-sm font-semibold text-gray-700">Admin</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors touch-manipulation ${
                  isActive
                    ? 'bg-black text-white'
                    : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
          >
            <span>← Retour au site</span>
          </Link>
        </div>
      </div>
    </aside>
  )
}

