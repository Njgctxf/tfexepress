import { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { getBrands } from "../services/api/brands.api";

const PopularBrands = ({ activeBrand, setActiveBrand }) => {
  const scrollRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Brands from Supabase
  useEffect(() => {
    async function fetchBrands() {
      try {
        const data = await getBrands();
        setBrands(data);
      } catch (error) {
        console.error("Failed to load brands:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBrands();
  }, []);

  // Auto-scroll logic
  useEffect(() => {
    if (paused || loading || brands.length === 0) return;

    const interval = setInterval(() => {
      if (!scrollRef.current) return;
      scrollRef.current.scrollBy({ left: 1, behavior: "smooth" });
    }, 30);

    return () => clearInterval(interval);
  }, [paused, loading, brands]);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  if (loading) return null; // Or a skeleton
  if (brands.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 mt-8 md:mt-14">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">
        Marques populaires
      </h2>

      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2
          bg-white border rounded-full p-2 shadow z-10 hover:bg-gray-50"
        >
          <ChevronLeft size={20} />
        </button>

        <div
          ref={scrollRef}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="flex gap-5 overflow-x-auto scrollbar-hide py-2 px-1"
          style={{ touchAction: "pan-x" }}
        >
          {brands.map((brand) => {
            const active = activeBrand === brand.slug;

            return (
              <button
                key={brand.slug}
                onClick={() =>
                  setActiveBrand(active ? null : brand.slug)
                }
                className={`
                  relative min-w-[130px] h-[90px]
                  flex items-center justify-center
                  rounded-2xl border bg-white
                  transition-all duration-300
                  ${active
                    ? "border-red-500 ring-4 ring-red-50 shadow-lg scale-105 z-10"
                    : "border-gray-100 hover:border-red-200 hover:shadow-md"
                  }
                `}
              >
                {active && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm">
                    <Check size={12} />
                  </span>
                )}

                <div className="w-full h-full flex items-center justify-center p-4">
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      width="120"
                      height="48"
                      loading="lazy"
                      className={`
                        max-h-12 w-auto object-contain transition-all duration-300
                        ${active ? "grayscale-0 scale-110" : "grayscale opacity-60 hover:opacity-100 hover:grayscale-0"}
                      `}
                      onError={(e) => {
                        // Fallback to text if image fails
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement.innerHTML = `<span class="text-sm font-black text-gray-900 uppercase tracking-widest">${brand.name}</span>`;
                      }}
                    />
                  ) : (
                    <span className="text-sm font-black text-gray-900 uppercase tracking-widest">{brand.name}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => scroll("right")}
          className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2
          bg-white border rounded-full p-2 shadow z-10 hover:bg-gray-50"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
};

export default PopularBrands;
