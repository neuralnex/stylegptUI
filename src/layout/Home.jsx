import React from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Service from "../components/Service";
import About from "../components/About";
import Brands from "../components/Brands";
import Contact from "../components/Contact";

const Home = () => {
  return (
    <div className="home-page">
      <Header />
      <Hero />
      <Service />
      <About />
      <Brands />
      <Contact />
    </div>
  );
};

export default Home;
