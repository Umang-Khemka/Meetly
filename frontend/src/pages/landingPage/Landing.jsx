// Landing.jsx
import React from "react";
import "./landing.css";
import Navbar from "./Navbar";
import HeroText from "./HeroText";
import HeroImage from "./HeroImage";

export default function Landing() {
  return (
    <div className="landingPageContainer">
      <Navbar />
      <div className="landingMainContainer">
        <HeroText />
        <HeroImage />
      </div>
    </div>
  );
}
