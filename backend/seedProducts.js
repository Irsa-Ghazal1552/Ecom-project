const mongoose = require("mongoose");
const Product = require("./models/Product");

mongoose.connect("mongodb://localhost:27017/jewelleryDB")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => { console.error(err); process.exit(1); });

const products = [
  // --- BATCH 1: Original 4 Demo Items ---
  {
    name: "Simple Silver Band",
    category: "Rings",
    brand: "Essence",
    price: 45,
    rating: 4.2,
    soldCount: 150,
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80",
    description: "A minimalist sterling silver band — lightweight, elegant, and affordable.",
    seoTitle: "Simple Silver Band | Affordable Minimalist Ring",
    seoDescription: "Shop the Simple Silver Band by Essence. Affordable sterling silver ring perfect for everyday wear.",
    keywords: ["affordable silver ring", "minimalist jewelry"],
    seoSlug: "simple-silver-band",
    metaRobots: "index,follow"
  },
  {
    name: "18K Gold Diamond Solitaire",
    category: "Rings",
    brand: "Luxe",
    price: 1200,
    rating: 4.9,
    soldCount: 12,
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80",
    description: "A stunning 18K gold ring featuring a brilliant-cut diamond solitaire. The pinnacle of luxury.",
    seoTitle: "18K Gold Diamond Solitaire | Luxury Engagement Ring",
    seoDescription: "An exclusive 18K gold diamond solitaire ring by Luxe. Perfect for engagements and special occasions.",
    keywords: ["diamond engagement ring", "luxury gold ring"],
    seoSlug: "18k-gold-diamond-solitaire",
    metaRobots: "index,follow"
  },
  {
    name: "Crystal Drop Earrings",
    category: "Earrings",
    brand: "Essence",
    price: 85,
    rating: 4.5,
    soldCount: 300,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80",
    description: "Sparkling crystal drop earrings that catch the light at every angle — your ultimate party accessory.",
    seoTitle: "Crystal Drop Earrings | Party Wear Jewelry",
    seoDescription: "Shop Crystal Drop Earrings by Essence. Dazzling party wear crystal jewelry for every occasion.",
    keywords: ["party wear earrings", "crystal jewelry"],
    seoSlug: "crystal-drop-earrings",
    metaRobots: "index,follow"
  },
  {
    name: "Vintage Rose Gold Watch",
    category: "Watches",
    brand: "Timeless",
    price: 250,
    rating: 4.0,
    soldCount: 85,
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&q=80",
    description: "A vintage-inspired rose gold watch with a waterproof case and genuine leather strap.",
    seoTitle: "Vintage Rose Gold Watch | Timeless Style",
    seoDescription: "Discover the Vintage Rose Gold Watch by Timeless. A waterproof vintage-style rose gold timepiece.",
    keywords: ["rose gold watch", "vintage style", "waterproof watch"],
    seoSlug: "vintage-rose-gold-watch",
    metaRobots: "index,follow"
  },

  // --- BATCH 2: Additional 7 Demo Items ---
  {
    name: "Boho Moonstone Ring",
    category: "Rings",
    brand: "Mystic",
    price: 120,
    rating: 4.7,
    soldCount: 95,
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80",
    description: "A handcrafted bohemian ring featuring a glowing moonstone cabochon set in sterling silver.",
    seoTitle: "Boho Moonstone Ring | Handmade Gemstone Jewelry",
    seoDescription: "Handmade Boho Moonstone Ring by Mystic — a unique gemstone ring perfect for free spirits.",
    keywords: ["gemstone ring", "handmade jewelry", "moonstone"],
    seoSlug: "boho-moonstone-ring",
    metaRobots: "index,follow"
  },
  {
    name: "Titanium Men's Band",
    category: "Rings",
    brand: "Forge",
    price: 85,
    rating: 4.3,
    soldCount: 220,
    image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&q=80",
    description: "A bold black titanium men's wedding band — virtually scratch-proof and hypoallergenic.",
    seoTitle: "Titanium Men's Band | Durable Wedding Ring",
    seoDescription: "The Titanium Men's Band by Forge — durable black titanium wedding band for men who demand strength.",
    keywords: ["men's wedding band", "durable ring", "black titanium"],
    seoSlug: "titanium-mens-band",
    metaRobots: "index,follow"
  },
  {
    name: "Gold Hoop Classics",
    category: "Earrings",
    brand: "Luxe",
    price: 210,
    rating: 4.8,
    soldCount: 175,
    image: "https://images.unsplash.com/photo-1629224316810-9d8805b95e76?w=400&q=80",
    description: "Classic 14K gold hoop earrings — the everyday essential that goes with everything.",
    seoTitle: "Gold Hoop Classics | 14K Gold Everyday Earrings",
    seoDescription: "Shop Gold Hoop Classics by Luxe. Timeless 14K gold hoop earrings for everyday wear.",
    keywords: ["14k gold hoops", "everyday earrings"],
    seoSlug: "gold-hoop-classics",
    metaRobots: "index,follow"
  },
  {
    name: "Blue Sapphire Studs",
    category: "Earrings",
    brand: "Essence",
    price: 350,
    rating: 4.6,
    soldCount: 60,
    image: "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=400&q=80",
    description: "Elegant blue sapphire stud earrings set in white gold — a timeless gift for her.",
    seoTitle: "Blue Sapphire Studs | Gemstone Gift Earrings",
    seoDescription: "Blue Sapphire Studs by Essence — stunning sapphire jewelry and the perfect blue gemstone gift for her.",
    keywords: ["sapphire jewelry", "blue gemstone earrings", "gift for her"],
    seoSlug: "blue-sapphire-studs",
    metaRobots: "index,follow"
  },
  {
    name: "Chronograph Stealth Black",
    category: "Watches",
    brand: "Timeless",
    price: 450,
    rating: 4.9,
    soldCount: 500,
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80",
    description: "A high-performance chronograph with a matte black PVD case — waterproof to 200m.",
    seoTitle: "Chronograph Stealth Black | Sports Watch",
    seoDescription: "Chronograph Stealth Black by Timeless — waterproof sports chronograph with sleek black design.",
    keywords: ["sports watch", "waterproof chronograph", "black watch"],
    seoSlug: "chronograph-stealth-black",
    metaRobots: "index,follow"
  },
  {
    name: "Minimalist Leather Watch",
    category: "Watches",
    brand: "Timeless",
    price: 110,
    rating: 4.1,
    soldCount: 130,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
    description: "A clean, no-fuss leather-strap watch with a slim profile — the casual timepiece done right.",
    seoTitle: "Minimalist Leather Watch | Casual Brown Strap Watch",
    seoDescription: "Shop the Minimalist Leather Watch by Timeless — a slim casual timepiece with a genuine brown leather band.",
    keywords: ["brown leather watch", "casual timepiece"],
    seoSlug: "minimalist-leather-watch",
    metaRobots: "index,follow"
  }
];

async function seed() {
  try {
    const insertedNames = products.map(p => p.name);

    // Remove any existing products with the same names to avoid duplicates on re-run
    await Product.deleteMany({ name: { $in: insertedNames } });
    console.log(`Cleared ${insertedNames.length} existing placeholder entries (if any).`);

    const result = await Product.insertMany(products);
    console.log(`\n✅ Successfully inserted ${result.length} products:\n`);
    result.forEach(p => console.log(`  • [${p.category}] ${p.name} — $${p.price} (★${p.rating}, sold: ${p.soldCount})`));
  } catch (err) {
    console.error("Seed error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("\nMongoDB disconnected. Done.");
  }
}

seed();
