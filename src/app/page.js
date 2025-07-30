import Image from "next/image";
import Navbar from "./components/Navbar/Navbar";
import ImageScroller from "./components/ImageSlider/ImageSlider";
import CategoryNav from "./components/Categories/Categories";
import Footer from "./components/Footer/Footer";
import ProductCards from "./components/HomeProductCard/HomeProductCard";
import MobileHeroSlider from "./components/MobileHeroImage/MobileHeroImage";

export default function Home() {
  return (
    <>
      <div className="overflow-x-hidden bg-gray-300">
        <Navbar />
        <CategoryNav/>
        <MobileHeroSlider/>
        <ImageScroller />
        <ProductCards/>
        <Footer/>
      </div>
    </>
  );
}
