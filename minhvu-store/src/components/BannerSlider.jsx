import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { FiArrowRight } from 'react-icons/fi';
import { getBanners, getImageUrl } from '../api';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

export default function BannerSlider() {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    getBanners(true)
      .then(res => setBanners(res.data))
      .catch(() => setBanners([]));
  }, []);

  if (banners.length === 0) {
    return (
      <div className="banner-placeholder">
        <h1>Chào mừng đến MinhVu Store</h1>
        <p>Khám phá hàng ngàn sản phẩm chất lượng với giá tốt nhất. Mua sắm dễ dàng, giao hàng nhanh chóng!</p>
        <Link to="/products" className="hero-btn">
          Mua sắm ngay <FiArrowRight />
        </Link>
      </div>
    );
  }

  return (
    <section className="banner-section">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop={banners.length > 1}
        speed={800}
      >
        {banners.map((banner) => {
          const imgUrl = getImageUrl(banner.imageUrl);
          return (
            <SwiperSlide key={banner.bannerId}>
              <Link to={banner.linkUrl || '/products'} className="banner-slide">
                {/* Blurred background to fill margins */}
                <img src={imgUrl} alt="" className="banner-slide-bg-blur" aria-hidden="true" />
                {/* Sharp main image in center */}
                <img src={imgUrl} alt={banner.title || 'Banner'} className="banner-main-img" />
                {/* Subtle caption badge */}
                {banner.title && (
                  <div className="banner-slide-caption">
                    <h3>{banner.title}</h3>
                  </div>
                )}
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}
