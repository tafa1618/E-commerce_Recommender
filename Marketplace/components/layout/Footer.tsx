'use client';

import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Send } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-primary text-white pt-16 pb-8 font-rubik">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Info */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center text-white font-bold">TB</div>
                            <span className="text-xl font-bold">Tafa Business</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            La première plateforme de sourcing et dropshipping en Afrique de l'Ouest.
                            Connectez votre business aux meilleurs fournisseurs mondiaux.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-secondary transition-colors">
                                <Facebook size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-secondary transition-colors">
                                <Instagram size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-secondary transition-colors">
                                <Twitter size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold mb-6">Liens Rapides</h3>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li><Link href="/" className="hover:text-secondary transition-colors">Accueil</Link></li>
                            <li><Link href="/boutique" className="hover:text-secondary transition-colors">Boutique</Link></li>
                            <li><Link href="/vendre" className="hover:text-secondary transition-colors">Devenir Vendeur</Link></li>
                            <li><Link href="/blog" className="hover:text-secondary transition-colors">Blog E-commerce</Link></li>
                            <li><Link href="/contact" className="hover:text-secondary transition-colors">Contactez-nous</Link></li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="text-lg font-bold mb-6">Catégories Top</h3>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li><Link href="/cat/electronique" className="hover:text-secondary transition-colors">Électronique & High-Tech</Link></li>
                            <li><Link href="/cat/maison" className="hover:text-secondary transition-colors">Maison & Bureau</Link></li>
                            <li><Link href="/cat/beaute" className="hover:text-secondary transition-colors">Santé & Beauté</Link></li>
                            <li><Link href="/cat/mode" className="hover:text-secondary transition-colors">Mode Homme & Femme</Link></li>
                            <li><Link href="/cat/bebe" className="hover:text-secondary transition-colors">Bébé & Jouets</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-lg font-bold mb-6">Restez informé</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Recevez nos offres exclusives et conseils business directement dans votre boîte mail.
                        </p>
                        <form className="space-y-3">
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="Votre email pro..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:border-secondary focus:outline-none focus:bg-white/10 transition-colors"
                                />
                            </div>
                            <button className="w-full bg-secondary hover:bg-secondary-dark text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                                S'abonner <Send size={16} />
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm">
                        © 2026 Tafa Business Inc. Tous droits réservés.
                    </p>
                    <div className="flex gap-6 text-xs text-gray-500 font-medium">
                        <Link href="/privacy" className="hover:text-white">Confidentialité</Link>
                        <Link href="/terms" className="hover:text-white">Conditions d'utilisation</Link>
                        <Link href="/cookies" className="hover:text-white">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
