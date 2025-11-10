import React from "react";
import { SecondaryBtn } from "./Btn";
import "./Service.scss";

const serviceData = [
  {
    text: "SMART OUTFIT SUGGESTIONS",
    desc: "Get personalized outfit ideas based on your wardrobe, preferences, and the latest trends.",
  },
  {
    text: "WARDROBE MANAGEMENT",
    desc: "Digitally organize your clothes, categorize them by type or season, and track what you wear most.",
  },
  {
    text: "VIRTUAL TRY-ON",
    desc: "Visualize your outfits on a customizable 3D avatar that matches your body type and measurements.",
  },
  {
    text: "STYLE INSIGHTS",
    desc: "Receive daily or event-based fashion tips curated from current fashion data and influencer trends.",
  },
  {
    text: "OUTFIT PLANNING CALENDAR",
    desc: "Plan your looks ahead for upcoming events and never worry about last-minute outfit stress.",
  },
  {
    text: "MIX AND MATCH ASSISTANT",
    desc: "Experiment with different clothing combinations to discover new looks you might not have considered.",
  },
  {
    text: "COMMUNITY INSPIRATION",
    desc: "Browse and share outfit ideas from other users, gain inspiration, and explore trending styles.",
  },
  {
    text: "AI STYLIST CHAT",
    desc: "Chat with your virtual stylist for quick advice on colors, fits, or accessories before you step out.",
  },
];

const Card = ({ title, desc }) => {
  return (
    <div className="ServiceCard">
      <h3>{title}</h3>
      <p>{desc}</p>
      <SecondaryBtn text={`ABOUT ${title}`} classText={"btn-s-45"} />
    </div>
  );
};

const Service = () => {
  return (
    <section className="service">
      <div className="container">
        {serviceData.map((elem, index) => (
          <Card key={index} title={elem.text} desc={elem.desc} />
        ))}
      </div>
    </section>
  );
};

export default Service;
