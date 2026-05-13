const Footer = () => {
  return (
    <footer className="mt-12 bg-[#0d3b2f] text-[#f9f5e9]">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 md:grid-cols-3">
        <div>
          <h2 className="font-serif text-2xl tracking-wide">Luwia Fine Jewellery</h2>
          <p className="mt-3 text-sm text-amber-100/80">
            Timeless pieces crafted for modern statements.
          </p>
        </div>
        <div>
          <h3 className="text-sm uppercase tracking-[0.2em] text-amber-200">Support</h3>
          <p className="mt-3 text-sm">Shipping, returns and tracking available in sandbox workflow.</p>
        </div>
        <div>
          <h3 className="text-sm uppercase tracking-[0.2em] text-amber-200">Contact</h3>
          <p className="mt-3 text-sm">support@luwia.example</p>
        </div>
      </div>
      <p className="border-t border-emerald-800 py-4 text-center text-xs text-amber-100/70">
        © 2026 Luwia. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;