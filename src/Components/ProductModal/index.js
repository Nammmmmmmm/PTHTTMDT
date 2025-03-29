import { Fade, Rating, Slide } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import { MdClose } from "react-icons/md";
import Slider from "react-slick";
import InnerImageZoom from "react-inner-image-zoom";
import "react-inner-image-zoom/lib/InnerImageZoom/styles.css";
import { use, useContext, useRef } from "react";
import { FaMinusCircle, FaPlusCircle } from "react-icons/fa";
import QuantityBox from "../QuantityBox";
import { FaHeart } from "react-icons/fa";
import { MdOutlineCompareArrows } from "react-icons/md";
import { MyContext } from "../../App";



const ProductModal = (props) => {
  const zoomSliderBig = useRef();
  const zoomSlider = useRef();

  const context = useContext(MyContext)


  var settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    // autoplay: true,
    // autoplaySpeed: 2000,
    // cssEase: "linear",
    fade: false,
    arrows: true,
  };

  var settings2 = {
    dots: false,
    infinite: false,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    // autoplay: true,
    // autoplaySpeed: 2000,
    // cssEase: "linear",
    fade: false,
    arrows: false,
  };

  const goto = (index) => {
    zoomSliderBig.current.slickGoTo(index);
    zoomSlider.current.slickGoTo(index);
  };

  return (
    <>
      <Dialog
        open={true}
        className="productModal"
        onClose={() => context.setIsOpenProductModal(false)}
      >
        <Button className="close_" onClick={() => context.setIsOpenProductModal(false)}>
          <MdClose />
        </Button>
        <h4 className="mb-0">All Natural Intajnsjnfja</h4>
        <div className="d-flex align-items-center">
          <div className="d-flex align-items-center mr-4">
            <span> Brands:</span>
            <span className="ml-2">
              <b>Phuong Nam</b>
            </span>
          </div>

          <Rating
            name="read-only"
            value={4}
            size="small"
            precision={0.5}
            readOnly
          />
        </div>

        <hr />

        <div className="row mt-2 productDetaileModal">
          <div className="col-md-5">
            <div className="productZoom position-relative">
                <div className="badge badge-primary">23%</div>
              <Slider
                {...settings2}
                className="zoomSliderBig"
                ref={zoomSliderBig}
              >
                <div className="item">
                  <InnerImageZoom
                    zoomType="hover"
                    zoomScale={1}
                    src="https://api.spicezgold.com/download/file_1734690981297_011618e4-4682-4123-be80-1fb7737d34ad1714702040213RARERABBITMenComfortOpaqueCasualShirt1.jpg"
                  />
                </div>

                <div className="item">
                  <InnerImageZoom
                    zoomType="hover"
                    zoomScale={1}
                    src="https://api.spicezgold.com/download/file_1734690981297_23990e6b-d01e-40fd-bb6b-98198db544c01714702040162RARERABBITMenComfortOpaqueCasualShirt2.jpg"
                  />
                </div>

                <div className="item">
                  <InnerImageZoom
                    zoomType="hover"
                    zoomScale={1}
                    src="https://api.spicezgold.com/download/file_1734690981299_c56f7a00-e9c5-43dc-8288-190cfc0fef3e1714702040062RARERABBITMenComfortOpaqueCasualShirt3.jpg"
                  />
                </div>
              </Slider>
            </div>

            <Slider {...settings} className="zoomSlider" ref={zoomSlider}>
              <div className="item">
                <img
                  src="https://api.spicezgold.com/download/file_1734690981297_011618e4-4682-4123-be80-1fb7737d34ad1714702040213RARERABBITMenComfortOpaqueCasualShirt1.jpg"
                  className="w-100"
                  onClick={() => goto(0)}
                />
              </div>
              <div className="item">
                <img
                  src="https://api.spicezgold.com/download/file_1734690981297_23990e6b-d01e-40fd-bb6b-98198db544c01714702040162RARERABBITMenComfortOpaqueCasualShirt2.jpg"
                  className="w-100"
                  onClick={() => goto(1)}
                />
              </div>
              <div className="item">
                <img
                  src="https://api.spicezgold.com/download/file_1734690981299_c56f7a00-e9c5-43dc-8288-190cfc0fef3e1714702040062RARERABBITMenComfortOpaqueCasualShirt3.jpg"
                  className="w-100"
                  onClick={() => goto(2)}
                />
              </div>
            </Slider>
          </div>
          <div className="col-md-7">
            <div className="d-flex info align-items-center mb-3">
              <span className="oldPrice lg mr-2">$2500.00</span>
              <span className="netprice text-danger lg">$1500.00</span>
            </div>

            <span className="badge badge-success">IN STOCK</span>

            <p className="mt-3">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam
              voluptatibus, quod, voluptates quibusdam, voluptatibus
              voluptatibus. Quisquam voluptatibus, quod, voluptates quibusdam,
              voluptatibus voluptatibus.
            </p>

            <div className="d-flex align-items-center">
              <QuantityBox />

              <Button className="btn-blue btn-lg btn-big btn-round ml-3">
                Add to Cart
              </Button>
            </div>

            <div className="d-flex align-items-center mt-5 actions">
                <Button className="btn-round btn-sml" variant="outlined"><FaHeart/> &nbsp; ADD TO WISHLIST</Button>
                <Button className="btn-round btn-sml ml-3" variant="outlined"><MdOutlineCompareArrows/> &nbsp; COMPARE</Button>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};
export default ProductModal;
