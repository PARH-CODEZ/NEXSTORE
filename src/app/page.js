import Image from "next/image";
import Navbar from "./components/Navbar/Navbar";
import ImageScroller from "./components/ImageSlider/ImageSlider";
import CategoryNav from "./components/Categories/Categories";

export default function Home() {
  return (
    <>
      <div className="overflow-x-hidden">
        <Navbar />
        <CategoryNav/>
        <ImageScroller />
      </div>
    </>
  );
}
