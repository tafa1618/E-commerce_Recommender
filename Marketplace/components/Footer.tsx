import Link from 'next/link'

const footerLinks = {
  company: [
    { name: 'À propos', href: '/about' },
    { name: 'Notre équipe', href: '/team' },
    { name: 'Carrières', href: '/careers' },
    { name: 'Blog', href: '/blog' },
  ],
  support: [
    { name: 'Centre d\'aide', href: '/help' },
    { name: 'Contact', href: '/contact' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Livraison', href: '/shipping' },
  ],
  legal: [
    { name: 'Mentions légales', href: '/legal' },
    { name: 'Confidentialité', href: '/privacy' },
    { name: 'CGV', href: '/terms' },
    { name: 'Cookies', href: '/cookies' },
  ],
}

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--color-primary-dark)' }}>
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10 md:py-12 lg:py-16">
        {/* Mobile-first: 2 colonnes sur mobile, 4 sur desktop */}
        <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4">
          {/* Brand - pleine largeur sur mobile */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center">
              <img 
                src="/logo-Tafa.png" 
                alt="Tafa Business" 
                className="h-7 sm:h-8 w-auto"
              />
            </Link>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-400">
              Votre marketplace de confiance pour tous vos besoins quotidiens.
            </p>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-white">Entreprise</h3>
            <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-xs sm:text-sm text-gray-400 hover:text-white active:text-white transition-colors touch-manipulation">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-white">Support</h3>
            <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-xs sm:text-sm text-gray-400 hover:text-white active:text-white transition-colors touch-manipulation">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-white">Légal</h3>
            <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-xs sm:text-sm text-gray-400 hover:text-white active:text-white transition-colors touch-manipulation">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 sm:mt-10 md:mt-12 border-t border-gray-800 pt-6 sm:pt-8">
          <p className="text-xs sm:text-sm text-gray-400 text-center">
            &copy; {new Date().getFullYear()} Tafa Business. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}

