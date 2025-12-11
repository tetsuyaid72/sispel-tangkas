import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import About from './components/About';
import Complaint from './components/Complaint';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  return (
    <div className="font-sans antialiased text-slate-800 bg-slate-50">
      <Header />
      <main>
        <Hero />
        <Services />
        <About />
        <Complaint />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;