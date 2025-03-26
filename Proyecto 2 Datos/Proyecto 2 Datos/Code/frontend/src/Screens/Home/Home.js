import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules'; // Importa el módulo Autoplay
import 'swiper/css';
import 'swiper/css/autoplay'; // Estilos adicionales para Autoplay

import './Home.css';

import image1 from '../../assets/images/1.png';
import image2 from '../../assets/images/2.png';
import image3 from '../../assets/images/3.png';

export default function Home() {
  return (
    <div>
      <Swiper 
        spaceBetween={50} 
        slidesPerView={1}
        loop={true} // Permite que el carrusel sea infinito
        autoplay={{
          delay: 3000, // Cambia de slide cada 3 segundos (3000 ms)
          disableOnInteraction: false, // Continúa el autoplay después de interacción manual
          pauseOnMouseEnter: false // Pausa al pasar el mouse
        }}
        modules={[Autoplay]} // Registra el módulo Autoplay
      >
        <SwiperSlide>
          <div className="image-container">
            <img src={image1} alt="Image 1" />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="image-container">
            <img src={image2} alt="Image 2" />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="image-container">
            <img src={image3} alt="Image 3" />
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
