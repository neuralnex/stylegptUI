import React from "react";
import CircleIcon from "../components/CircleIcon";
import CompanyLogos from "../components/CompanyLogos";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Service from "../components/Service";
import UploadSection from "../components/UploadSection";
import About from "../components/About";
import Brands from "../components/Brands";
import Contact from "../components/Contact";

const Home = () => {
  return (
    <div>
      <Header />
      <Hero />
      <Service />
      <UploadSection />
      <CompanyLogos />
      <About />
      <Brands />
      <Contact />
    </div>
  );
};

export default Home;
