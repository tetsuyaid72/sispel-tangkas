import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../constants';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Beranda', href: '#beranda' },
    { label: 'Layanan Publik', href: '#layanan' },
    { label: 'Cek Status', href: '/cek-status', isRoute: true },
    { label: 'Layanan Pengaduan', href: '#pengaduan' },
    { label: 'Tentang Desa', href: '#tentang' },
    { label: 'Kontak', href: '#kontak' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white/80 backdrop-blur-md shadow-md py-3'
        : 'bg-transparent py-6'
        }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <img
            src="/images/logodesa.png"
            alt="Logo Desa Banjar"
            className={`transition-all duration-300 ${isScrolled ? 'h-10' : 'h-12 drop-shadow-lg'}`}
          />
          <div className="flex flex-col">
            <span className={`font-bold tracking-tight leading-none ${isScrolled ? 'text-slate-800' : 'text-white drop-shadow-md'} text-lg`}>
              DESA TANGKAS
            </span>
            <span className={`text-xs font-medium tracking-wide ${isScrolled ? 'text-tangkas-primary' : 'text-white/90 drop-shadow-md'}`}>
              KABUPATEN BANJAR
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            link.isRoute ? (
              <Link
                key={link.label}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-tangkas-primary ${isScrolled ? 'text-slate-600' : 'text-white drop-shadow-sm hover:text-cyan-100'}`}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-tangkas-primary ${isScrolled ? 'text-slate-600' : 'text-white drop-shadow-sm hover:text-cyan-100'}`}
              >
                {link.label}
              </a>
            )
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 text-slate-700"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} className={isScrolled ? 'text-slate-800' : 'text-slate-800 lg:text-white'} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-slate-100 flex flex-col p-6 gap-4 animate-fade-in-down">
          {navLinks.map((link) => (
            link.isRoute ? (
              <Link
                key={link.label}
                to={link.href}
                className="text-slate-700 font-medium py-2 border-b border-slate-50 hover:text-tangkas-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="text-slate-700 font-medium py-2 border-b border-slate-50 hover:text-tangkas-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            )
          ))}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            className="w-full flex justify-center items-center gap-2 bg-tangkas-primary text-white py-3 rounded-lg font-semibold mt-2 active:bg-tangkas-dark"
          >
            <Phone size={18} />
            Hubungi Admin
          </a>
        </div>
      )}
    </header>
  );
};

export default Header;