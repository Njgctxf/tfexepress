import { useState } from "react";
import MainLayout from "../layout/MainLayout";
import CategoryBar from "../components/CategoryBar";
import PopularBrands from "../components/PopularBrands";
import Categories from "../components/CategoryCard";
import Hero from "../components/Hero";
import DiscountedGoods from "../components/DiscountedGoods";
import PromoSection from "../components/Promosection";

const Home = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeBrand, setActiveBrand] = useState(null);
  return (
    <MainLayout>
      <CategoryBar active={activeCategory} setActive={setActiveCategory} />
      <Hero category={activeCategory} />
      <PopularBrands activeBrand={activeBrand} setActiveBrand={setActiveBrand} />
      <Categories />
      <PromoSection />
      <DiscountedGoods />
    </MainLayout>
  );
};


export default Home;
