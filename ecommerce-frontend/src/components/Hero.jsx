import { useEffect, useState, useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getBanners } from "../services/api/banners.api";
import { getProducts } from "../services/api/products.api";
import { useLocalization } from "../context/LocalizationContext";

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
  const { t, currency } = useLocalization();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mobile products state
  const [mobileProducts, setMobileProducts] = useState([]);

  const [mainIndex, setMainIndex] = useState(0);
  const [topIndex, setTopIndex] = useState(0);
  const [bottomIndex, setBottomIndex] = useState(0);

  // Placeholder if image is missing
  const PLACEHOLDER_IMG = "https://placehold.co/400x400/png?text=No+Image";

  useEffect(() => {
    // Fetch banners for desktop
    getBanners()
      .then((data) => {
        setBanners(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    // Fetch products for mobile hero
    // Strategy "Recent" ensures the section is never empty if products exist
    const filters = { limit: 6, page: 1, sort: 'recent' };
    if (category && category !== "all") {
      // Simplistic matching for category if we had ID, but here we might just fetch random/all for diversity
      // or user might want actual filtering. 
      // For now, let's keep it simple as requested.
    }

    getProducts(filters).then((res) => {
      if (res.success) {
        setMobileProducts(res.data);
      }
    });

  }, [category]);

  // On récupère la langue actuelle (fr, en, etc.)
  const { language } = useLocalization();

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
      // On filtre par catégorie
      filtered = banners.filter(b => toSlug(b.category_key) === target || b.category_key === category);
    }

    // 1.5. Filtrer par LANGUE
    // On affiche les bannières de la langue actuelle OU celles marquées 'all'
    filtered = filtered.filter(b => b.language === language || b.language === 'all');

    if (filtered.length === 0) return { main: [], rightTop: [], rightBottom: [] };

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
  }, [banners, category, language]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (categorySlots.main.length > 1) setMainIndex((i) => (i + 1) % categorySlots.main.length);
      if (categorySlots.rightTop.length > 1) setTopIndex((i) => (i + 1) % categorySlots.rightTop.length);
      if (categorySlots.rightBottom.length > 1) setBottomIndex((i) => (i + 1) % categorySlots.rightBottom.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [categorySlots]);

  // Reset indices when category changes
  const [prevCategory, setPrevCategory] = useState(category);
  if (category !== prevCategory) {
    setMainIndex(0);
    setTopIndex(0);
    setBottomIndex(0);
    setPrevCategory(category);
  }

  const goToProduct = (id) => {
    if (!id) return;
    navigate(`/product/${id}`);
  };

  const handleImageError = (e) => {
    e.target.src = PLACEHOLDER_IMG;
  };

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 mt-4 md:mt-8 animate-pulse">
        {/* Mobile Skeleton */}
        <div className="md:hidden flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full bg-gray-200"></div>
              <div className="w-16 h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>

        {/* Desktop Skeleton */}
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          <div className="lg:col-span-2 rounded-3xl bg-gray-200 h-[300px] md:h-[380px]"></div>
          <div className="flex flex-col gap-4 md:gap-6">
            <div className="rounded-3xl bg-gray-200 h-[140px] flex-1"></div>
            <div className="rounded-3xl bg-gray-200 h-[140px] flex-1"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-4 md:mt-8 max-w-7xl mx-auto px-4">
      {/* ===== MOBILE HERO (GRID VIEW) ===== */}
      <div className="md:hidden mb-6">
        {/* Section Header */}
        <div className="flex items-center justify-between px-4 mb-3">
          <h3 className="font-extrabold text-lg flex items-center gap-2">
            ✨ {t('new_arrivals') || 'Nouveautés'}
          </h3>
          <button
            onClick={() => navigate('/shop?sort=rating')}
            className="text-xs font-bold text-gray-500 flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full"
          >
            Voir tout <ArrowRight size={12} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-y-4 gap-x-2 px-2">
          {mobileProducts.map((p) => (
            <div
              key={p.id}
              onClick={() => goToProduct(p.id)}
              className="flex flex-col items-center gap-1 cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center p-1 mb-1 shadow-sm">
                <img
                  src={p.images?.[0] || PLACEHOLDER_IMG}
                  alt={p.name}
                  onError={handleImageError}
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <div className="text-red-500 font-bold text-xs leading-none">
                {p.price} {currency}
              </div>
              <span className="text-[9px] text-gray-500 font-medium line-clamp-1 text-center w-full">
                {p.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== DESKTOP HERO (BANNERS) ===== */}
      {/* Only show if we have banners, otherwise hide desktop part too or show placeholder? 
          Existing logic hides if no banners. */}
      {(categorySlots.main.length > 0 || categorySlots.rightTop.length > 0 || categorySlots.rightBottom.length > 0) && (
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">

          {/* PRINCIPAL */}
          {categorySlots.main[mainIndex] ? (
            <div
              onClick={() => goToProduct(categorySlots.main[mainIndex].productId)}
              style={categorySlots.main[mainIndex].bgStyle}
              className={`cursor-pointer lg:col-span-2 rounded-3xl p-6 md:p-10 lg:p-12
          flex flex-col-reverse md:flex-row items-center gap-6 md:gap-8
          transition-all duration-700 hover:scale-[1.01] ${categorySlots.main[mainIndex].bgClass}`}
            >
              {/* TEXTE */}
              <div className="flex-1 text-white text-center md:text-left">
                <span className="text-xs md:text-sm font-semibold opacity-80 uppercase tracking-wide">
                  {categorySlots.main[mainIndex].badge}
                </span>

                <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold mt-2 md:mt-3 leading-tight line-clamp-2">
                  {categorySlots.main[mainIndex].title}
                </h1>

                <p className="mt-2 md:mt-3 opacity-90 text-sm md:text-base lg:text-lg line-clamp-2">
                  {categorySlots.main[mainIndex].desc}
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToProduct(categorySlots.main[mainIndex].productId);
                  }}
                  className="mt-4 md:mt-8 bg-black/80 hover:bg-black text-white px-6 py-2 md:px-8 md:py-3 rounded-full font-semibold text-sm md:text-base transition"
                >
                  {t('order_now') || 'Commander'}
                </button>

                {categorySlots.main.length > 1 && <Dots count={categorySlots.main.length} active={mainIndex} />}
              </div>

              {/* IMAGE */}
              <div className="flex-1 flex justify-center w-full">
                <img
                  src={categorySlots.main[mainIndex].image}
                  alt={categorySlots.main[mainIndex].title}
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

          {/* COLONNE DROITE */}
          <div className="flex flex-col gap-4 md:gap-6">
            {/* TOP */}
            {categorySlots.rightTop[topIndex] && (
              <div
                onClick={() => goToProduct(categorySlots.rightTop[topIndex].productId)}
                style={categorySlots.rightTop[topIndex].bgStyle}
                className={`cursor-pointer rounded-3xl p-4 md:p-7 flex flex-row items-center gap-4 transition-all duration-700 hover:scale-[1.02] ${categorySlots.rightTop[topIndex].bgClass}`}
              >
                <img
                  src={categorySlots.rightTop[topIndex].image}
                  alt={categorySlots.rightTop[topIndex].title}
                  width="112"
                  height="112"
                  loading="eager"
                  onError={handleImageError}
                  className="w-20 h-20 md:w-28 md:h-28 object-contain rounded-2xl bg-white p-2"
                />
                <div className="text-white flex-1 text-left">
                  <p className="text-[10px] md:text-xs opacity-80 uppercase tracking-wider">{categorySlots.rightTop[topIndex].badge}</p>
                  <h2 className="text-sm md:text-lg font-bold leading-tight line-clamp-2">{categorySlots.rightTop[topIndex].title}</h2>
                  <p className="text-xs md:text-sm opacity-90 mt-1">{categorySlots.rightTop[topIndex].status}</p>
                  {categorySlots.rightTop.length > 1 && (
                    <div className="mt-2">
                      <Dots count={categorySlots.rightTop.length} active={topIndex} />
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToProduct(categorySlots.rightTop[topIndex].productId);
                  }}
                  className="hidden sm:flex w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 hover:bg-white/30 items-center justify-center transition shrink-0"
                >
                  <ArrowRight className="text-white" size={18} />
                </button>
              </div>
            )}

            {/* BOTTOM */}
            {categorySlots.rightBottom[bottomIndex] && (
              <div
                onClick={() => goToProduct(categorySlots.rightBottom[bottomIndex].productId)}
                style={categorySlots.rightBottom[bottomIndex].bgStyle}
                className={`cursor-pointer rounded-3xl p-4 md:p-7 flex flex-row items-center gap-4 transition-all duration-700 hover:scale-[1.02] ${categorySlots.rightBottom[bottomIndex].bgClass}`}
              >
                <img
                  src={categorySlots.rightBottom[bottomIndex].image}
                  alt={categorySlots.rightBottom[bottomIndex].title}
                  width="112"
                  height="112"
                  loading="eager"
                  onError={handleImageError}
                  className="w-20 h-20 md:w-28 md:h-28 object-contain rounded-2xl bg-white p-2"
                />
                <div className="text-white flex-1 text-left">
                  <p className="text-[10px] md:text-xs opacity-80 uppercase tracking-wider">{categorySlots.rightBottom[bottomIndex].badge}</p>
                  <h2 className="text-sm md:text-lg font-bold leading-tight line-clamp-2">{categorySlots.rightBottom[bottomIndex].title}</h2>
                  <p className="text-xs md:text-sm opacity-90 mt-1">{categorySlots.rightBottom[bottomIndex].status}</p>
                  {categorySlots.rightBottom.length > 1 && (
                    <div className="mt-2">
                      <Dots count={categorySlots.rightBottom.length} active={bottomIndex} />
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToProduct(categorySlots.rightBottom[bottomIndex].productId);
                  }}
                  className="hidden sm:flex w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 hover:bg-white/30 items-center justify-center transition shrink-0"
                >
                  <ArrowRight className="text-white" size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
export default Hero;
