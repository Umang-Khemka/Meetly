// HeroText.jsx
import React from "react";
import {Link} from "react-router-dom";

export default function HeroText() {
  return (
    <div>
      <h1>
        <span style={{ color: "#FF9839" }}>Connect</span> With your loved ones
      </h1>
      <p>Cover a distance by Meetly</p>
      <div role="button">
        <Link  to={"/auth"} className="startButton">Get Started</Link>
      </div>
    </div>
  );
}
