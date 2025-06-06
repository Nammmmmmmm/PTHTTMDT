import Rating from '@mui/material/Rating';
import { TfiFullscreen } from "react-icons/tfi";
import pro1 from "../../assets/images/pro1.jpg";
import Button from "@mui/material/Button";
import { IoMdHeartEmpty } from 'react-icons/io';
import { useContext, useState } from "react";
import { MyContext } from '../../App';


const ProductItem = (props) => {

  const context = useContext(MyContext)

  const viewProductDetails = (id) => {
    context.setIsOpenProductModal(true);
  }



  return (
    <>
      <div className={`productItem ${props.itemView}`}>
      <div className="imgWrapper">
        <img src={pro1} className="w-100" />

        <span className="badge badge-primary">10%</span>

        <div className='actions'>
          <Button onClick={()=>viewProductDetails(1)}><TfiFullscreen/></Button>
          <Button><IoMdHeartEmpty style={{fontSize:'20px'}}/></Button>
        </div>
      </div>

      <div className="info">
        <h4>Đồng hồ Diamond D DM55865S-B</h4>
        <span className="text-success d-block">In Stock</span>
        <Rating
          className="mt-2 mb-2"
          name="read-only"
          value={4}
          readOnly
          size="small"
          precision={0.5}
        />

        <div className="d-flex">
          <span className="oldPrice">$5000.00</span>
          <span className="netprice text-danger ml-3">$4500.00</span>
        </div>
      </div>
    </div> 


   
    {/* <ProductModal/> */}
    </>
  );
};

export default ProductItem;
