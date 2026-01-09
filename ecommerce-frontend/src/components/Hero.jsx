import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroSlots from "../data/heroSlots";

/* ---------- DOTS ---------- */
const Dots = ({ count, active }) => {
  return (
    <div className="flex gap-2 mt-4 justify-center md:justify-start">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`w-2.5 h-2.5 rounded-full transition-all ${
            i === active ? "bg-red-500 scale-125" : "bg-white/40"
          }`}
        />
      ))}
    </div>
  );
};

/* ---------- HERO ---------- */
const Hero = ({ category = "Téléphones" }) => {
  const navigate = useNavigate();
  const categorySlots = heroSlots[category] || heroSlots["Téléphones"];

  const [mainIndex, setMainIndex] = useState(0);
  const [topIndex, setTopIndex] = useState(0);
  const [bottomIndex, setBottomIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMainIndex((i) => (i + 1) % categorySlots.main.length);
      setTopIndex((i) => (i + 1) % categorySlots.rightTop.length);
      setBottomIndex((i) => (i + 1) % categorySlots.rightBottom.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [categorySlots]);

  const goToProduct = (id) => {
    if (!id) return;
    navigate(`/product/${id}`);
  };

  const main = categorySlots.main[mainIndex];
  const top = categorySlots.rightTop[topIndex];
  const bottom = categorySlots.rightBottom[bottomIndex];

  return (
    <section className="max-w-7xl mx-auto px-4 mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

        {/* ===== HERO PRINCIPAL ===== */}
        <div
          onClick={() => goToProduct(main.productId)}
          className={`cursor-pointer lg:col-span-2 rounded-3xl p-6 md:p-10 lg:p-12
          flex flex-col-reverse md:flex-row items-center gap-8
          transition-all duration-700 hover:scale-[1.01] ${main.bg}`}
        >
          {/* TEXTE */}
          <div className="flex-1 text-white text-center md:text-left">
            <span className="text-xs md:text-sm font-semibold opacity-80">
              {main.badge}
            </span>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mt-3">
              {main.title}
            </h1>

            <p className="mt-3 opacity-90 text-sm md:text-base lg:text-lg">
              {main.desc}
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                goToProduct(main.productId);
              }}
              className="mt-6 md:mt-8 bg-black/80 hover:bg-black text-white px-8 py-3 rounded-full font-semibold transition"
            >
              Commander Maintenant
            </button>

            <Dots count={categorySlots.main.length} active={mainIndex} />
          </div>

          {/* IMAGE */}
          <div className="flex-1 flex justify-center">
            <img
              src={main.image}
              alt={main.title}
              className="max-h-[220px] md:max-h-[320px] lg:max-h-[380px]
              object-contain drop-shadow-xl transition-all duration-700"
            />
          </div>
        </div>

        {/* ===== COLONNE DROITE ===== */}
        <div className="flex flex-col gap-6">

          {/* --- CARD TOP --- */}
          <div
            onClick={() => goToProduct(top.productId)}
            className={`cursor-pointer rounded-3xl p-5 md:p-7 flex flex-col sm:flex-row items-center gap-5 transition-all duration-700 hover:scale-[1.02] ${top.bg}`}
          >
            <img
              src={top.image}
              alt={top.title}
              className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-2xl"
            />

            <div className="text-white flex-1 text-center sm:text-left">
              <p className="text-xs opacity-80">{top.badge}</p>
              <h3 className="text-base md:text-lg font-bold">{top.title}</h3>
              <p className="text-sm opacity-90">{top.status}</p>

              <Dots
                count={categorySlots.rightTop.length}
                active={topIndex}
              />
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                goToProduct(top.productId);
              }}
              className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
            >
              <ArrowRight className="text-white" size={20} />
            </button>
          </div>

          {/* --- CARD BOTTOM --- */}
          <div
            onClick={() => goToProduct(bottom.productId)}
            className={`cursor-pointer rounded-3xl p-5 md:p-7 flex flex-col sm:flex-row items-center gap-5 transition-all duration-700 hover:scale-[1.02] ${bottom.bg}`}
          >
            <img
              src={bottom.image}
              alt={bottom.title}
              className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-2xl"
            />

            <div className="text-white flex-1 text-center sm:text-left">
              <p className="text-xs opacity-80">{bottom.badge}</p>
              <h3 className="text-base md:text-lg font-bold">{bottom.title}</h3>
              <p className="text-sm opacity-90">{bottom.status}</p>

              <Dots
                count={categorySlots.rightBottom.length}
                active={bottomIndex}
              />
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                goToProduct(bottom.productId);
              }}
              className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
            >
              <ArrowRight className="text-white" size={20} />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
  
};

export default Hero;
