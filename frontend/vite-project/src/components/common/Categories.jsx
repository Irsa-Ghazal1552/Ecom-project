const Categories = () => {
  const data = ["Rings", "Necklaces", "Earrings", "Bracelets"];

  return (
    <section className="py-24 px-12">
      <h2 className="text-4xl mb-10">Curation by Form</h2>
      <div className="grid md:grid-cols-4 gap-6">
        {data.map((item, i) => (
          <div key={i} className="h-80 bg-gray-200 flex items-end p-6">
            <h3 className="text-xl">{item}</h3>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Categories;