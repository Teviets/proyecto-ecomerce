import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './Home.css';

import image1 from '../../assets/images/1.png';
import image2 from '../../assets/images/2.png';
import image3 from '../../assets/images/3.png';

export default function Home() {
  return (
    <div className="swiper-container">
      <Swiper 
        spaceBetween={30}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true
        }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
        breakpoints={{
          // Cuando el ancho es >= 640px
          640: {
            spaceBetween: 40
          },
          // Cuando el ancho es >= 1024px
          1024: {
            spaceBetween: 50
          }
        }}
      >
        <SwiperSlide>
          <div className="image-container">
            <img src={image1} alt="Promoción 1" loading="lazy" />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="image-container">
            <img src={image2} alt="Promoción 2" loading="lazy" />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="image-container">
            <img src={image3} alt="Promoción 3" loading="lazy" />
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}