'use client';

import React from 'react';
import { Truck, ShieldCheck, CreditCard, Headphones } from 'lucide-react';

const features = [
    {
        icon: <Truck size={32} className="text-secondary" />,
        title: "Livraison Rapide",
        desc: "Livraison partout au Sénégal en 24h à 48h."
    },
    {
        icon: <ShieldCheck size={32} className="text-secondary" />,
        title: "Paiement Sécurisé",
        desc: "Payez à la livraison ou via Wave/Orange Money."
    },
    {
        icon: <CreditCard size={32} className="text-secondary" />,
        title: "Meilleurs Prix",
        desc: "Des prix de gros négociés directement pour vous."
    },
    {
        icon: <Headphones size={32} className="text-secondary" />,
        title: "Support 24/7",
        desc: "Une équipe dédiée pour répondre à vos questions."
    }
];

const Features = () => {
    return (
        <section className="py-12 bg-bg-light border-b border-gray-100">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-4 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 feature-card">
                            <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
                                {feature.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-primary text-lg mb-1">{feature.title}</h3>
                                <p className="text-text-main text-sm leading-relaxed">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
