import { createContext, useContext, useEffect, useMemo, useState } from "react";
import API from "../services/api";
import { useAuth } from "./AuthContext";

const ShopContext = createContext(null);

export const ShopProvider = ({ children }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);

  const loadProducts = async (search = "") => {
    const params = search ? { search } : {};
    const res = await API.get("/products", { params });
    setProducts(res.data);
  };

  const loadUserData = async () => {
    if (!user) {
      setCart([]);
      setWishlist([]);
      setOrders([]);
      return;
    }

    const [cartRes, wishlistRes, ordersRes] = await Promise.all([
      API.get("/cart"),
      API.get("/wishlist"),
      API.get("/orders/me")
    ]);

    setCart(cartRes.data);
    setWishlist(wishlistRes.data);
    setOrders(ordersRes.data);
  };

  const addToCart = async (productId, quantity = 1) => {
    const res = await API.post("/cart", { productId, quantity });
    setCart(res.data);
  };

  const updateCartQty = async (productId, quantity) => {
    const res = await API.put(`/cart/${productId}`, { quantity });
    setCart(res.data);
  };

  const removeCartItem = async (productId) => {
    const res = await API.delete(`/cart/${productId}`);
    setCart(res.data);
  };

  const addToWishlist = async (productId) => {
    const res = await API.post(`/wishlist/${productId}`);
    setWishlist(res.data);
  };

  const removeWishlist = async (productId) => {
    const res = await API.delete(`/wishlist/${productId}`);
    setWishlist(res.data);
  };

  const checkout = async (shippingAddress) => {
    const res = await API.post("/checkout", shippingAddress);
    await loadUserData();
    return res.data;
  };

  const applyCoupon = async (code) => {
    const res = await API.post("/coupons/apply", { code });
    return res.data;
  };

  const getCartReminder = async () => {
    const res = await API.get("/cart/reminder");
    return res.data;
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    loadUserData();
  }, [user]);

  const value = useMemo(
    () => ({
      products,
      cart,
      wishlist,
      orders,
      loadProducts,
      loadUserData,
      addToCart,
      updateCartQty,
      removeCartItem,
      addToWishlist,
      removeWishlist,
      checkout,
      applyCoupon,
      getCartReminder
    }),
    [products, cart, wishlist, orders]
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop must be used inside ShopProvider");
  return context;
};
