import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { useState } from "react";

const HomeCat = () => {

    const [itemBg, setItemBg] = useState([
        '#fffceb', '#f6f8e8', '#e8f8f5', '#eaf4fc', '#fbeff2',
        '#f3e5f5', '#e1f5fe', '#f9fbe7', '#fce4ec', '#f3f4f6',
        '#e0f7fa', '#e8f5e9', '#ede7f6', '#f9fbe7', '#ffebee',
        '#fbe9e7', '#fef4e8', '#f1f8e9'
    ]);

    return (
        <section className="homeCat">
            <div className="container-fluid">
            <h3 className="mb-3 hd">Featured Categories</h3>
                <Swiper
                  slidesPerView={10}
                  spaceBetween={20}
                  navigation={true}
                  slidesPerGroup={1}
                  modules={[Navigation]}
                  className="mySwiper"
                >
                {
                    itemBg?.map((item, index) => {
                        return (
                            <SwiperSlide>
                                <div className="item text-center cursor" style={{background: item}}>
                                    <img src="https://themepanthers.com/wp/nest/d1/wp-content/uploads/2022/05/cat-9.png"/>

                                    <h6>Red Apple</h6>
                                </div>
                            </SwiperSlide>
                        )
                    })
                }
                
                </Swiper>
            </div>
        </section>
    );
}

export default HomeCat;