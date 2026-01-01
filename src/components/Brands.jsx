import React from "react";
import { Button } from "@heroui/react";
import "./Brands.scss";

const data = [
  {
    text: "Casual Style",
    tag: "Everyday",
    img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80",
  },
  {
    text: "Formal Attire",
    tag: "Professional",
    img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80",
  },
  {
    text: "Streetwear",
    tag: "Trendy",
    img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80",
  },
  {
    text: "Sportswear",
    tag: "Active",
    img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80",
  },
];

const Brands = () => {
  return (
    <div className="brands">
      <div className="main-text">
        <h2>Style Categories</h2>
        <Button variant="bordered" radius="full">
          Explore
        </Button>
      </div>
      <div className="container">
        {data.map((elem, index) => (
          <div
            className="item"
            key={index}
            style={{
              background: `linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.714)),url(${elem.img})`,
            }}
          >
            <div className="lower-text">
              <h1>{elem.text}</h1>
              <div className="lower-text-btns">
                <Button variant="bordered" radius="full">
                  View Style
                </Button>
                <span className="brandTag">{elem.tag}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Brands;
