import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ProductImageSlider = ({ images }) => {
  const [index, setIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const prev = () => {
    setIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const next = () => {
    setIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="relative bg-white rounded-2xl p-6">

      {/* IMAGE */}
      <div className="h-[350px] flex items-center justify-center overflow-hidden">
        <img
          src={images[index]}
          alt="product"
          width="500"
          height="500"
          loading="eager"
          className="h-full object-contain transition-all duration-300"
        />
      </div>

      {/* ARROWS */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white shadow p-2 rounded-full"
          >
            <ChevronLeft />
          </button>

          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white shadow p-2 rounded-full"
          >
            <ChevronRight />
          </button>
        </>
      )}

      {/* DOTS */}
      <div className="flex justify-center gap-2 mt-4">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2 w-2 rounded-full transition ${i === index ? "bg-red-500" : "bg-gray-300"
              }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductImageSlider;
