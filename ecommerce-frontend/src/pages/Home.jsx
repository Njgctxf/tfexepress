import { useState } from "react";
import MainLayout from "../layout/MainLayout";
import CategoryBar from "../components/CategoryBar";
import PopularBrands from "../components/PopularBrands";

import Hero from "../components/Hero";
import DiscountedGoods from "../components/DiscountedGoods";
import PromoSection from "../components/Promosection";

import BrandProducts from "../components/BrandProducts";

const Home = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeBrand, setActiveBrand] = useState(null);
  return (
    <MainLayout>
      <CategoryBar active={activeCategory} setActive={setActiveCategory} />
      <Hero category={activeCategory} />
      <PopularBrands activeBrand={activeBrand} setActiveBrand={setActiveBrand} />

      {/* Brand Products Section - Only shows when a brand is active */}
      {activeBrand && <BrandProducts brand={activeBrand} />}


      <PromoSection />
      <DiscountedGoods category={activeCategory} />
    </MainLayout>
  );
};


export default Home;
