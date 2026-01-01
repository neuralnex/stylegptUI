import React from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Service from "../components/Service";
import About from "../components/About";

const Home = () => {
  return (
    <div className="home-page">
      <Header />
      <Hero />
      <Service />
      <About />
    </div>
  );
};

export default Home;
