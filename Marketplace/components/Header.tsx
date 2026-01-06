'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 shadow-lg w-full" style={{ backgroundColor: 'var(--color-primary-dark)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold" style={{ color: 'var(--color-text-on-dark)' }}>Tafa Business</div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:space-x-8">
            <Link href="/" className="transition-colors" style={{ color: 'var(--color-text-on-dark)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent-yellow)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-on-dark)'}>
              Accueil
            </Link>
            <Link href="/categories" className="transition-colors" style={{ color: 'var(--color-text-on-dark)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent-yellow)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-on-dark)'}>
              Catégories
            </Link>
            <Link href="/products" className="transition-colors" style={{ color: 'var(--color-text-on-dark)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent-yellow)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-on-dark)'}>
              Produits
            </Link>
            <Link href="/about" className="transition-colors" style={{ color: 'var(--color-text-on-dark)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent-yellow)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-on-dark)'}>
              À propos
            </Link>
            <Link href="/contact" className="transition-colors" style={{ color: 'var(--color-text-on-dark)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent-yellow)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-on-dark)'}>
              Contact
            </Link>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link
              href="/login"
              className="transition-colors"
              style={{ color: 'var(--color-text-on-dark)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent-yellow)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-on-dark)'}
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="rounded-lg px-4 py-2 font-semibold transition-colors"
              style={{ 
                backgroundColor: 'var(--color-accent-yellow)',
                color: 'var(--color-primary-dark)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-accent-yellow-dark)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-accent-yellow)'}
            >
              Inscription
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            style={{ color: 'var(--color-text-on-dark)' }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
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

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 space-y-4">
            <Link href="/" className="block transition-colors" style={{ color: 'var(--color-text-on-dark)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent-yellow)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-on-dark)'}>
              Accueil
            </Link>
            <Link href="/categories" className="block transition-colors" style={{ color: 'var(--color-text-on-dark)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent-yellow)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-on-dark)'}>
              Catégories
            </Link>
            <Link href="/products" className="block transition-colors" style={{ color: 'var(--color-text-on-dark)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent-yellow)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-on-dark)'}>
              Produits
            </Link>
            <Link href="/about" className="block transition-colors" style={{ color: 'var(--color-text-on-dark)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent-yellow)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-on-dark)'}>
              À propos
            </Link>
            <Link href="/contact" className="block transition-colors" style={{ color: 'var(--color-text-on-dark)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent-yellow)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-on-dark)'}>
              Contact
            </Link>
            <div className="pt-4 space-y-2 border-t" style={{ borderColor: 'var(--color-border-gray-dark)' }}>
              <Link
                href="/login"
                className="block transition-colors"
                style={{ color: 'var(--color-text-on-dark)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent-yellow)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-on-dark)'}
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="block rounded-lg px-4 py-2 font-semibold text-center transition-colors"
                style={{ 
                  backgroundColor: 'var(--color-accent-yellow)',
                  color: 'var(--color-primary-dark)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-accent-yellow-dark)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-accent-yellow)'}
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

