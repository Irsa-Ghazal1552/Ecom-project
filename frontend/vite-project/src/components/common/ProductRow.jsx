import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import { useShop } from "../../store/ShopContext";

const ProductRow = ({ title }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { products, addToCart, addToWishlist } = useShop();
  const topItems = useMemo(() => {
    const allProducts = [...products];

    if (title === "Best Products") {
      return allProducts
        .sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.soldCount || 0) - (a.soldCount || 0))
        .slice(0, 8);
    }

    if (title === "Viral Products") {
      const bestIds = new Set(
        allProducts
          .sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.soldCount || 0) - (a.soldCount || 0))
          .slice(0, 8)
          .map((item) => item._id)
      );
      return allProducts
        .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0) || (b.rating || 0) - (a.rating || 0))
        .filter((item) => !bestIds.has(item._id))
        .slice(0, 8);
    }

    return allProducts.slice(0, 8);
  }, [products, title]);

  return (
    <div className="px-6 py-10 md:px-10">
      <h2 className="mb-6 text-3xl text-emerald-950">{title}</h2>

      <div className="flex gap-6 overflow-x-auto">
        {topItems.map((item) => (
          <div
            key={item._id}
            className="glass-card min-w-[240px] p-4"
          >
            {item.image ? (
              <img src={item.image} alt={item.name} className="mb-3 h-40 w-full rounded-lg object-cover" />
            ) : (
              <div className="mb-3 h-40 rounded-lg bg-emerald-50" />
            )}
            <h3 className="font-semibold text-emerald-950">{item.name}</h3>
            <p className="h-10 overflow-hidden text-sm text-emerald-900/80">{item.description}</p>
            <p className="mt-1 font-bold text-amber-800">${item.price}</p>
            <div className="mt-3 flex gap-2">
              <button
                className="gold-button"
                onClick={() => {
                  if (!user) return navigate("/login");
                  addToCart(item._id, 1);
                }}
              >
                Add to Cart
              </button>
              <button
                className="rounded-full border border-emerald-900 px-3 text-sm text-emerald-900"
                onClick={() => {
                  if (!user) return navigate("/login");
                  addToWishlist(item._id);
                }}
              >
                Wishlist
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductRow;