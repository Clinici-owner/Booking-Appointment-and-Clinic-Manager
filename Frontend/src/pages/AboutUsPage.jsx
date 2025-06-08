import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

function AboutUsPage() {
  return (
    <div>
      <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-4">About Us</h1>
            <p className="mb-8">We are a company dedicated to providing the best service possible.</p>
        </div>
      <Footer />
    </div>
  );
}

export default AboutUsPage;
