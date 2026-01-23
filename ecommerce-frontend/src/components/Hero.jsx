import { useEffect, useState, useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getBanners } from "../services/api/banners.api";

/* ---------- DOTS ---------- */
const Dots = ({ count, active }) => {
  return (
    <div className="flex gap-2 mt-4 justify-center md:justify-start">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`w-2.5 h-2.5 rounded-full transition-all ${i === active ? "bg-red-500 scale-125" : "bg-white/40"
            }`}
        />
      ))}
    </div>
  );
};

/* ---------- HERO ---------- */
const Hero = ({ category = "all" }) => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  const [mainIndex, setMainIndex] = useState(0);
  const [topIndex, setTopIndex] = useState(0);
  const [bottomIndex, setBottomIndex] = useState(0);

  // Placeholder if image is missing
  const PLACEHOLDER_IMG = "https://placehold.co/400x400/png?text=No+Image";

  useEffect(() => {
    getBanners()
      .then((data) => {
        setBanners(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Filter and organize banners for the Hero slots
  const categorySlots = useMemo(() => {
    // 1. Filter by category
    let filtered = banners;
    if (category && category !== "all") {
      // Normalize function to match slugs (handle spaces, accents, special chars)
      const toSlug = (str) => {
        if (!str) return "";
        return str
          .toString()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") // remove accents
          .replace(/[^a-z0-9\s-]/g, "")    // remove special chars like &
          .trim()
          .replace(/\s+/g, '-')            // replace spaces with -
          .replace(/-+/g, '-');            // remove duplicate dashes
      };

      const target = toSlug(category);
      // We check if the slugified banner key matches, OR if exact match (legacy)
      const matched = banners.filter(b => toSlug(b.category_key) === target || b.category_key === category);
      if (matched.length > 0) filtered = matched;
      // else fallback to all active banners or generic ones if we had them
    }

    // Helper to format/validate
    const formatBanner = (b) => {
      const isHex = b.bg_color && b.bg_color.startsWith('#');
      return {
        ...b,
        image: b.image_url || PLACEHOLDER_IMG, // Map image_url to image for UI
        bgClass: isHex ? "" : (b.bg_color || "bg-gray-800"),
        bgStyle: isHex ? { backgroundColor: b.bg_color } : {},
        productId: b.product_id,
        badge: b.badge || "",
        title: b.title || "Titre",
        desc: b.description || "",
        status: b.description || "Disponible"
      };
    };

    // 2. Special Case: Single Banner (Duplicate across all slots as requested)
    if (filtered.length === 1) {
      const single = formatBanner(filtered[0]);
      return {
        main: [single],
        rightTop: [single],
        rightBottom: [single]
      };
    }

    // 3. Group by slot (Normal behavior)
    const main = filtered.filter(b => b.slot === 'main');
    const rightTop = filtered.filter(b => b.slot === 'rightTop');
    const rightBottom = filtered.filter(b => b.slot === 'rightBottom');

    // No fallbacks - we want to return empty if empty
    // LIMIT to 5 items max to avoid overload
    const LIMIT = 5;
    const safeMain = main.slice(0, LIMIT).map(formatBanner);
    const safeTop = rightTop.slice(0, LIMIT).map(formatBanner);
    const safeBottom = rightBottom.slice(0, LIMIT).map(formatBanner);

    return { main: safeMain, rightTop: safeTop, rightBottom: safeBottom };
  }, [banners, category]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (categorySlots.main.length > 1) setMainIndex((i) => (i + 1) % categorySlots.main.length);
      if (categorySlots.rightTop.length > 1) setTopIndex((i) => (i + 1) % categorySlots.rightTop.length);
      if (categorySlots.rightBottom.length > 1) setBottomIndex((i) => (i + 1) % categorySlots.rightBottom.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [categorySlots]);

  // Reset indices when category changes
  useEffect(() => {
    setMainIndex(0);
    setTopIndex(0);
    setBottomIndex(0);
  }, [category]);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 mt-4 md:mt-8 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {/* Main Skeleton */}
          <div className="lg:col-span-2 rounded-3xl bg-gray-200 h-[300px] md:h-[380px]"></div>

          {/* Side Skeletons */}
          <div className="flex flex-col gap-4 md:gap-6">
            <div className="rounded-3xl bg-gray-200 h-[140px] flex-1"></div>
            <div className="rounded-3xl bg-gray-200 h-[140px] flex-1"></div>
          </div>
        </div>
      </section>
    );
  }

  // If no banners at all in this category or default slots, hide section
  if (categorySlots.main.length === 0 && categorySlots.rightTop.length === 0 && categorySlots.rightBottom.length === 0) {
    return null;
  }

  const main = categorySlots.main[mainIndex] || categorySlots.main[0];
  const top = categorySlots.rightTop[topIndex] || categorySlots.rightTop[0];
  const bottom = categorySlots.rightBottom[bottomIndex] || categorySlots.rightBottom[0];

  const goToProduct = (id) => {
    if (!id) return;
    navigate(`/product/${id}`);
  };

  const handleImageError = (e) => {
    e.target.src = PLACEHOLDER_IMG;
  };

  return (
    <section className="max-w-7xl mx-auto px-4 mt-4 md:mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">

        {/* ===== HERO PRINCIPAL ===== */}
        {main ? (
          <div
            onClick={() => goToProduct(main.productId)}
            style={main.bgStyle}
            className={`cursor-pointer lg:col-span-2 rounded-3xl p-6 md:p-10 lg:p-12
          flex flex-col-reverse md:flex-row items-center gap-6 md:gap-8
          transition-all duration-700 hover:scale-[1.01] ${main.bgClass}`}
          >
            {/* TEXTE */}
            <div className="flex-1 text-white text-center md:text-left">
              <span className="text-xs md:text-sm font-semibold opacity-80 uppercase tracking-wide">
                {main.badge}
              </span>

              <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold mt-2 md:mt-3 leading-tight line-clamp-2">
                {main.title}
              </h1>

              <p className="mt-2 md:mt-3 opacity-90 text-sm md:text-base lg:text-lg line-clamp-2">
                {main.desc}
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToProduct(main.productId);
                }}
                className="mt-4 md:mt-8 bg-black/80 hover:bg-black text-white px-6 py-2 md:px-8 md:py-3 rounded-full font-semibold text-sm md:text-base transition"
              >
                Commander
              </button>

              {categorySlots.main.length > 1 && <Dots count={categorySlots.main.length} active={mainIndex} />}
            </div>

            {/* IMAGE */}
            <div className="flex-1 flex justify-center w-full">
              <img
                src={main.image}
                alt={main.title}
                width="400"
                height="400"
                loading="eager"
                onError={handleImageError}
                className="max-h-40 md:max-h-[320px] lg:max-h-[380px] w-auto bg-white rounded-2xl p-2
              object-contain drop-shadow-xl transition-all duration-700 hover:scale-105"
              />
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2" />
        )}

        {/* ===== COLONNE DROITE ===== */}
        <div className="flex flex-col gap-4 md:gap-6">

          {/* --- CARD TOP --- */}
          {top && (
            <div
              onClick={() => goToProduct(top.productId)}
              style={top.bgStyle}
              className={`cursor-pointer rounded-3xl p-4 md:p-7 flex flex-row items-center gap-4 transition-all duration-700 hover:scale-[1.02] ${top.bgClass}`}
            >
              <img
                src={top.image}
                alt={top.title}
                width="112"
                height="112"
                loading="eager"
                onError={handleImageError}
                className="w-20 h-20 md:w-28 md:h-28 object-contain rounded-2xl bg-white p-2"
              />

              <div className="text-white flex-1 text-left">
                <p className="text-[10px] md:text-xs opacity-80 uppercase tracking-wider">{top.badge}</p>
                <h2 className="text-sm md:text-lg font-bold leading-tight line-clamp-2">{top.title}</h2>
                <p className="text-xs md:text-sm opacity-90 mt-1">{top.status}</p>

                {categorySlots.rightTop.length > 1 && (
                  <div className="mt-2">
                    <Dots
                      count={categorySlots.rightTop.length}
                      active={topIndex}
                    />
                  </div>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToProduct(top.productId);
                }}
                className="hidden sm:flex w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 hover:bg-white/30 items-center justify-center transition shrink-0"
              >
                <ArrowRight className="text-white" size={18} />
              </button>
            </div>
          )}

          {/* --- CARD BOTTOM --- */}
          {bottom && (
            <div
              onClick={() => goToProduct(bottom.productId)}
              style={bottom.bgStyle}
              className={`cursor-pointer rounded-3xl p-4 md:p-7 flex flex-row items-center gap-4 transition-all duration-700 hover:scale-[1.02] ${bottom.bgClass}`}
            >
              <img
                src={bottom.image}
                alt={bottom.title}
                width="112"
                height="112"
                loading="eager"
                onError={handleImageError}
                className="w-20 h-20 md:w-28 md:h-28 object-contain rounded-2xl bg-white p-2"
              />

              <div className="text-white flex-1 text-left">
                <p className="text-[10px] md:text-xs opacity-80 uppercase tracking-wider">{bottom.badge}</p>
                <h2 className="text-sm md:text-lg font-bold leading-tight line-clamp-2">{bottom.title}</h2>
                <p className="text-xs md:text-sm opacity-90 mt-1">{bottom.status}</p>

                {categorySlots.rightBottom.length > 1 && (
                  <div className="mt-2">
                    <Dots
                      count={categorySlots.rightBottom.length}
                      active={bottomIndex}
                    />
                  </div>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToProduct(bottom.productId);
                }}
                className="hidden sm:flex w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 hover:bg-white/30 items-center justify-center transition shrink-0"
              >
                <ArrowRight className="text-white" size={18} />
              </button>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};
export default Hero;
