import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from './navbar'
import Navbar2 from './navbar2'
import "../../css/homepage.css"
import Footer from "./footer";
import Blogcarousel from "./blogcarousel";
import { faTruck, faClock, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Homepage() {
  const navigate = useNavigate();


  const rowsRef = useRef([]);
  const imageList = [
    "src/images/homepage1.png",
    "src/images/homepage2.png",
    "src/images/homepage3.png"
  ];
  const fishImageList = [
    "src/images/fish1.png",
    "src/images/fish2.png",
    "src/images/fish3.png",
    "src/images/fish4.png",
    "src/images/fish5.png",
    "src/images/fish6.png",
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible"); // Add visible class when in view
          } else {
            entry.target.classList.remove("visible"); // Remove visible class when out of view
          }
        });
      },
      { threshold: 0.1 } // Trigger when 10% of the row is visible
    );

    // Copy the current ref values to a local variable
    const rows = rowsRef.current;

    // Observe each row
    rows.forEach((row) => {
      if (row) {
        observer.observe(row);
      }
    });
    return () => {
      // Cleanup: unobserve all rows when component unmounts
      rows.forEach((row) => {
        if (row) observer.unobserve(row);
      });
    };
  }, []); // Empty dependency array so this runs only on mount

  return (
    <>
      <div>
        <Navbar2 />
        
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1>Koi Fish Transportation Experts</h1>
            <p>Safe - Professional - On Time</p>
            <div className="hero-buttons">
              <button className="primary-button" onClick={() => navigate('/placeorder')}>
                Book Shipping Now
              </button>
              <button className="secondary-button" onClick={() => navigate('/account-management', {state:{activeComponent: 'orders'}})}>
                Track Your Order
              </button>
            </div>
          </div>
        </section>

        {/* Shipping Features */}
        <section className="shipping-features">
          <div className="feature-card">
            <FontAwesomeIcon icon={faTruck} />
            <h3>Nationwide Delivery</h3>
            <p>Serving all provinces across the country</p>
          </div>
          <div className="feature-card">
            <FontAwesomeIcon icon={faClock} />
            <h3>Fast Delivery</h3>
            <p>Quick and efficient shipping service</p>
          </div>
          <div className="feature-card">
            <FontAwesomeIcon icon={faShieldAlt} />
            <h3>Safety Guaranteed</h3>
            <p>Ensuring healthy fish upon delivery</p>
          </div>
        </section>

        {/* Content Section */}
        <section className="content-section">
          <div className="row" ref={(el) => (rowsRef.current[0] = el)}>
            <img src={imageList[0]} alt="Shipping Service" className="content-image" />
            <div className="content-text">
              <h2>Professional Transportation Service</h2>
              <p>
                We provide professional Koi fish transportation services with modern 
                transport tanks featuring temperature and oxygen control systems. 
                Our experienced team ensures your fish receive the best care throughout 
                their journey.
              </p>
            </div>
          </div>
          
          <div className="divider" />
          <div className="row reverse" ref={(el) => (rowsRef.current[1] = el)}>
            <img
              src={imageList[1]}
              alt="Feature 2"
              className="content-image"
            />
            <div className="content-text">
              <h2>Health Care</h2>
              <p>
                We understand how crucial it is to maintain the well-being of koi fish during transit. That’s why we take extra precautions to ensure that each fish is carefully handled from the moment it leaves our facility to its arrival at your home. Our koi are transported in oxygenated, temperature-controlled environments to minimize stress and ensure their safety. Upon arrival, we provide you with easy-to-follow guidelines on how to acclimate your koi to their new pond, ensuring they thrive in their new surroundings with minimal stress.
              </p>
            </div>
          </div>
          <div className="divider" />
          <div className="row" ref={(el) => (rowsRef.current[2] = el)}>
            <img
              src={imageList[2]}
              alt="Feature 1"
              className="content-image"
            />
            <div className="content-text">
              <h2>Our Team</h2>
              <p>
                Our team is comprised of koi fish experts with years of experience in aquatic care and transport. From certified fish health professionals to experienced handlers, we take pride in the care and attention we give to every step of the delivery process. Our professionals are not only passionate about koi but are also dedicated to providing excellent customer service. You can trust our team to guide you through every aspect of your koi ownership journey, from selecting the perfect fish to ensuring its long-term health.
              </p>
            </div>
          </div>
          <div className="divider" />
          <div className="wrapper">
            <div className="item item1"><img src={fishImageList[0]}></img></div>
            <div className="item item2"><img src={fishImageList[1]}></img></div>
            <div className="item item3"><img src={fishImageList[2]}></img></div>
            <div className="item item4"><img src={fishImageList[3]}></img></div>
            <div className="item item5"><img src={fishImageList[4]}></img></div>
            <div className="item item6"><img src={fishImageList[5]}></img></div>
            <div className="item item7"><img src={fishImageList[0]}></img></div>
            <div className="item item8"><img src={fishImageList[1]}></img></div>
          </div>
          <div className="divider" />
          
        </section>
      </div>
      <Footer />
    </>
  )
}
