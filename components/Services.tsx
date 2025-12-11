import React, { useState, useRef } from 'react';
import { Search, ArrowRight, X, FileCheck, AlertCircle, Loader2, CheckCircle, MessageCircle, Upload, File } from 'lucide-react';
import { SERVICES_LIST, WHATSAPP_NUMBER } from '../constants';
import { ServiceItem } from '../types';
import { submitRequest } from '../src/lib/api';

const Services: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const filteredServices = SERVICES_LIST.filter((service) =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (service: ServiceItem) => {
    setSelectedService(service);
  };

  const handleCloseModal = () => {
    setSelectedService(null);
  };

  return (
    <section id="layanan" className="py-20 bg-slate-50 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Layanan Publik Digital
          </h2>
          <p className="text-slate-600 text-lg">
            Pilih layanan yang Anda butuhkan, lihat persyaratannya, lalu ajukan via WhatsApp.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-12 relative animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-tangkas-primary transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-full text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-tangkas-primary/50 focus:border-tangkas-primary shadow-sm transition-all"
              placeholder="Cari layanan surat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredServices.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={index}
              onOpenModal={handleOpenModal}
            />
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">Layanan tidak ditemukan. Coba kata kunci lain.</p>
          </div>
        )}
      </div>

      {/* Requirements Modal */}
      {selectedService && (
        <RequirementsModal
          service={selectedService}
          onClose={handleCloseModal}
        />
      )}
    </section>
  );
};

const ServiceCard: React.FC<{
  service: ServiceItem;
  index: number;
  onOpenModal: (service: ServiceItem) => void;
}> = ({ service, index, onOpenModal }) => {
  return (
    <div
      className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-slate-100 hover:border-tangkas-light/30 transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full animate-fade-in-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="mb-6 inline-flex p-3 rounded-xl bg-slate-50 text-tangkas-primary group-hover:bg-tangkas-primary group-hover:text-white transition-colors duration-300 w-fit">
        <service.icon size={28} strokeWidth={1.5} />
      </div>

      <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-tangkas-primary transition-colors">
        {service.title}
      </h3>

      <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">
        {service.description}
      </p>

      <button
        onClick={() => onOpenModal(service)}
        className="mt-auto w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-tangkas-primary text-tangkas-primary font-semibold text-sm hover:bg-tangkas-primary hover:text-white transition-all duration-300 active:scale-95"
      >
        Lihat Persyaratan
        <ArrowRight size={16} />
      </button>
    </div>
  );
};

