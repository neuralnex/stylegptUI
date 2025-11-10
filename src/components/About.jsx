import React, { useState } from "react";
import "./About.scss";
import CircleIcon from "./CircleIcon";

const data = [
  {
    text: "AI-POWERED CLASSIFICATION",
    desc: "Our Fashion-CLIP AI automatically identifies and categorizes your clothing items, making wardrobe organization effortless.",
    img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80",
  },
  {
    text: "SMART OUTFIT SUGGESTIONS",
    desc: "Get personalized outfit recommendations based on your wardrobe, occasion, and personal style preferences.",
    img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80",
  },
  {
    text: "WARDROBE MANAGEMENT",
    desc: "Digitally organize your entire wardrobe, track what you wear, and discover new combinations you never thought of.",
    img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80",
  },
  {
    text: "STYLE INSIGHTS",
    desc: "Receive daily fashion tips and insights curated from current trends and AI-powered analysis of your wardrobe.",
    img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80",
  },
];

const About = () => {
  const [index, setIndex] = useState(0);
  return (
    <div className="About">
      <div className="container">
        <div className="image">
          <img
            src="https://images.unsplash.com/photo-1524498250077-390f9e378fc0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=871&q=80"
            alt="about image"
          />
        </div>
        <div className="text">
          <span>About</span>
          <div className="text-details">
            <h1>YOUR PERSONAL AI FASHION ASSISTANT</h1>
            <p>
              StyleGPT revolutionizes how you manage your wardrobe and discover your personal style. 
              Using advanced AI technology, we help you organize your clothing, get intelligent outfit 
              suggestions, and explore new fashion combinations. Whether you're dressing for work, 
              a special occasion, or just want to look your best every day, StyleGPT is here to guide you.
            </p>
          </div>
        </div>
      </div>
      <div className="container container-2">
        <div className="col-1">
          {data.map((elem, index) => (
            <div
              className="item"
              key={index}
              onMouseMove={() => setIndex(index)}
            >
              <div className="text-2">
                <h3>{elem.text}</h3>
                <p>{elem.desc.slice(0, 180)}</p>
              </div>
              <CircleIcon />
            </div>
          ))}
        </div>
        <div className="col-2">
          <img src={data[index].img} alt={data[index].text} />
        </div>
      </div>
    </div>
  );
};

export default About;
