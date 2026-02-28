import TopBar from '../components/layout/TopBar';
import HeroSection from '../components/home/HeroSection';
import Features from '../components/home/Features';
import FlashDeals from '../components/home/FlashDeals';
import ProductGrid from '../components/home/ProductGrid';
import CategoryShowcase from '../components/home/CategoryShowcase';
import Newsletter from '../components/home/Newsletter';
import Footer from '../components/layout/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-bg-light">
      <TopBar />
      <HeroSection />

      {/* Features strip below sliders */}
      <Features />

      <FlashDeals />

      {/* Category Showcases */}
      <CategoryShowcase title="Univers Téléphonie & Tech" category="electronics" />
      <CategoryShowcase title="Mode & Tendances" category="fashion" />
      <CategoryShowcase title="Tout pour la Maison" category="home" />

      <ProductGrid title="Recommandé pour vous" />

      <Newsletter />

      <Footer />
    </main>
  );
}
