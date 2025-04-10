import { Rating } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import { MdClose } from "react-icons/md";

import "react-inner-image-zoom/lib/InnerImageZoom/styles.css";
import { useContext} from "react";
import QuantityBox from "../QuantityBox";
import { FaHeart } from "react-icons/fa";
import { MdOutlineCompareArrows } from "react-icons/md";
import { MyContext } from "../../App";
import ProductZoom from "../ProductZoom";
import { IoCartSharp } from "react-icons/io5";


const ProductModal = (props) => {
  

  const context = useContext(MyContext)


  

  

  

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
            <ProductZoom/>
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

              <Button className="btn-blue btn-lg btn-big btn-round ml-3"><IoCartSharp/>
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
