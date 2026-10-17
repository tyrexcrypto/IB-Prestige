import { Link } from "react-router-dom";
import NavBar from "../src/components/Nav";
import Footer from "../src/components/Footer";

function About() {
  return (
    <>
      <NavBar />
      <main className="about-page">
        <section className="about-hero">
          <div className="container">
            <p className="about-eyebrow">THE IB PRESTIGE STORY</p>
            <h1>
              Time is personal.
              <br />
              <em>Make every second count.</em>
            </h1>
            <p className="about-intro">
              IB Prestige is built around a simple belief: the right timepiece
              is more than an accessory. It is a quiet expression of taste,
              character and the moments that matter.
            </p>
            <Link to="/shop" className="link btn primary-btn">
              EXPLORE THE COLLECTION
            </Link>
          </div>
        </section>
        <section className="about-principles">
          <div className="container about-principles-grid">
            <article>
              <span>01 / CRAFT</span>
              <h2>Chosen with intention.</h2>
              <p>
                We focus on timepieces with a considered look, a strong presence
                and a place in your everyday rotation.
              </p>
            </article>
            <article>
              <span>02 / STYLE</span>
              <h2>Quiet confidence.</h2>
              <p>
                From understated classics to bold statement pieces, personal
                style should never need to shout.
              </p>
            </article>
            <article>
              <span>03 / SERVICE</span>
              <h2>A better experience.</h2>
              <p>
                From browsing to checkout, we aim to make finding your next
                timepiece clear, simple and dependable.
              </p>
            </article>
          </div>
        </section>
        <section className="about-cta">
          <div className="container">
            <p className="about-eyebrow">FIND YOUR NEXT TIMEPIECE</p>
            <h2>Make it yours.</h2>
            <p>Explore the collection and find a watch that feels like you.</p>
            <Link to="/shop" className="btn">
              SHOP THE COLLECTION
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default About;
