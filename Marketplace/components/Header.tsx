'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 shadow-lg w-full" style={{ backgroundColor: 'var(--color-primary-dark)' }}>
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo - plus petit sur mobile */}
          <Link href="/" className="flex items-center space-x-2">
            <img 
              src="/logo-Tafa.png" 
              alt="Tafa Business" 
              className="h-8 sm:h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:space-x-8">
            <Link href="/" className="transition-colors nav-link">
              Accueil
            </Link>
            <Link href="/shop" className="transition-colors nav-link font-semibold">
              Boutique
            </Link>
            <Link href="/categories" className="transition-colors nav-link">
              Catégories
            </Link>
            <Link href="/products" className="transition-colors nav-link">
              Produits
            </Link>
            <Link href="/about" className="transition-colors nav-link">
              À propos
            </Link>
            <Link href="/contact" className="transition-colors nav-link">
              Contact
            </Link>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link
              href="/login"
              className="transition-colors nav-link"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="rounded-lg px-4 py-2 font-semibold transition-colors btn-yellow"
            >
              Inscription
            </Link>
          </div>

          {/* Mobile menu button - plus grand pour faciliter le tap */}
          <button
            className="md:hidden p-2.5 touch-manipulation"
            style={{ color: 'var(--color-text-on-dark)' }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation - amélioré pour mobile */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 space-y-3 border-t border-gray-700/50">
            <Link 
              href="/" 
              className="block py-3 px-4 transition-colors nav-link rounded-lg hover:bg-white/10 active:bg-white/20 touch-manipulation"
              onClick={() => setIsMenuOpen(false)}
            >
              Accueil
            </Link>
            <Link 
              href="/shop" 
              className="block py-3 px-4 transition-colors nav-link rounded-lg hover:bg-white/10 active:bg-white/20 touch-manipulation font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              Boutique
            </Link>
            <Link 
              href="/categories" 
              className="block py-3 px-4 transition-colors nav-link rounded-lg hover:bg-white/10 active:bg-white/20 touch-manipulation"
              onClick={() => setIsMenuOpen(false)}
            >
              Catégories
            </Link>
            <Link 
              href="/products" 
              className="block py-3 px-4 transition-colors nav-link rounded-lg hover:bg-white/10 active:bg-white/20 touch-manipulation"
              onClick={() => setIsMenuOpen(false)}
            >
              Produits
            </Link>
            <Link 
              href="/about" 
              className="block py-3 px-4 transition-colors nav-link rounded-lg hover:bg-white/10 active:bg-white/20 touch-manipulation"
              onClick={() => setIsMenuOpen(false)}
            >
              À propos
            </Link>
            <Link 
              href="/contact" 
              className="block py-3 px-4 transition-colors nav-link rounded-lg hover:bg-white/10 active:bg-white/20 touch-manipulation"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="pt-4 space-y-3 border-t border-gray-700/50">
              <Link
                href="/login"
                className="block py-3 px-4 transition-colors nav-link rounded-lg hover:bg-white/10 active:bg-white/20 touch-manipulation text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="block rounded-lg px-4 py-3 font-semibold text-center transition-colors btn-yellow touch-manipulation active:opacity-80"
                onClick={() => setIsMenuOpen(false)}
              >
                Inscription
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}

