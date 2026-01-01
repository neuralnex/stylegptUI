import React from "react";
import { Link as RouterLink } from "react-router-dom";
import "./Hero.scss";
import { Button } from "@heroui/react";

const Hero = () => {
  return (
    <section className="hero">
      <div className="container">
        <div className="text">
          <h1>
            StyleGPT <br />Your AI Fashion Assistant
          </h1>
          <div className="text-desc">
            <p>
              StyleGPT is your personal AI-powered fashion assistant that helps you look your best every day. 
              It simplifies outfit selection, wardrobe organization, and style discovery using intelligent recommendations 
              tailored to your mood, occasion, and personality. Whether you are dressing for work, a date, or a casual outing, 
              StyleGPT ensures you always step out with confidence and flair.
            </p>
            <div className="hero-actions">
              <Button as={RouterLink} to="/upload" variant="bordered" radius="full">
                Explore Features
              </Button>
              <Button
                as={RouterLink}
                to="/chat"
                color="primary"
                variant="solid"
                radius="full"
                className="hero-chat-btn"
              >
                Chat for suggestions
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
