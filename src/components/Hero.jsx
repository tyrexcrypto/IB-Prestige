import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Hero() {
  const backgrounds = ["watchBG1.jpg", "watchBGimage.jpg", "watchBGimage3.jpg"];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      // Fixed the modulo math to correctly loop 0, 1, 2, 0, 1, 2...
      setCurrentIndex((prevIndex) => (prevIndex + 1) % backgrounds.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [backgrounds.length]);

  return (
    <section className="hero">
      {/* Background Images Layer */}
      {backgrounds.map((bg, index) => (
        <div
          key={index}
          className={`hero-bg-slide ${index === currentIndex ? "active" : ""}`}
          style={{ backgroundImage: `url(${bg})` }}
        />
      ))}

      {/* Dark Overlay over the active image */}
      <div className="overlay"></div>

      {/* Hero Content */}
      <div className="hero-container container">
        <div className="hero-text-contents">
          <h1>
            TIME, <br />
            REFINED
          </h1>
          <p>
            Curated timepieces for those who appreciate the art of wearing time.
          </p>
        </div>
        {/* Fixed the stray dot typo here */}
        <div className="hero-btn-container">
          <Link to="/shop" className="link btn">
            EXPLORE COLLECTION
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;
