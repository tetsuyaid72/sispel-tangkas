import React from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../constants';

const Hero: React.FC = () => {
  return (
    <section id="beranda" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-slate-50">
      {/* Background with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-tangkas-primary to-tangkas-light z-0">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        {/* Abstract Shapes */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/2 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-300 opacity-20 rounded-full blur-2xl transform -translate-x-1/3"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <div className="text-center lg:text-left text-white space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Pelayanan Online 24/7
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight drop-shadow-sm">
            Sistem Pelayanan <br/>
            <span className="text-cyan-100">Desa Tangkas</span>
            <span className="block text-2xl md:text-3xl mt-2 font-normal text-white/90"> Cepat, Mudah, dan Transparan.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-cyan-50 max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed">
            Platform resmi untuk mempermudah seluruh kebutuhan administrasi masyarakat Desa Tangkas secara digital.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
             <a 
              href="#layanan"
              className="px-8 py-4 rounded-xl bg-white text-tangkas-dark font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 group"
            >
              Lihat Layanan Desa
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a 
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-xl bg-white/10 border-2 border-white/30 text-white font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2 backdrop-blur-sm hover:scale-105"
            >
              <MessageCircle size={20} />
              Ajukan via WhatsApp
            </a>
          </div>
        </div>

        {/* Hero Illustration */}
        <div className="hidden lg:block relative animate-float">
          {/* Main Card */}
          <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
             <div className="bg-white rounded-xl p-6 shadow-inner overflow-hidden min-h-[300px] flex flex-col">
                {/* Header of the mock interface */}
                <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-tangkas-light/10 flex items-center justify-center">
                      <MessageCircle className="text-tangkas-primary" size={20} />
                    </div>
                    <div>
                      <div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
                      <div className="h-3 w-20 bg-slate-100 rounded mt-2"></div>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-100"></div>
                </div>

                {/* Mock Services */}
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-slate-50 hover:bg-slate-50 transition-colors">
                       <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${i === 1 ? 'bg-teal-100 text-teal-600' : i === 2 ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                          <div className="w-5 h-5 bg-current opacity-50 rounded"></div>
                       </div>
                       <div className="flex-1 space-y-2">
                          <div className="h-3 w-3/4 bg-slate-200 rounded"></div>
                          <div className="h-2 w-1/2 bg-slate-100 rounded"></div>
                       </div>
                       <div className="w-6 h-6 rounded-full bg-slate-100"></div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
          
          {/* Decorative Back Elements */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-yellow-400/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-400/30 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Wave Separator */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg viewBox="0 0 1440 120" className="w-full h-auto text-slate-50 fill-current block">
          <path d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,80C672,64,768,64,864,80C960,96,1056,128,1152,117.3C1248,107,1344,53,1392,26.7L1440,0L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default Hero;