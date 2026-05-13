import { useState } from "react";
import Header from "../components/layout/Header";
import Navbar from "../components/layout/Navbar";
import Hero from "../components/common/HeroSlider";
import ProductRow from "../components/common/ProductRow";
import Footer from "../components/layout/Footer";
import { Helmet } from "react-helmet-async";
import Categories from "../components/common/Categories";

const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Luwia Jewellery - Home</title>
        <meta name="description" content="Buy luxury jewellery online" />
        <meta name="keywords" content="jewellery, rings, necklaces" />
      </Helmet>

      <Navbar isOpen={menuOpen} toggleMenu={() => setMenuOpen(!menuOpen)} />
      <Header toggleMenu={() => setMenuOpen(!menuOpen)} />

      <Hero />

      <section className="mx-auto mt-8 max-w-6xl px-6">
        <div className="glass-card grid gap-6 p-6 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Craft Promise</p>
            <h3 className="mt-2 text-3xl text-emerald-950">Fine Jewellery, Curated for Everyday Luxury</h3>
          </div>
          <p className="text-sm text-emerald-900/80">
            Discover handcrafted designs, secure checkout in sandbox mode, and order tracking from your account.
          </p>
          <p className="text-sm text-emerald-900/80">
            From classic rings to statement necklaces, each product includes detailed tags and SEO-ready descriptions.
          </p>
        </div>
      </section>

      <ProductRow title="Best Products" />
      <Categories />
      <ProductRow title="Viral Products" />

      <Footer />
    </div>
  );
};

export default Home;