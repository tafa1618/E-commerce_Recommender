'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  BarChart3,
  Menu,
  X
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Éviter les problèmes d'hydratation en attendant le montage côté client
  useEffect(() => {
    setMounted(true)
  }, [])

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', href: '/admin', active: true },
    { icon: Package, label: 'Produits', href: '/admin/products' },
    { icon: ShoppingCart, label: 'Commandes', href: '/admin/orders' },
    { icon: Users, label: 'Utilisateurs', href: '/admin/users' },
    { icon: BarChart3, label: 'Statistiques', href: '/admin/stats' },
    { icon: Settings, label: 'Paramètres', href: '/admin/settings' },
  ]

  // Pendant l'hydratation, rendre un layout simple pour éviter les différences
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-14">
            <Link href="/admin" className="flex items-center gap-2">
              <img 
                src="/logo-Tafa.png" 
                alt="Tafa Business" 
                className="h-8 w-auto"
              />
              <span className="hidden sm:inline text-lg font-semibold text-gray-900">
                Administration
              </span>
            </Link>
          </div>
        </header>
        <div className="flex">
          <aside className="hidden lg:block w-64 bg-white border-r border-gray-200"></aside>
          <main className="flex-1 lg:ml-0 overflow-x-hidden">
            <div className="max-w-[1600px] mx-auto p-3 sm:p-4 md:p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar - Style WordPress */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-14">
          <div className="flex items-center gap-4">
            {/* Menu mobile */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 touch-manipulation"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            {/* Logo */}
            <Link href="/admin" className="flex items-center gap-2">
              <img 
                src="/logo-Tafa.png" 
                alt="Tafa Business" 
                className="h-8 w-auto"
              />
              <span className="hidden sm:inline text-lg font-semibold text-gray-900">
                Administration
              </span>
            </Link>
          </div>

          {/* Actions rapides */}
          <div className="flex items-center gap-4">
            <Link
              href="/shop"
              target="_blank"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              Voir le site
            </Link>
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-white rounded bg-black hover:bg-gray-800 transition-colors touch-manipulation"
            >
              Déconnexion
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Style WordPress */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-40
            w-64 bg-white border-r border-gray-200
            transform transition-transform duration-200 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <nav className="h-full overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded
                        transition-colors touch-manipulation
                        ${item.active
                          ? 'bg-gray-100 text-gray-900 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        {/* Overlay pour mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content - Largeur optimisée pour éviter le scroll horizontal */}
        <main className="flex-1 lg:ml-0 overflow-x-hidden">
          <div className="max-w-[1600px] mx-auto p-3 sm:p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
