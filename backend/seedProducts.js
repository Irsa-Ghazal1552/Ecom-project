const mongoose = require("mongoose");
const Product = require("./models/Product");

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/jewelleryDB").then(() => console.log("MongoDB Connected")).catch(err => { console.error(err); process.exit(1); });

const products = [
  // Rings
  { name: "Simple Silver Band", category: "Rings", brand: "Essence", price: 45, rating: 4.2, soldCount: 150, stock: 85, image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=80", description: "A minimalist sterling silver band.", seoTitle: "Simple Silver Band", seoDescription: "Affordable sterling silver ring.", keywords: ["silver ring"], seoSlug: "simple-silver-band", metaRobots: "index,follow", themes: ["dailywear"] },
  { name: "18K Gold Diamond Solitaire", category: "Rings", brand: "Luxe", price: 1200, rating: 4.9, soldCount: 12, stock: 8, image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&q=80", description: "18K gold ring with diamond.", seoTitle: "18K Gold Diamond Solitaire", seoDescription: "Luxury engagement ring.", keywords: ["diamond ring"], seoSlug: "18k-gold-diamond-solitaire", metaRobots: "index,follow", themes: ["wedding"] },
  { name: "Boho Moonstone Ring", category: "Rings", brand: "Mystic", price: 120, rating: 4.7, soldCount: 95, stock: 42, image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&q=80", description: "Handcrafted boho moonstone ring.", seoTitle: "Boho Moonstone Ring", seoDescription: "Handmade gemstone ring.", keywords: ["moonstone"], seoSlug: "boho-moonstone-ring", metaRobots: "index,follow", themes: ["dailywear","desi"] },
  { name: "Emerald Statement Ring", category: "Rings", brand: "Royal", price: 580, rating: 4.6, soldCount: 18, stock: 12, image: "https://images.unsplash.com/photo-1577720643272-265f434f3e2e?w=900&q=80", description: "Emerald statement ring.", seoTitle: "Emerald Statement Ring", seoDescription: "Emerald statement ring.", keywords: ["emerald"], seoSlug: "emerald-statement-ring", metaRobots: "index,follow", themes: ["wedding","gifts"] },

  // Necklaces
  { name: "Gold Pendant Necklace", category: "Necklaces", brand: "Essence", price: 120, rating: 4.5, soldCount: 180, stock: 72, image: "https://images.unsplash.com/photo-1515562141294-8b6ce08b6b47?w=900&q=80", description: "Gold pendant necklace.", seoTitle: "Gold Pendant Necklace", seoDescription: "Everyday gold pendant.", keywords: ["gold necklace"], seoSlug: "gold-pendant-necklace", metaRobots: "index,follow", themes: ["dailywear","corporate"] },
  { name: "Pearl Layered Necklace", category: "Necklaces", brand: "Elegance", price: 185, rating: 4.6, soldCount: 110, stock: 55, image: "https://images.unsplash.com/photo-1517411032315-54ef2fbb3407?w=900&q=80", description: "Pearl layered necklace.", seoTitle: "Pearl Layered Necklace", seoDescription: "Elegant pearl necklace.", keywords: ["pearl necklace"], seoSlug: "pearl-layered-necklace", metaRobots: "index,follow", themes: ["wedding","gifts"] },

  // Earrings
  { name: "Gold Hoop Classics", category: "Earrings", brand: "Luxe", price: 210, rating: 4.8, soldCount: 175, stock: 95, image: "https://images.unsplash.com/photo-1629224316810-9d8805b95e76?w=900&q=80", description: "14K gold hoop earrings.", seoTitle: "Gold Hoop Classics", seoDescription: "Timeless gold hoops.", keywords: ["hoops"], seoSlug: "gold-hoop-classics", metaRobots: "index,follow", themes: ["dailywear","gifts"] },
  { name: "Crystal Drop Earrings", category: "Earrings", brand: "Essence", price: 85, rating: 4.5, soldCount: 300, stock: 120, image: "https://images.unsplash.com/photo-1599643478521-d4c6e65aa6b6?w=900&q=80", description: "Crystal drop earrings.", seoTitle: "Crystal Drop Earrings", seoDescription: "Sparkling crystal drops.", keywords: ["crystal earrings"], seoSlug: "crystal-drop-earrings", metaRobots: "index,follow", themes: ["gifts","wedding"] },

  // Bracelets
  { name: "Gold Bangle Set", category: "Bracelets", brand: "Luxe", price: 185, rating: 4.6, soldCount: 140, stock: 56, image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&q=80", description: "Set of gold bangles.", seoTitle: "Gold Bangle Set", seoDescription: "Elegant gold bangles.", keywords: ["bangles"], seoSlug: "gold-bangle-set", metaRobots: "index,follow", themes: ["wedding","desi"] },

  // Watches
  { name: "Minimalist Black Watch", category: "Watches", brand: "Modern", price: 180, rating: 4.4, soldCount: 125, stock: 58, image: "https://images.unsplash.com/photo-1506629082632-f5ba29e2b430?w=900&q=80", description: "Minimalist black watch.", seoTitle: "Minimalist Black Watch", seoDescription: "Sleek black watch.", keywords: ["black watch"], seoSlug: "minimalist-black-watch", metaRobots: "index,follow", themes: ["corporate"] },

  // Bags
  { name: "Gold Evening Clutch", category: "Bags", brand: "Glamour", price: 135, rating: 4.6, soldCount: 72, stock: 32, image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&q=80", description: "Gold evening clutch.", seoTitle: "Gold Evening Clutch", seoDescription: "Elegant clutch.", keywords: ["clutch bag"], seoSlug: "gold-evening-clutch", metaRobots: "index,follow", themes: ["wedding","gifts"] },

  // Shoes
  { name: "Gold Heeled Sandals", category: "Shoes", brand: "Elegance", price: 145, rating: 4.5, soldCount: 52, stock: 25, image: "https://images.unsplash.com/photo-1543163521-9145f931371e?w=900&q=80", description: "Gold heeled sandals.", seoTitle: "Gold Heeled Sandals", seoDescription: "Elegant heeled sandals.", keywords: ["gold heels"], seoSlug: "gold-heeled-sandals", metaRobots: "index,follow", themes: ["wedding"] },
  { name: "Rose Gold Infinity Bracelet", category: "Bracelets", brand: "Aura", price: 98, rating: 4.7, soldCount: 210, stock: 74, image: "https://images.unsplash.com/photo-1549388604-817d15aa0110?w=900&q=80", description: "Elegant rose gold infinity bracelet.", seoTitle: "Rose Gold Infinity Bracelet", seoDescription: "Delicate bracelet with endless sparkle.", keywords: ["bracelet", "rose gold"], seoSlug: "rose-gold-infinity-bracelet", metaRobots: "index,follow", themes: ["dailywear","gifts"] },
  { name: "Sapphire Drop Earrings", category: "Earrings", brand: "Celeste", price: 235, rating: 4.8, soldCount: 95, stock: 38, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=80", description: "Sapphire drop earrings with a luxe finish.", seoTitle: "Sapphire Drop Earrings", seoDescription: "Sparkling sapphire earrings for special moments.", keywords: ["sapphire earrings"], seoSlug: "sapphire-drop-earrings", metaRobots: "index,follow", themes: ["wedding","gifts"] },
  { name: "Vintage Pearl Choker", category: "Necklaces", brand: "Heritage", price: 210, rating: 4.7, soldCount: 132, stock: 46, image: "https://images.unsplash.com/photo-1536305030018-733d5ca5f2a0?w=900&q=80", description: "Vintage pearl choker for elegant occasions.", seoTitle: "Vintage Pearl Choker", seoDescription: "Classic pearl necklace with heritage style.", keywords: ["pearl choker"], seoSlug: "vintage-pearl-choker", metaRobots: "index,follow", themes: ["wedding","formal"] },
  { name: "Black Leather Chronograph", category: "Watches", brand: "Titan", price: 225, rating: 4.5, soldCount: 88, stock: 60, image: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=900&q=80", description: "Black leather watch with chronograph detail.", seoTitle: "Black Leather Chronograph", seoDescription: "Bold and modern everyday watch.", keywords: ["leather watch"], seoSlug: "black-leather-chronograph", metaRobots: "index,follow", themes: ["corporate"] },
  { name: "Crystal Evening Purse", category: "Bags", brand: "Noir", price: 158, rating: 4.6, soldCount: 64, stock: 28, image: "https://images.unsplash.com/photo-1520975914256-72a7cdea8f3b?w=900&q=80", description: "Crystal-embellished evening purse.", seoTitle: "Crystal Evening Purse", seoDescription: "Luxurious clutch for evening events.", keywords: ["evening purse"], seoSlug: "crystal-evening-purse", metaRobots: "index,follow", themes: ["wedding","party"] },
  { name: "Emerald Statement Brooch", category: "Jewellery", brand: "Opulent", price: 170, rating: 4.7, soldCount: 54, stock: 21, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=900&q=80", description: "Emerald statement brooch with fine detailing.", seoTitle: "Emerald Statement Brooch", seoDescription: "Perfect for formal or bridal wear.", keywords: ["brooch"], seoSlug: "emerald-statement-brooch", metaRobots: "index,follow", themes: ["wedding","gifts"] },
  { name: "Silver Filigree Anklet", category: "Bracelets", brand: "Lattice", price: 75, rating: 4.4, soldCount: 90, stock: 50, image: "https://images.unsplash.com/photo-1490111718993-d98654ce6cf7?w=900&q=80", description: "Delicate silver anklet with filigree details.", seoTitle: "Silver Filigree Anklet", seoDescription: "Lightweight ankle jewellery for everyday wear.", keywords: ["anklet"], seoSlug: "silver-filigree-anklet", metaRobots: "index,follow", themes: ["dailywear"] },
  { name: "Luxe Bridal Tiara", category: "Headwear", brand: "Crown", price: 398, rating: 4.9, soldCount: 22, stock: 14, image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=900&q=80", description: "Sparkling bridal tiara with crystal details.", seoTitle: "Luxe Bridal Tiara", seoDescription: "Royal finishing touch for wedding looks.", keywords: ["tiara"], seoSlug: "luxe-bridal-tiara", metaRobots: "index,follow", themes: ["wedding"] }
];
// Clear existing products and insert seed set with themes
async function seed() {
  try {
    await Product.deleteMany({});
    console.log("Deleted existing products");
    const inserted = await Product.insertMany(products);
    console.log(`✅ Seeded ${inserted.length} products`);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  } finally {
    mongoose.disconnect();
  }
}

seed();

// Insert products
Product.deleteMany({})
  .then(() => {
    console.log("Deleted existing products");
    return Product.insertMany(products);
  })
  .then((inserted) => {
    console.log(`✅ Seeded ${inserted.length} products successfully`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
