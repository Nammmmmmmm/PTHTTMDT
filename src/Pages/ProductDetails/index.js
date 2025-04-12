import ProductZoom from "../../Components/ProductZoom";
import Rating from "@mui/material/Rating";
import QuantityBox from "../../Components/QuantityBox";
import Button from "@mui/material/Button";
import { BsCartFill } from "react-icons/bs";
import { useState } from "react";
import { FaRegHeart } from "react-icons/fa";
import { MdCompareArrows } from "react-icons/md";
import Tooltip from "@mui/material/Tooltip";
import RelatedProducts from "./RelatedProducts";

const ProductDetails = () => {
  const [activeSize, setActiveSize] = useState(null);
  const [activeTab, setActiveTab] = useState("description");

  const isActive = (index) => {
    setActiveSize(index);
  };

  return (
    <>
      <section className="productDetails section">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-4 pl-5">
              <ProductZoom />
            </div>

            <div className="col-md-7 pl-5 pr-5">
              <h2 className="hd text-capitalize">
                All Natural Italian-Style Chicken Meatballs
              </h2>
              <ul className="list list-inline d-flex align-items-center">
                <li className="list-inline-item">
                  <div className="d-flex align-items-center">
                    <span className="text-light mr-2">Brands : </span>
                    <span className="">Wel'ch</span>
                  </div>
                </li>

                <li className="list-inline-item">
                  <div className="d-flex align-items-center">
                    <Rating
                      name="read-only"
                      value={4.5}
                      precision={0.5}
                      readOnly
                      size="small"
                    />

                    <span className="text-light cursor ml-2">1 Review</span>
                  </div>
                </li>
              </ul>

              <div className="d-flex info mb-34">
                <span className="oldPrice">$20.00</span>
                <span className="netPrice text-danger">$14.99</span>
              </div>

              <span className="badge badge-success">In Stock</span>

              <p className="mt-3">
                Lorem4 ipsum dolor sit amet consectetur adipisicing elit.
                Quisquam voluptatibus, cumque, voluptates, quisquam voluptatibus
                voluptatibus, cumque, voluptates, quisquam voluptatibus, cumque,
                voluptates, quisquam voluptatibus, cumque, voluptates, quisquam
                voluptatibus, cumque, voluptates. Lorem4 ipsum dolor sit amet
                consectetur adipisicing elit. Quisquam voluptatibus, cumque,
                voluptates, quisquam voluptatibus.
              </p>

              <div className="productSize d-flex align-items-center">
                <span className="text-light mr-2">Size / Weight: </span>
                <ul className="list list-inline mb-0 pl-4">
                  <li className="list-inline-item">
                    <a
                      className={`tag ${activeSize === 0 ? "active" : ""}`}
                      onClick={() => isActive(0)}
                    >
                      50g
                    </a>
                  </li>
                  <li className="list-inline-item">
                    <a
                      className={`tag ${activeSize === 1 ? "active" : ""}`}
                      onClick={() => isActive(1)}
                    >
                      100g
                    </a>
                  </li>
                  <li className="list-inline-item">
                    <a
                      className={`tag ${activeSize === 2 ? "active" : ""}`}
                      onClick={() => isActive(2)}
                    >
                      200g
                    </a>
                  </li>
                  <li className="list-inline-item">
                    <a
                      className={`tag ${activeSize === 3 ? "active" : ""}`}
                      onClick={() => isActive(3)}
                    >
                      300g
                    </a>
                  </li>
                  <li className="list-inline-item">
                    <a
                      className={`tag ${activeSize === 4 ? "active" : ""}`}
                      onClick={() => isActive(4)}
                    >
                      500g
                    </a>
                  </li>
                </ul>
              </div>

              <div className="d-flex align-items-center mt-3">
                <QuantityBox />
                <Button className="btn-blue btn-big btn-lg btn-round ml-4">
                  <BsCartFill /> &nbsp; Add to cart
                </Button>

                <Tooltip title="Add to Wishlist" placement="top">
                  <Button className="btn-blue btn-big btn-lg btn-circle ml-4">
                    <FaRegHeart />
                  </Button>
                </Tooltip>
                <Tooltip title="Add to Compare" placement="top">
                  <Button className="btn-blue btn-big btn-lg btn-circle ml-2">
                    <MdCompareArrows />
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>

          <br />

          <div className="row">
            <div className="col-md-12">
              <ul className="nav nav-tabs product-tabs">
                <li className="nav-item">
                  <a
                    className={`nav-link ${
                      activeTab === "description" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("description")}
                    href="#!"
                  >
                    Description
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link ${
                      activeTab === "additional" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("additional")}
                    href="#!"
                  >
                    Additional Info
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link ${
                      activeTab === "reviews" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("reviews")}
                    href="#!"
                  >
                    Reviews (3)
                  </a>
                </li>
              </ul>

              <div className="tab-content-custom">
                {activeTab === "description" && (
                  <div>
                    <h5>Product Description</h5>
                    <p>
                      This is a great product that meets all your expectations.
                      High quality and durable!
                    </p>
                  </div>
                )}
                {activeTab === "additional" && (
                  <div>
                    <h5>Additional Information</h5>
                    <ul>
                      <li>Weight: 1.2kg</li>
                      <li>Color: Black</li>
                      <li>Material: Aluminum</li>
                    </ul>
                  </div>
                )}
                {activeTab === "reviews" && (
                  <div className="customer-reviews">
                    <h5>Customer questions & answers</h5>

                    {/* Review Item */}
                    <div className="review-item d-flex p-3 mb-3 border rounded bg-white shadow-sm">
                      <img
                        src="https://avatars.githubusercontent.com/u/1479328?v=4"
                        alt="avatar"
                        className="rounded-circle mr-3"
                        style={{ width: 64, height: 64 }}
                      />
                      <div>
                        <strong>Rinku Verma</strong>
                        <div
                          className="text-muted mb-1"
                          style={{ fontSize: "14px" }}
                        >
                          01/03/1993
                        </div>
                        <Rating
                          name="read-only"
                          value={4.5}
                          precision={0.5}
                          readOnly
                          size="small"
                        />
                        <p style={{ marginBottom: 5 }}>
                          Noodles & Company is an American fast-casual
                          restaurant that offers international and American
                          noodle dishes and pasta in addition to soups and
                          salads. Noodles & Company was founded in 1995 by Aaron
                          Kennedy and is headquartered in Broomfield, Colorado.
                          The company went public in 2013 and recorded a $457
                          million revenue in 2017. In late 2018, there were 460
                          locations across 29 states and Washington, D.C.
                        </p>
                      </div>
                    </div>

                    {/* Add a Review */}
                    <div className="add-review mt-4">
                      <h5>Add a Review</h5>
                      <form>
                        <div className="form-group">
                          <label htmlFor="reviewName">Name</label>
                          <input
                            type="text"
                            className="form-control"
                            id="reviewName"
                            placeholder="Your name"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="reviewContent">Your Review</label>
                          <textarea
                            className="form-control"
                            id="reviewContent"
                            rows="4"
                            placeholder="Write your thoughts here..."
                          ></textarea>
                        </div>
                        <div className="form-group d-flex align-items-center">
                          <label className="mr-2" htmlFor="reviewRating">Rating</label>
                          <Rating
                            name="simple-uncontrolled"
                            onChange={(event, newValue) => {
                              console.log(newValue);
                            }}
                            defaultValue={2}
                          />
                        </div>
                        <button type="submit" className="btn btn-primary">
                          Submit Review
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <br />    

          <RelatedProducts title="RELATED PRODUCTS"/>

          <RelatedProducts title="RECENTLY VIEWED PRODUCTS"/>
          
        </div>
      </section>
    </>
  );
};

export default ProductDetails;
