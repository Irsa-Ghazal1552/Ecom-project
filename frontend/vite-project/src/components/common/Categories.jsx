import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Categories = () => {
  const navigate = useNavigate();
  
  const categories = [
    { name: "Rings", query: "Rings", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80", icon: "💍", count: 16 },
    { name: "Necklaces", query: "Necklaces", image: "https://images.unsplash.com/photo-1515562141294-8b6ce08b6b47?auto=format&fit=crop&w=900&q=80", icon: "📿", count: 14 },
    { name: "Earrings", query: "Earrings", image: "https://images.unsplash.com/photo-1629224316810-9d8805b95e76?auto=format&fit=crop&w=900&q=80", icon: "✨", count: 18 },
    { name: "Bracelets", query: "Bracelets", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80", icon: "🪢", count: 12 },
    { name: "Watches", query: "Watches", image: "https://images.unsplash.com/photo-1506629082632-f5ba29e2b430?auto=format&fit=crop&w=900&q=80", icon: "⌚", count: 10 },
    { name: "Bags", query: "Bags", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80", icon: "👜", count: 8 },
    { name: "Shoes", query: "Shoes", image: "https://images.unsplash.com/photo-1543163521-9145f931371e?auto=format&fit=crop&w=900&q=80", icon: "👠", count: 6 }
  ];

  const themes = [
    { name: "Wedding", query: "wedding", icon: "💒", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80" },
    { name: "Corporate", query: "corporate", icon: "💼", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80" },
    { name: "Daily Wear", query: "dailywear", icon: "🌿", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80" },
    { name: "Gifts", query: "gifts", icon: "🎁", image: "https://images.unsplash.com/photo-1517411032315-54ef2fbb3407?auto=format&fit=crop&w=900&q=80" },
    { name: "Gothic", query: "gothic", icon: "🖤", image: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=900&q=80" },
    { name: "Desi", query: "desi", icon: "🌺", image: "https://images.unsplash.com/photo-1515562141294-8b6ce08b6b47?auto=format&fit=crop&w=900&q=80" }
  ];

  const handleCategoryClick = (categoryName) => {
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <section className="py-16 px-4 md:px-12 bg-gradient-to-b from-slate-50 to-white">
      <div className="mb-12 text-center">
        <p className="text-sm uppercase tracking-widest text-emerald-700 font-semibold">🏆 Shop By Form</p>
        <h2 className="text-4xl md:text-5xl font-bold text-emerald-950 mt-2">Curation by Form</h2>
        <p className="text-slate-600 mt-3 max-w-2xl mx-auto">Discover our carefully curated collections organized by style and category</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
        {categories.map((category, i) => (
          <div
            key={i}
            onClick={() => handleCategoryClick(category.name)}
            className="group cursor-pointer rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-72 relative"
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundImage: `url('${category.image}')` }}
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent group-hover:via-black/50 transition-all duration-300" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
              <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl">{category.icon}</span>
                  <span className="text-xs bg-white/20 backdrop-blur px-2 py-1 rounded-full text-white">
                    {category.count} items
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold">{category.name}</h3>
                <p className="text-sm text-gray-200 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Explore {category.count} beautiful {category.name.toLowerCase()}
                </p>
              </div>
            </div>

            {/* View Button */}
            <div className="absolute top-4 right-4 bg-white text-emerald-900 px-3 py-1 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              View All →
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-widest text-amber-700 font-semibold">Curated Collections</p>
          <h2 className="text-4xl md:text-5xl font-bold text-emerald-950 mt-2">Seasonal & Styled Editions</h2>
          <p className="text-slate-600 mt-3 max-w-2xl mx-auto">Pick a mood collection for wedding, corporate, gifts, gothic and desi luxury capsules.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {themes.map((theme, i) => (
            <div
              key={i}
              onClick={() => navigate(`/products?theme=${encodeURIComponent(theme.query)}`)}
              className="group cursor-pointer rounded-3xl overflow-hidden shadow-2xl hover:shadow-emerald-700/30 transition-all duration-300 h-72 relative"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                style={{ backgroundImage: `url('${theme.image}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl">{theme.icon}</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold">{theme.name}</h3>
                  <p className="text-sm text-gray-200 mt-1 opacity-90">Refined selections for {theme.name.toLowerCase()} style.</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 text-center">
        <p className="text-slate-600 mb-4">Can't find what you're looking for?</p>
        <button
          onClick={() => navigate('/products')}
          className="inline-block px-8 py-3 bg-emerald-900 text-white rounded-full font-semibold hover:bg-emerald-800 transition-colors"
        >
          Browse All Products →
        </button>
      </div>
    </section>
  );
};

export default Categories;