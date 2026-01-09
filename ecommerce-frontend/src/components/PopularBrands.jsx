import { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import brands from "../data/brands";

const PopularBrands = ({ activeBrand, setActiveBrand }) => {
  const scrollRef = useRef(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      if (!scrollRef.current) return;
      scrollRef.current.scrollBy({ left: 1, behavior: "smooth" });
    }, 30);

    return () => clearInterval(interval);
  }, [paused]);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 mt-14">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">
        Marques populaires
      </h2>

      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2
          bg-white border rounded-full p-2 shadow"
        >
          <ChevronLeft size={20} />
        </button>

        <div
          ref={scrollRef}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="flex gap-5 overflow-x-auto scrollbar-hide"
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
                  rounded-2xl border
                  transition
                  ${
                    active
                      ? "border-red-500 ring-2 ring-red-200"
                      : "hover:border-red-400"
                  }
                `}
              >
                {active && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">
                    <Check size={12} />
                  </span>
                )}

                <img
                  src={brand.logo}
                  alt={brand.name}
                  className={`
                    h-8 object-contain transition
                    ${active ? "grayscale-0" : "grayscale"}
                  `}
                />
              </button>
            );
          })}
        </div>

        <button
          onClick={() => scroll("right")}
          className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2
          bg-white border rounded-full p-2 shadow"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
};

export default PopularBrands;
