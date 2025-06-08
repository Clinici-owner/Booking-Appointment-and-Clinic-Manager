import React from 'react'
import Header from '../components/Header';
import Footer from '../components/Footer';

function NewsPage() {
  return (
    <div>
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-12 min-h-screen">
        <h1 className="text-3xl font-bold mb-4">Latest News</h1>
        <p className="mb-8">Stay updated with our latest news and announcements.</p>
      </div>
      <Footer />
    </div>
  )
}

export default NewsPage;

