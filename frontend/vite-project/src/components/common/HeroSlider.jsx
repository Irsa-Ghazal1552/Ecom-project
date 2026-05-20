import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import banner1 from "../../assets/banner1.png";
import banner2 from "../../assets/bannerr2.png";
import heroImage from "../../assets/hero.png";

// Import styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const HeroSlider = () => {
  return (
    <div className="w-full h-[400px]">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{ delay: 3000 }}
        pagination={{ clickable: true }}
        navigation={true}
        className="h-full"
      >
        <SwiperSlide>
          <div className="relative h-full">
            <img src={banner1} className="w-full h-full object-cover" alt="banner 1" />
            <div className="absolute inset-0 bg-black/30 flex items-center px-10">
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-2">LUWIA FINE JEWELLERY</h1>
                <p className="text-lg">TIMELESS AND UNIQUE</p>
              </div>
            </div>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="relative h-full">
            <img src={banner2} className="w-full h-full object-cover" alt="banner 2" />
            <div className="absolute inset-0 bg-black/30 flex items-center px-10">
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-2">LIVE IN LUXURY</h1>
                <p className="text-lg">Curated for the modern celebration.</p>
              </div>
            </div>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="relative h-full">
            <img src={heroImage} className="w-full h-full object-cover" alt="hero" />
            <div className="absolute inset-0 bg-black/30 flex items-center px-10">
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-2">HIGH QUALITY ASSURANCE</h1>
                <p className="text-lg">Luxury craftsmanship in every piece.</p>
              </div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default HeroSlider;