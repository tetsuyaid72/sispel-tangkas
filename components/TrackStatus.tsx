import React, { useState } from 'react';
import { Search, Clock, Loader2, CheckCircle, XCircle, FileText, ArrowLeft, AlertCircle, MessageCircle } from 'lucide-react';
import { trackRequest, TrackResponse } from '../src/lib/api';
import { WHATSAPP_NUMBER } from '../constants';

export default function TrackStatus() {
    const [trackingNumber, setTrackingNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<TrackResponse | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trackingNumber.trim()) return;

        setError('');
        setIsLoading(true);
        setResult(null);

        try {
            const data = await trackRequest(trackingNumber.trim().toUpperCase());
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'Pengajuan tidak ditemukan');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock size={20} />;
            case 'processing': return <Loader2 size={20} />;
            case 'completed': return <CheckCircle size={20} />;
            case 'rejected': return <XCircle size={20} />;
            default: return <FileText size={20} />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'Menunggu';
            case 'processing': return 'Diproses';
            case 'completed': return 'Selesai';
            case 'rejected': return 'Ditolak';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' };
            case 'processing': return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' };
            case 'completed': return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' };
            case 'rejected': return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
            default: return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getWhatsappLink = () => {
        const text = result
            ? `Halo Admin Desa, saya ingin menanyakan status pengajuan dengan nomor tracking: ${result.request.trackingNumber}. Terima kasih.`
            : `Halo Admin Desa, saya ingin menanyakan status pengajuan saya. Mohon dibantu.`;
        return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-6 py-4 flex items-center gap-4">
                    <a href="/" className="flex items-center gap-2 text-slate-600 hover:text-tangkas-primary transition-colors">
                        <ArrowLeft size={20} />
                        <span className="font-medium">Kembali</span>
                    </a>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12">
                <div className="max-w-2xl mx-auto">
                    {/* Title Section */}
                    <div className="text-center mb-10">
                        <div className="inline-flex p-4 rounded-full bg-tangkas-primary/10 mb-4">
                            <Search size={32} className="text-tangkas-primary" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">Cek Status Permohonan</h1>
                        <p className="text-slate-600">
                            Masukkan nomor tracking untuk melihat status pengajuan Anda
                        </p>
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSubmit} className="mb-8">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                                    placeholder="Contoh: TGK251211XXXXXX"
                                    className="w-full px-5 py-4 text-lg border-2 border-slate-200 rounded-xl focus:outline-none focus:border-tangkas-primary focus:ring-2 focus:ring-tangkas-primary/20 font-mono tracking-wide"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading || !trackingNumber.trim()}
                                className="px-8 py-4 bg-tangkas-primary text-white font-semibold rounded-xl hover:bg-tangkas-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Mencari...
                                    </>
                                ) : (
                                    <>
                                        <Search size={20} />
                                        Cek Status
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-start gap-3">
                            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                            <div>
                                <p className="text-red-700 font-medium">{error}</p>
                                <p className="text-red-600 text-sm mt-1">
                                    Pastikan nomor tracking yang Anda masukkan sudah benar.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Result Card */}
                    {result && (
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            {/* Status Banner */}
                            <div className={`${getStatusColor(result.request.status).bg} px-6 py-4 border-b ${getStatusColor(result.request.status).border}`}>
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">Nomor Tracking</p>
                                        <p className="text-xl font-bold font-mono text-slate-800">{result.request.trackingNumber}</p>
                                    </div>
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${getStatusColor(result.request.status).bg} ${getStatusColor(result.request.status).text} font-semibold`}>
                                        {getStatusIcon(result.request.status)}
                                        {getStatusLabel(result.request.status)}
                                    </div>
                                </div>
                            </div>

                            {/* Request Info */}
                            <div className="p-6 border-b border-slate-100">
                                <h3 className="font-semibold text-slate-800 mb-4">Informasi Pengajuan</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-slate-500">Layanan</p>
                                        <p className="font-medium text-slate-800">{result.request.serviceTitle}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Nama Pemohon</p>
                                        <p className="font-medium text-slate-800">{result.request.applicantName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Tanggal Pengajuan</p>
                                        <p className="font-medium text-slate-800">{formatDate(result.request.createdAt)}</p>
                                    </div>
                                    {result.request.completedAt && (
                                        <div>
                                            <p className="text-sm text-slate-500">Tanggal Selesai</p>
                                            <p className="font-medium text-slate-800">{formatDate(result.request.completedAt)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Status History */}
                            <div className="p-6">
                                <h3 className="font-semibold text-slate-800 mb-4">Riwayat Status</h3>
                                <div className="space-y-4">
                                    {result.history.map((item, index) => {
                                        const colors = getStatusColor(item.newStatus);
                                        return (
                                            <div key={item.id} className="flex gap-4">
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-10 h-10 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center`}>
                                                        {getStatusIcon(item.newStatus)}
                                                    </div>
                                                    {index < result.history.length - 1 && (
                                                        <div className="w-0.5 h-full bg-slate-200 mt-2"></div>
                                                    )}
                                                </div>
                                                <div className="flex-1 pb-4">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}>
                                                            {getStatusLabel(item.newStatus)}
                                                        </span>
                                                        <span className="text-sm text-slate-500">
                                                            {formatDate(item.changedAt)}
                                                        </span>
                                                    </div>
                                                    {item.notes && (
                                                        <p className="text-slate-600 text-sm mt-1">{item.notes}</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="px-6 pb-6">
                                <a
                                    href={getWhatsappLink()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <MessageCircle size={20} />
                                    Tanyakan via WhatsApp
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Help Section */}
                    {!result && !error && !isLoading && (
                        <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                            <h3 className="font-semibold text-slate-800 mb-3">Tidak punya nomor tracking?</h3>
                            <p className="text-slate-600 text-sm mb-4">
                                Nomor tracking diberikan saat Anda berhasil mengajukan layanan.
                                Jika Anda lupa atau belum punya nomor tracking, silakan hubungi admin desa.
                            </p>
                            <a
                                href={getWhatsappLink()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-tangkas-primary font-medium hover:underline"
                            >
                                <MessageCircle size={18} />
                                Hubungi Admin via WhatsApp
                            </a>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
