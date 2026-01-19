'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl?: string
  onPageChange?: (page: number) => void
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  baseUrl = '/shop',
  onPageChange 
}: PaginationProps) {
  // Calculer les pages à afficher (max 7 pages visibles)
  const getVisiblePages = () => {
    const delta = 2 // Nombre de pages de chaque côté de la page actuelle
    const range = []
    const rangeWithDots = []

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i)
      }
    }

    let l: number | null = null
    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l !== 1) {
          rangeWithDots.push(-1) // -1 représente les "..."
        }
      }
      rangeWithDots.push(i)
      l = i
    })

    return rangeWithDots
  }

  const visiblePages = getVisiblePages()

  const handlePageClick = (page: number, e: React.MouseEvent) => {
    if (onPageChange) {
      e.preventDefault()
      onPageChange(page)
    }
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <nav className="flex items-center justify-center gap-2 mt-8 sm:mt-12" aria-label="Pagination">
      {/* Bouton Précédent */}
      {currentPage > 1 ? (
        onPageChange ? (
          <button
            onClick={(e) => handlePageClick(currentPage - 1, e)}
            className="flex items-center gap-1 px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
            aria-label="Page précédente"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Précédent</span>
          </button>
        ) : (
          <Link
            href={`${baseUrl}?page=${currentPage - 1}`}
            className="flex items-center gap-1 px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
            aria-label="Page précédente"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Précédent</span>
          </Link>
        )
      ) : (
        <div className="flex items-center gap-1 px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed">
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Précédent</span>
        </div>
      )}

      {/* Numéros de pages */}
      <div className="flex items-center gap-1 sm:gap-2">
        {visiblePages.map((page, index) => {
          if (page === -1) {
            return (
              <span
                key={`dots-${index}`}
                className="px-2 sm:px-3 py-2 text-sm sm:text-base text-gray-500"
              >
                ...
              </span>
            )
          }

          const isActive = page === currentPage

          if (onPageChange) {
            return (
              <button
                key={page}
                onClick={(e) => handlePageClick(page, e)}
                className={`min-w-[36px] sm:min-w-[44px] px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base font-medium rounded-lg transition-colors touch-manipulation ${
                  isActive
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100'
                }`}
                aria-label={`Page ${page}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {page}
              </button>
            )
          }

          return (
            <Link
              key={page}
              href={`${baseUrl}?page=${page}`}
              className={`min-w-[36px] sm:min-w-[44px] px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base font-medium rounded-lg transition-colors touch-manipulation ${
                isActive
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100'
              }`}
              aria-label={`Page ${page}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {page}
            </Link>
          )
        })}
      </div>

      {/* Bouton Suivant */}
      {currentPage < totalPages ? (
        onPageChange ? (
          <button
            onClick={(e) => handlePageClick(currentPage + 1, e)}
            className="flex items-center gap-1 px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
            aria-label="Page suivante"
          >
            <span className="hidden sm:inline">Suivant</span>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        ) : (
          <Link
            href={`${baseUrl}?page=${currentPage + 1}`}
            className="flex items-center gap-1 px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
            aria-label="Page suivante"
          >
            <span className="hidden sm:inline">Suivant</span>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
        )
      ) : (
        <div className="flex items-center gap-1 px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed">
          <span className="hidden sm:inline">Suivant</span>
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      )}
    </nav>
  )
}

