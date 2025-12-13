import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="flex items-center gap-3 mb-4">
            <img src="/images/logodesa.png" alt="Logo Desa Tangkas" className="h-10" />
            <div className="text-left">
              <h3 className="font-bold text-slate-800 leading-none">Desa Tangkas</h3>
              <p className="text-xs text-tangkas-primary font-medium">KABUPATEN BANJAR</p>
            </div>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed max-w-md">
            Sistem pelayanan publik digital untuk mempermudah administrasi kependudukan masyarakat Desa Tangkas secara transparan dan akuntabel.
          </p>
        </div>

        <div className="border-t border-slate-100 pt-8 text-center text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} Pemerintah Desa Tangkas Kec. Martapura Barat</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;