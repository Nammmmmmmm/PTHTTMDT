import React from "react";
import Slider from "react-slick";

const HomeBanner = () => {

    var settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        autoplay: true
    };

    return (
        <div className="homeBannerSection">
            <Slider {...settings}>
                <div className="item">
                    <img src="https://cf.shopee.vn/file/vn-11134258-7ras8-m5184szf0klz56_xxhdpi" alt="Banner" className="w-100"/>
                </div>
                <div className="item">
                    <img src="https://cf.shopee.vn/file/sg-11134258-7rd6r-m7srlqtv4app9d_xxhdpi" alt="Banner" className="w-100"/>
                </div>
                <div className="item">
                    <img src="https://cf.shopee.vn/file/sg-11134258-7rd6w-m7t3x2vxia4nd5_xxhdpi" alt="Banner" className="w-100"/>
                </div>
                <div className="item">
                    <img src="https://cf.shopee.vn/file/sg-11134258-7rd6m-m7t43htlkak831_xxhdpi" alt="Banner" className="w-100"/>
                </div>
            </Slider>        
        </div>
    );
}

export default HomeBanner;