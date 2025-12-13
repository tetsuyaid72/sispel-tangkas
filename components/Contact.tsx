import React from 'react';
import { MapPin, Clock, Phone, Mail } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../constants';

const Contact: React.FC = () => {
  return (
    <section id="kontak" className="py-20 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Informasi Kontak</h2>
          <p className="text-slate-600">Kunjungi kantor desa kami atau lakukan permohonan secara digital.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Cards */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-teal-50 text-tangkas-primary rounded-xl flex items-center justify-center mb-6">
                <MapPin size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Alamat Kantor</h3>
              <p className="text-slate-600 leading-relaxed">
                Jl. Martapura Lama Desa Tangkas<br />
                Kecamatan Martapura Barat<br />
                Kabupaten Banjar, Kalimantan Selatan
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Clock size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Jam Pelayanan</h3>
              <ul className="text-slate-600 space-y-2">
                <li className="flex justify-between">
                  <span>Senin - Kamis</span>
                  <span className="font-medium">08:30 - 14:30</span>
                </li>
                <li className="flex justify-between">
                  <span>Jumat</span>
                  <span className="font-medium">08:00 - 11:30</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Map */}
          <div className="lg:col-span-2 h-full min-h-[400px]">
            <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg border-4 border-white relative bg-slate-200">
              {/* Static Map Image / Iframe Placeholder */}
              {/* In production, use Google Maps Embed API */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d227.54210887782216!2d114.82191195684481!3d-3.3601147881152422!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sid!2ssg!4v1764750453502!5m2!1sid!2ssg"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full"
                title="Peta Desa Tangkas"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;