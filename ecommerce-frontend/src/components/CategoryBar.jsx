import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Grid } from "lucide-react";
import { getCategories } from "../services/api/categories.api";
import { iconMap } from "../config/iconRegistry";

const CategoryBar = ({ active, setActive }) => {
  const scrollRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  // Check scroll capability on content change or resize
  useEffect(() => {
    const checkScroll = () => {
      if (!scrollRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 0);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 5); // 5px tolerance
    };

    checkScroll();
    window.addEventListener("resize", checkScroll);

    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", checkScroll);

    return () => {
      window.removeEventListener("resize", checkScroll);
      if (el) el.removeEventListener("scroll", checkScroll);
    };
  }, [categories]);

  const scroll = (direction) => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -220 : 220,
      behavior: "smooth",
    });
  };

  return (
    <section className="hidden md:block max-w-7xl mx-auto px-4 mt-2 mb-8">
      <div className="relative group">

        {/* Navigation Buttons (visible only if needed + on hover) */}
        {showLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-20
            bg-white/80 backdrop-blur-md border border-gray-200 rounded-full p-3 shadow-lg 
            text-gray-600 hover:text-black hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-2 items-center"
        >
          <button
            onClick={() => setActive("all")}
            className={`
                flex flex-col items-center gap-2 min-w-[100px] p-3 rounded-2xl transition-all group/item
                hover:bg-gray-50
            `}
          >
            <div className={`
                w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-sm
                ${active === "all" ? "bg-black text-white shadow-md scale-105" : "bg-white border border-gray-100 text-gray-500 group-hover/item:border-black group-hover/item:text-black"}
            `}>
              <Grid size={24} />
            </div>
            <span className={`text-xs font-bold tracking-wide uppercase ${active === "all" ? "text-black" : "text-gray-500 group-hover/item:text-black"}`}>
              Tout voir
            </span>
          </button>

          {categories.map((cat) => {
            // New Logic: Use icon_key from DB, fallback to 'Grid'
            const Icon = iconMap[cat.icon_key] || iconMap.Grid;
            const isActive = active === cat.slug; // slug is now in DB

            return (
              <button
                key={cat.id}
                onClick={() => setActive(cat.slug)}
                className={`
                  flex flex-col items-center gap-2 min-w-[100px] p-3 rounded-2xl transition-all group/item
                  hover:bg-gray-50
                `}
              >
                <div className={`
                    w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-sm
                    ${isActive ? "bg-black text-white shadow-md scale-105" : "bg-white border border-gray-100 text-gray-500 group-hover/item:border-black group-hover/item:text-black"}
                `}>
                  <Icon size={24} />
                </div>
                <span className={`text-xs font-bold tracking-wide uppercase truncate max-w-[120px] ${isActive ? "text-black" : "text-gray-500 group-hover/item:text-black"}`}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>

        {showRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-20
            bg-white/80 backdrop-blur-md border border-gray-200 rounded-full p-3 shadow-lg 
            text-gray-600 hover:text-black hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight size={20} />
          </button>
        )}

      </div>
    </section>
  );
};

export default CategoryBar;
