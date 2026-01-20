import { redirect } from 'next/navigation'

/**
 * Redirection de /products vers /shop
 * La page /shop est la version principale avec pagination
 */
export default function ProductsPage() {
  redirect('/shop')
}