const RequirementsModal: React.FC<{
  service: ServiceItem;
  onClose: () => void;
}> = ({ service, onClose }) => {
  const [step, setStep] = useState<'requirements' | 'form' | 'success'>('requirements');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    applicantName: '',
    applicantPhone: '',
    applicantNik: '',
    applicantAddress: '',
    notes: ''
  });

  // State for uploaded files - single array for multiple files
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const getWhatsappLink = (trackingNum?: string) => {
    const text = trackingNum
      ? `Halo Admin Desa, saya sudah mengajukan ${service.title} dengan nomor tracking: ${trackingNum}. Mohon diproses, terima kasih.`
      : `Halo Admin Desa, saya ingin mengurus ${service.title}. Saya sudah memahami persyaratannya. Mohon dibantu prosesnya.`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (files: FileList | null) => {
    if (!files) return;
    const newFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > 5 * 1024 * 1024) {
        setError('Salah satu file melebihi batas 5MB');
        return;
      }
      newFiles.push(files[i]);
    }
    setError('');
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Create FormData for multipart upload
      const formDataToSend = new FormData();
      formDataToSend.append('serviceId', service.id);
      formDataToSend.append('serviceTitle', service.title);
      formDataToSend.append('applicantName', formData.applicantName);
      formDataToSend.append('applicantPhone', formData.applicantPhone);
      if (formData.applicantNik) formDataToSend.append('applicantNik', formData.applicantNik);
      if (formData.applicantAddress) formDataToSend.append('applicantAddress', formData.applicantAddress);
      if (formData.notes) formDataToSend.append('notes', formData.notes);

      // Add requirement labels
      formDataToSend.append('requirementLabels', JSON.stringify(service.requirements));

      // Add files
      uploadedFiles.forEach((file) => {
        if (file) {
          formDataToSend.append('documents', file);
        }
      });

      const response = await fetch('http://localhost:3001/api/requests', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal mengirim pengajuan');
      }

      const data = await response.json();
      setTrackingNumber(data.trackingNumber);
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim pengajuan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto">
        <div className="bg-tangkas-primary px-6 py-4 flex justify-between items-center text-white sticky top-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <service.icon size={24} />
            </div>
            <h3 className="font-bold text-lg leading-tight">{service.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 md:p-8">
          {step === 'requirements' && (
            <>
              <div className="mb-6 bg-orange-50 border border-orange-100 p-4 rounded-xl flex gap-3">
                <AlertCircle className="text-orange-600 flex-shrink-0" size={20} />
                <p className="text-sm text-orange-800">
                  Mohon siapkan dokumen berikut sebelum mengajukan permohonan.
                </p>
              </div>

              <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <FileCheck size={20} className="text-tangkas-primary" />
                Daftar Persyaratan:
              </h4>

              <ul className="space-y-3 mb-8">
                {service.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-600 text-sm">
                    <span className="w-5 h-5 rounded-full bg-teal-50 text-tangkas-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setStep('form')}
                className="w-full py-3 px-4 rounded-xl bg-tangkas-primary text-white font-semibold hover:bg-tangkas-dark transition-colors flex items-center justify-center gap-2 shadow-lg shadow-teal-200"
              >
                Lanjutkan Pengajuan
                <ArrowRight size={18} />
              </button>
            </>
          )}

          {step === 'form' && (
            <form onSubmit={handleSubmit}>
              <h4 className="font-semibold text-slate-800 mb-4">Lengkapi Data Pemohon</h4>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-100 p-3 rounded-xl flex gap-2 text-red-700 text-sm">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap *</label>
                  <input type="text" name="applicantName" value={formData.applicantName} onChange={handleInputChange} required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-tangkas-primary/50" placeholder="Masukkan nama lengkap" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nomor HP/WhatsApp *</label>
                  <input type="tel" name="applicantPhone" value={formData.applicantPhone} onChange={handleInputChange} required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-tangkas-primary/50" placeholder="08xxxxxxxxxx" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">NIK (Opsional)</label>
                  <input type="text" name="applicantNik" value={formData.applicantNik} onChange={handleInputChange} maxLength={16}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-tangkas-primary/50" placeholder="16 digit NIK" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Alamat (Opsional)</label>
                  <input type="text" name="applicantAddress" value={formData.applicantAddress} onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-tangkas-primary/50" placeholder="Alamat lengkap" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Catatan (Opsional)</label>
                  <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={2}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-tangkas-primary/50 resize-none" placeholder="Informasi tambahan..." />
                </div>

                {/* Document Upload Section */}
                <div className="pt-4 border-t border-slate-100">
                  <h5 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Upload size={18} className="text-tangkas-primary" />
                    Upload Dokumen Persyaratan
                  </h5>
                  <p className="text-xs text-slate-500 mb-4">
                    Format: JPG, PNG, PDF. Maksimal ukuran: <span className="font-semibold text-tangkas-primary">5MB</span> per file
                  </p>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*,.pdf"
                    multiple
                    onChange={(e) => handleFileChange(e.target.files)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-4 py-4 border-2 border-dashed border-slate-300 rounded-xl text-sm text-slate-500 hover:border-tangkas-primary hover:text-tangkas-primary transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload size={20} />
                    Pilih File (bisa lebih dari 1)
                  </button>

                  {/* List uploaded files */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {uploadedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                            <File size={16} className="text-tangkas-primary" />
                            <span className="truncate max-w-[200px]">{file.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col-reverse md:flex-row gap-3">
                <button type="button" onClick={() => setStep('requirements')}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors">Kembali</button>
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 py-3 px-4 rounded-xl bg-tangkas-primary text-white font-semibold hover:bg-tangkas-dark transition-colors flex items-center justify-center gap-2 shadow-lg shadow-teal-200 disabled:opacity-50">
                  {isSubmitting ? (<><Loader2 size={18} className="animate-spin" />Mengirim...</>) : (<>Kirim Pengajuan<ArrowRight size={18} /></>)}
                </button>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center">
              <div className="mb-6 inline-flex p-4 rounded-full bg-green-100">
                <CheckCircle size={48} className="text-green-600" />
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-2">Pengajuan Berhasil!</h4>
              <p className="text-slate-600 mb-4">Pengajuan Anda telah diterima dan akan segera diproses.</p>
              <div className="bg-slate-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-slate-500 mb-1">Nomor Tracking Anda</p>
                <p className="text-2xl font-bold text-tangkas-primary font-mono">{trackingNumber}</p>
                <p className="text-xs text-slate-400 mt-2">Simpan nomor ini untuk melacak status</p>
              </div>
              <div className="flex flex-col gap-3">
                <a href={getWhatsappLink(trackingNumber)} target="_blank" rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                  <MessageCircle size={18} />Konfirmasi via WhatsApp
                </a>
                <button onClick={onClose} className="w-full py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors">Selesai</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Services;