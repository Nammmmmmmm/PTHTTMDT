import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Autoplay, Navigation } from "swiper/modules";

const HomeBanner = () => {

    return (
        <div className="container mt-3">
            <div className="homeBannerSection">

                <Swiper 
                    slidesPerView={1}
                    spaceBetween={15}
                    navigation={true}
                    loop={true}
                    autoplay={{
                        delay: 2500,
                        disableOnInteraction: false,
                    }}
                    modules={[Navigation, Autoplay]}
                    className="mySwiper">

                    <SwiperSlide>
                        <div className="item">
                            <img src="https://cf.shopee.vn/file/vn-11134258-7ras8-m5184szf0klz56_xxhdpi" alt="Banner" className="w-100"/>
                        </div>
                    </SwiperSlide>

                    <SwiperSlide>
                        <div className="item">
                        <img src="https://cf.shopee.vn/file/sg-11134258-7rd6r-m7srlqtv4app9d_xxhdpi" alt="Banner" className="w-100"/>
                        </div>
                    </SwiperSlide>

                    <SwiperSlide>
                        <div className="item">
                            <img src="https://cf.shopee.vn/file/sg-11134258-7rd6w-m7t3x2vxia4nd5_xxhdpi" alt="Banner" className="w-100"/>
                        </div>
                    </SwiperSlide>

                    <SwiperSlide>
                        <div className="item">
                            <img src="https://cf.shopee.vn/file/sg-11134258-7rd6m-m7t43htlkak831_xxhdpi" alt="Banner" className="w-100"/>
                        </div>
                    </SwiperSlide>

                </Swiper>
            
            </div>
        </div>
    );
}

export default HomeBanner;