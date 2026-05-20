import { useState, useEffect } from "react";
import API from "../../services/api";
import { useShop } from "../../store/ShopContext";
import { useAuth } from "../../store/AuthContext";

const SeasonalRecommendations = () => {
  const { user } = useAuth();
  const { addToCart } = useShop();
  const [recommendations, setSeason] = useState(null);
  const [loading, setLoading] = useState(true);
  const [featuredLabel, setFeaturedLabel] = useState("");

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await API.get("/analytics/recommendations/seasonal");
        setFeaturedLabel(res.data.label || "");
        setSeason(res.data);
      } catch (error) {
        console.error("Failed to fetch seasonal recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) return <div className="text-center p-6">⏳ Loading seasonal suggestions...</div>;
  if (!recommendations) return <div className="text-center p-6">❌ Failed to load recommendations</div>;

  const seasonEmojis = {
    winter: "❄️",
    spring: "🌸",
    summer: "☀️",
    fall: "🍂"
    ,
    wedding: "💍",
    corporate: "💼",
    dailywear: "🌿",
    gifts: "🎁",
    gothic: "🖤",
    desi: "🌺"
  };

  const seasonalTips = {
    winter: "Perfect for holiday gifts and winter parties!",
    spring: "Fresh and elegant for spring occasions",
    summer: "Light and breezy designs for summer fun",
    fall: "Warm tones perfect for autumn events"
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-emerald-900 mb-2">
          {seasonEmojis[recommendations.season]} {featuredLabel || "Seasonal Picks"}
        </h1>
        <p className="text-slate-600 text-lg">{featuredLabel ? `Curated collection for ${featuredLabel}` : seasonalTips[recommendations.season]}</p>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.recommendations.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow h-full flex flex-col"
          >
            {/* Image */}
            <div className="w-full h-48 bg-gradient-to-br from-emerald-100 to-blue-100 flex items-center justify-center overflow-hidden">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-6xl text-emerald-300">💎</div>
              )}
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
              {/* Rating & Category */}
              <div className="flex justify-between items-start mb-2">
                <span className="inline-block bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                  {product.category}
                </span>
                <span className="text-yellow-500">⭐ {product.rating}/5</span>
              </div>

              {/* Product Name */}
              <h3 className="font-bold text-lg text-slate-900 mb-1 line-clamp-2">{product.name}</h3>

              {/* Description */}
              <p className="text-sm text-slate-600 mb-3 line-clamp-2">{product.description || "Premium jewelry piece"}</p>

              {/* Seasonal Score */}
              <div className="mb-3">
                <p className="text-xs text-slate-600 mb-1">Seasonal Popularity</p>
                <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2"
                    style={{ width: `${Math.min(100, (product.seasonalScore || 0) * 10)}%` }}
                  />
                </div>
                <p className="text-xs text-emerald-600 mt-1 font-semibold">
                  {product.seasonalScore || 0} sold this season
                </p>
              </div>

              {/* Price & Brand */}
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-500">Brand</p>
                  <p className="font-semibold text-slate-800">{product.brand}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">${product.price}</p>
                </div>
              </div>

              {/* Stock Status */}
              <div className="mb-4">
                {product.stock <= 0 ? (
                  <p className="text-sm text-red-600 font-semibold">❌ Out of Stock</p>
                ) : product.stock < 10 ? (
                  <p className="text-sm text-orange-600 font-semibold">⚠️ Only {product.stock} left!</p>
                ) : (
                  <p className="text-sm text-green-600 font-semibold">✅ {product.stock} available</p>
                )}
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={() => {
                  if (!user) {
                    alert("Please login to add items to cart");
                    return;
                  }
                  addToCart(product._id, 1);
                  alert(`${product.name} added to cart!`);
                }}
                disabled={product.stock <= 0}
                className={`w-full py-2 px-4 rounded-lg font-semibold transition ${
                  product.stock <= 0
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95"
                }`}
              >
                {product.stock <= 0 ? "Out of Stock" : "🛒 Add to Cart"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Tips Section */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-emerald-600">
        <h3 className="text-xl font-bold text-slate-900 mb-3">💡 Shopping Tips</h3>
        <ul className="space-y-2 text-slate-700">
          <li>✓ These items are predicted to sell best this {recommendations.season}</li>
          <li>✓ Limited stock items are marked with warnings</li>
          <li>✓ Browse seasonal categories for more options</li>
          <li>✓ Check our trending section for other hot items</li>
        </ul>
      </div>
    </div>
  );
};

export default SeasonalRecommendations;
