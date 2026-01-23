import React, { useEffect, useState, useRef } from "react";
import { getProducts } from "../services/api/products.api";
import ProductCard from "./ProductCard";
import { Loader, ChevronLeft, ChevronRight } from "lucide-react";

const BrandProducts = ({ brand }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(false);

    useEffect(() => {
        if (!brand) return;

        const fetchBrandProducts = async () => {
            setLoading(true);
            try {
                // Fetch products filtered by brand
                const res = await getProducts({ brand });
                if (res.success) {
                    setProducts(res.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchBrandProducts();
    }, [brand]);

    // Check scroll arrows visibility
    useEffect(() => {
        const checkScroll = () => {
            if (!scrollRef.current) return;
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setShowLeft(scrollLeft > 0);
            setShowRight(scrollLeft < scrollWidth - clientWidth - 5);
        };

        checkScroll();
        window.addEventListener("resize", checkScroll);

        const el = scrollRef.current;
        if (el) el.addEventListener("scroll", checkScroll);

        return () => {
            window.removeEventListener("resize", checkScroll);
            if (el) el.removeEventListener("scroll", checkScroll);
        };
    }, [products]);

    const scroll = (direction) => {
        if (!scrollRef.current) return;
        const scrollAmount = 300; // adjustable
        scrollRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    if (!brand) return null;

    if (loading) return (
        <div className="flex justify-center py-12">
            <Loader className="animate-spin text-gray-500" size={32} />
        </div>
    );

    if (products.length === 0) return null;

    return (
        <section className="max-w-7xl mx-auto px-4 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 mb-6">
                <h2 className="text-xl font-bold capitalize">Produits {brand}</h2>
                <span className="bg-black text-white text-xs px-2 py-1 rounded-full">{products.length}</span>
            </div>

            <div className="relative group">
                {/* Left Arrow */}
                {showLeft && (
                    <button
                        onClick={() => scroll("left")}
                        className="
                            absolute -left-4 top-1/2 -translate-y-1/2 z-20
                            w-10 h-10 bg-white rounded-full shadow-lg border border-gray-100
                            flex items-center justify-center
                            text-gray-700 hover:scale-110 active:scale-95 transition-all
                            hidden md:flex
                        "
                    >
                        <ChevronLeft size={20} />
                    </button>
                )}

                {/* Scrollable Container */}
                <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
                >
                    {products.map((product) => (
                        <div key={product.id} className="min-w-[200px] md:min-w-[240px] snap-start">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>

                {/* Right Arrow */}
                {showRight && (
                    <button
                        onClick={() => scroll("right")}
                        className="
                            absolute -right-4 top-1/2 -translate-y-1/2 z-20
                            w-10 h-10 bg-white rounded-full shadow-lg border border-gray-100
                            flex items-center justify-center
                            text-gray-700 hover:scale-110 active:scale-95 transition-all
                            hidden md:flex
                        "
                    >
                        <ChevronRight size={20} />
                    </button>
                )}
            </div>
        </section>
    );
};

export default BrandProducts;
