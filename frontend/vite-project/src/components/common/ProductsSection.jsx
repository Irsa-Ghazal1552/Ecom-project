const ProductsSection = () => {
  return (
    <section className="py-24 bg-gray-100">
      <h2 className="text-center text-4xl mb-16">The Selection</h2>
      <div className="grid md:grid-cols-3 gap-10 px-12">
        {[1, 2, 3].map((item) => (
          <div key={item} className="bg-white p-4 shadow">
            <div className="h-60 bg-gray-200 mb-4"></div>
            <h4 className="text-xl">Product Name</h4>
            <p className="text-gray-500">Description</p>
            <p className="font-bold mt-2">$100</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductsSection;