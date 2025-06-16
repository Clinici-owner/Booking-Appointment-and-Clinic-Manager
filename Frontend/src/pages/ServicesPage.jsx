import React from 'react'
import Header from '../components/Header';
import Footer from '../components/Footer';

function ServicesPage() {
  return (
    <div>
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-4">Our Services</h1>
        <p className="mb-8">We offer a wide range of services to meet your needs.</p>
      </div>
      <Footer />
    </div>
  )
}

export default ServicesPage;

