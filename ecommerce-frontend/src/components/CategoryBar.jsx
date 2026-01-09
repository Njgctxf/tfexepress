import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Grid } from "lucide-react";
import { getCategories } from "../services/api";
import { categoryUI } from "../config/categoryUI";

const CategoryBar = ({ active, setActive }) => {
  const scrollRef = useRef(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const scroll = (direction) => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -220 : 220,
      behavior: "smooth",
    });
  };

  return (
    <section className="hidden md:block max-w-7xl mx-auto px-4 mt-6">
      <div className="relative">

        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10
          bg-white border rounded-full p-2 shadow"
        >
          <ChevronLeft size={20} />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-12"
        >
          {categories.map((cat) => {
            const ui = categoryUI[cat.slug];
            const Icon = ui?.icon || Grid;
            const isActive = active === cat.slug;

            return (
              <button
                key={cat._id}
                onClick={() => setActive(cat.slug)}
                className={`
                  flex items-center gap-3 px-6 py-3 rounded-full border
                  whitespace-nowrap transition
                  ${
                    isActive
                      ? "bg-red-500 text-white border-red-500 shadow"
                      : "bg-white text-gray-800 border-gray-200 hover:border-red-500"
                  }
                `}
              >
                <Icon size={20} />
                <span className="font-medium capitalize">{cat.name}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10
          bg-white border rounded-full p-2 shadow"
        >
          <ChevronRight size={20} />
        </button>

      </div>
    </section>
  );
};

export default CategoryBar;
