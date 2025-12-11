import React from 'react';
import { FileText, PenLine, Search, ArrowRight } from 'lucide-react';

const HowItWorks: React.FC = () => {
    const steps = [
        {
            icon: <FileText size={32} />,
            title: '1. Pilih Layanan',
            description: 'Pilih jenis layanan yang Anda butuhkan dari daftar layanan yang tersedia.',
            color: 'bg-emerald-500/10 text-emerald-400'
        },
        {
            icon: <PenLine size={32} />,
            title: '2. Isi Formulir',
            description: 'Lengkapi data diri dan unggah dokumen pendukung yang diperlukan.',
            color: 'bg-blue-500/10 text-blue-400'
        },
        {
            icon: <Search size={32} />,
            title: '3. Pantau Status',
            description: 'Dapatkan nomor tiket dan pantau status permohonan Anda secara real-time.',
            color: 'bg-purple-500/10 text-purple-400'
        }
    ];

    return (
        <section className="py-20 bg-[#0B1120] text-white overflow-hidden relative">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        Cara Mengajukan Layanan
                    </h2>
                    <p className="text-slate-400 text-lg">
                        Proses pengajuan yang mudah, cepat, dan dapat dipantau kapan saja dari mana saja.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-slate-700 to-transparent z-0"></div>

                    {steps.map((step, index) => (
                        <div key={index} className="relative z-10 group">
                            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-slate-600 transition-all duration-300 hover:transform hover:-translate-y-1 text-center h-full">
                                <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                    {step.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white">{step.title}</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <a
                        href="#layanan"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-tangkas-primary to-tangkas-light text-white font-bold shadow-lg shadow-tangkas-primary/20 hover:shadow-tangkas-primary/40 hover:scale-105 transition-all"
                    >
                        Mulai Pengajuan
                        <ArrowRight size={20} />
                    </a>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
