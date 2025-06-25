import Image from "next/image";
import Navbar from "./components/Navbar/Navbar";
import ImageScroller from "./components/ImageSlider/ImageSlider";

export default function Home() {
  return (
    <>
      <div className="overflow-x-hidden">
        <Navbar />
        <ImageScroller />
      </div>
    </>
  );
}
