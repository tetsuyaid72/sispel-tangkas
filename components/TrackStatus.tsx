import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Search,
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
    ArrowLeft,
    FileText,
    Download,
    AlertCircle
} from 'lucide-react';
import { trackRequest, TrackResponse } from '../src/lib/api';

const TrackStatus: React.FC = () => {
    const [trackingNumber, setTrackingNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<TrackResponse | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!trackingNumber.trim()) {
            setError('Masukkan nomor tracking');
            return;
        }

        setIsLoading(true);
        setError('');
        setResult(null);

        try {
            const data = await trackRequest(trackingNumber.trim());
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'Pengajuan tidak ditemukan');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending':
                return {
                    icon: <Clock size={24} />,
                    label: 'Menunggu',
                    color: 'bg-amber-100 text-amber-700 border-amber-200',
                    iconColor: 'text-amber-500'
                };
            case 'processing':
                return {
                    icon: <Loader2 size={24} className="animate-spin" />,
                    label: 'Sedang Diproses',
                    color: 'bg-blue-100 text-blue-700 border-blue-200',
                    iconColor: 'text-blue-500'
                };
            case 'completed':
                return {
                    icon: <CheckCircle size={24} />,
                    label: 'Selesai',
                    color: 'bg-green-100 text-green-700 border-green-200',
                    iconColor: 'text-green-500'
                };
            case 'rejected':
                return {
                    icon: <XCircle size={24} />,
                    label: 'Ditolak',
                    color: 'bg-red-100 text-red-700 border-red-200',
                    iconColor: 'text-red-500'
                };
            default:
                return {
                    icon: <FileText size={24} />,
                    label: status,
                    color: 'bg-gray-100 text-gray-700 border-gray-200',
                    iconColor: 'text-gray-500'
                };
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

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-slate-600 hover:text-tangkas-primary transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span>Kembali</span>
                    </Link>
                    <h1 className="text-xl font-bold text-slate-800">Cek Status Pengajuan</h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Search Form */}
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-tangkas-primary/10 text-tangkas-primary mb-4">
                            <Search size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">
                            Lacak Pengajuan Anda
                        </h2>
                        <p className="text-slate-600">
                            Masukkan nomor tracking untuk melihat status pengajuan Anda
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                            placeholder="Masukkan nomor tracking (contoh: TRK-XXXX-XXXX)"
                            className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-tangkas-primary focus:outline-none transition-colors text-lg"
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-3 bg-tangkas-primary text-white font-semibold rounded-xl hover:bg-tangkas-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Mencari...
                                </>
                            ) : (
                                <>
                                    <Search size={20} />
                                    Cari
                                </>
                            )}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                {/* Result */}
                {result && (
                    <div className="space-y-6">
                        {/* Status Card */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="p-6 md:p-8">
                                <div className="flex flex-col md:flex-row md:items-start gap-6">
                                    {/* Status Badge */}
                                    <div className="flex-shrink-0">
                                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 ${getStatusConfig(result.request.status).color}`}>
                                            <span className={getStatusConfig(result.request.status).iconColor}>
                                                {getStatusConfig(result.request.status).icon}
                                            </span>
                                            <span className="font-semibold text-lg">
                                                {getStatusConfig(result.request.status).label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Request Details */}
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <p className="text-sm text-slate-500">Nomor Tracking</p>
                                            <p className="text-lg font-mono font-bold text-slate-800">
                                                {result.request.trackingNumber}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500">Layanan</p>
                                            <p className="text-lg font-semibold text-slate-800">
                                                {result.request.serviceTitle}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500">Nama Pemohon</p>
                                            <p className="text-slate-700">{result.request.applicantName}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                            <div>
                                                <span>Diajukan: </span>
                                                <span className="text-slate-700">{formatDate(result.request.createdAt)}</span>
                                            </div>
                                            <div>
                                                <span>Terakhir diupdate: </span>
                                                <span className="text-slate-700">{formatDate(result.request.updatedAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Completed Document Download */}
                                {result.request.status === 'completed' && result.request.completedDocuments && (
                                    <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-xl">
                                        <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                                            <CheckCircle size={18} />
                                            Dokumen Selesai
                                        </h4>
                                        <p className="text-green-600 text-sm mb-3">
                                            Dokumen Anda sudah siap. Silakan unduh atau hubungi kantor desa untuk pengambilan.
                                        </p>
                                        <a
                                            href={result.request.completedDocuments}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            <Download size={18} />
                                            Unduh Dokumen
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* History Timeline */}
                        {result.history && result.history.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                                <h3 className="text-lg font-bold text-slate-800 mb-6">Riwayat Status</h3>
                                <div className="space-y-4">
                                    {result.history.map((item, index) => (
                                        <div
                                            key={item.id}
                                            className={`relative pl-8 pb-4 ${index !== result.history.length - 1 ? 'border-l-2 border-slate-200' : ''}`}
                                        >
                                            <div className={`absolute left-0 top-0 w-4 h-4 rounded-full -translate-x-1/2 ${index === 0 ? 'bg-tangkas-primary' : 'bg-slate-300'
                                                }`} />
                                            <div className="ml-4">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium ${getStatusConfig(item.newStatus).color}`}>
                                                        {getStatusConfig(item.newStatus).label}
                                                    </span>
                                                </div>
                                                {item.notes && (
                                                    <p className="text-slate-600 text-sm mb-1">{item.notes}</p>
                                                )}
                                                <p className="text-slate-400 text-xs">
                                                    {formatDate(item.changedAt)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default TrackStatus;
