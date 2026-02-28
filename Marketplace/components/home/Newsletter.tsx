'use client';

import React from 'react';
import { Send, Mail } from 'lucide-react';

const Newsletter = () => {
    return (
        <section className="py-16 bg-[#131f35] text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 bg-white/5 p-8 md:p-12 rounded-2xl border border-white/10 backdrop-blur-sm">
                    {/* Text */}
                    <div className="md:w-1/2 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-secondary p-3 rounded-xl shadow-lg shadow-orange-500/20">
                                <Mail size={24} className="text-white" />
                            </div>
                            <span className="text-secondary font-bold uppercase tracking-wider text-sm">Newsletter</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
                            Restez informé des <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Dernières Offres</span>
                        </h2>
                        <p className="text-gray-300 text-lg">
                            Recevez nos coupons exclusifs et soyez les premiers informés des nouvelles collections.
                        </p>
                    </div>

                    {/* Form */}
                    <div className="md:w-1/2 w-full max-w-lg">
                        <form className="flex flex-col gap-4">
                            <div className="relative">
                                <input 
                                    type="email" 
                                    placeholder="Votre adresse email..." 
                                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                                />
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            </div>
                            <button className="w-full bg-secondary hover:bg-secondary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-600/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">
                                Je m'abonne gratuitement
                                <Send size={20} />
                            </button>
                            <p className="text-xs text-gray-500 text-center">
                                En vous abonnant, vous acceptez nos <a href="#" className="underline hover:text-white">conditions d'utilisation</a>.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Newsletter;
