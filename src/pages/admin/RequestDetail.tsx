import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { getRequestDetail, updateRequestStatus, ServiceRequest } from '../../lib/api';
import {
    ArrowLeft,
    Clock,
    Loader2,
    CheckCircle,
    XCircle,
    FileText,
    User,
    Phone,
    MapPin,
    CreditCard,
    Calendar,
    MessageSquare,
    AlertCircle,
    Save,
    Download,
    Paperclip
} from 'lucide-react';

interface StatusHistory {
    id: number;
    previousStatus?: string;
    newStatus: string;
    notes?: string;
    changedBy?: number;
    changedAt: string;
}

export default function AdminRequestDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [request, setRequest] = useState<ServiceRequest | null>(null);
    const [history, setHistory] = useState<StatusHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [newStatus, setNewStatus] = useState('');
    const [statusNotes, setStatusNotes] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('');

    useEffect(() => {
        if (id) {
            loadRequestDetail();
        }
    }, [id]);

    const loadRequestDetail = async () => {
        try {
            setIsLoading(true);
            const data = await getRequestDetail(parseInt(id!, 10));
            setRequest(data.request);
            setHistory(data.history);
            setNewStatus(data.request.status);
        } catch (err: any) {
            setError(err.message || 'Gagal memuat data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!request || !newStatus) return;

        try {
            setIsUpdating(true);
            setUpdateMessage('');
            await updateRequestStatus(request.id, newStatus as any, statusNotes || undefined);
            setUpdateMessage('Status berhasil diperbarui!');
            setStatusNotes('');
            loadRequestDetail();
        } catch (err: any) {
            setUpdateMessage(err.message || 'Gagal memperbarui status');
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock size={18} />;
            case 'processing': return <Loader2 size={18} />;
            case 'completed': return <CheckCircle size={18} />;
            case 'rejected': return <XCircle size={18} />;
            default: return <FileText size={18} />;
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
        <AdminLayout title="Detail Pengajuan">
            <button className="back-button" onClick={() => navigate('/admin/requests')}>
                <ArrowLeft size={18} />
                Kembali ke Daftar
            </button>

            {isLoading ? (
                <div className="loading-state">
                    <Loader2 className="spinner" size={32} />
                    <p>Memuat data...</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <AlertCircle size={32} />
                    <p>{error}</p>
                    <button onClick={loadRequestDetail}>Coba Lagi</button>
                </div>
            ) : request && (
                <div className="detail-grid">
                    {/* Request Info Card */}
                    <div className="detail-card info-card">
                        <div className="card-header">
                            <h2>Informasi Pengajuan</h2>
                            <span className={`status-badge large ${request.status}`}>
                                {getStatusIcon(request.status)}
                                {getStatusLabel(request.status)}
                            </span>
                        </div>

                        <div className="info-row">
                            <FileText size={18} />
                            <div>
                                <label>Nomor Tracking</label>
                                <code>{request.trackingNumber}</code>
                            </div>
                        </div>

                        <div className="info-row">
                            <FileText size={18} />
                            <div>
                                <label>Layanan</label>
                                <span>{request.serviceTitle}</span>
                            </div>
                        </div>

                        <div className="info-row">
                            <Calendar size={18} />
                            <div>
                                <label>Tanggal Pengajuan</label>
                                <span>{formatDate(request.createdAt)}</span>
                            </div>
                        </div>

                        {request.completedAt && (
                            <div className="info-row">
                                <Calendar size={18} />
                                <div>
                                    <label>Tanggal Selesai</label>
                                    <span>{formatDate(request.completedAt)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Applicant Info Card */}
                    <div className="detail-card">
                        <div className="card-header">
                            <h2>Data Pemohon</h2>
                        </div>

                        <div className="info-row">
                            <User size={18} />
                            <div>
                                <label>Nama Lengkap</label>
                                <span>{request.applicantName}</span>
                            </div>
                        </div>

                        <div className="info-row">
                            <Phone size={18} />
                            <div>
                                <label>Nomor HP</label>
                                <span>{request.applicantPhone}</span>
                            </div>
                        </div>

                        {request.applicantNik && (
                            <div className="info-row">
                                <CreditCard size={18} />
                                <div>
                                    <label>NIK</label>
                                    <span>{request.applicantNik}</span>
                                </div>
                            </div>
                        )}

                        {request.applicantAddress && (
                            <div className="info-row">
                                <MapPin size={18} />
                                <div>
                                    <label>Alamat</label>
                                    <span>{request.applicantAddress}</span>
                                </div>
                            </div>
                        )}

                        {request.notes && (
                            <div className="info-row">
                                <MessageSquare size={18} />
                                <div>
                                    <label>Catatan</label>
                                    <span>{request.notes}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Documents Card */}
                    {request.documents && (() => {
                        try {
                            const docs = JSON.parse(request.documents);
                            if (docs && docs.length > 0) {
                                return (
                                    <div className="detail-card documents-card">
                                        <div className="card-header">
                                            <h2>Dokumen Persyaratan</h2>
                                            <span className="doc-count">{docs.length} file</span>
                                        </div>
                                        <div className="documents-list">
                                            {docs.map((doc: any, index: number) => (
                                                <div key={index} className="document-item">
                                                    <div className="doc-info">
                                                        <Paperclip size={18} />
                                                        <div>
                                                            <span className="doc-name">{doc.filename || doc.label || `Dokumen ${index + 1}`}</span>
                                                            {doc.label && <span className="doc-label">{doc.label}</span>}
                                                        </div>
                                                    </div>
                                                    {doc.path && (
                                                        <a
                                                            href={`${window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3001' : `http://${window.location.hostname}:3001`}/uploads/${doc.path}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="download-btn"
                                                            download
                                                        >
                                                            <Download size={16} />
                                                            Download
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        } catch {
                            return null;
                        }
                    })()}
                    <div className="detail-card update-card">
                        <div className="card-header">
                            <h2>Update Status</h2>
                        </div>

                        <form onSubmit={handleStatusUpdate}>
                            <div className="form-group">
                                <label>Status Baru</label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    disabled={isUpdating}
                                >
                                    <option value="pending">Menunggu</option>
                                    <option value="processing">Diproses</option>
                                    <option value="completed">Selesai</option>
                                    <option value="rejected">Ditolak</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Catatan (Opsional)</label>
                                <textarea
                                    value={statusNotes}
                                    onChange={(e) => setStatusNotes(e.target.value)}
                                    placeholder="Tambahkan catatan untuk perubahan status..."
                                    disabled={isUpdating}
                                    rows={3}
                                />
                            </div>

                            {updateMessage && (
                                <div className={`update-message ${updateMessage.includes('berhasil') ? 'success' : 'error'}`}>
                                    {updateMessage}
                                </div>
                            )}

                            <button type="submit" className="update-button" disabled={isUpdating}>
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="spinner" size={18} />
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Simpan Perubahan
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Status History Card */}
                    <div className="detail-card history-card">
                        <div className="card-header">
                            <h2>Riwayat Status</h2>
                        </div>

                        <div className="timeline">
                            {history.map((item, index) => (
                                <div key={item.id} className="timeline-item">
                                    <div className={`timeline-dot ${item.newStatus}`}>
                                        {getStatusIcon(item.newStatus)}
                                    </div>
                                    <div className="timeline-content">
                                        <div className="timeline-header">
                                            <span className={`status-badge small ${item.newStatus}`}>
                                                {getStatusLabel(item.newStatus)}
                                            </span>
                                            <span className="timeline-date">{formatDate(item.changedAt)}</span>
                                        </div>
                                        {item.notes && <p className="timeline-notes">{item.notes}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .back-button {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 16px;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    color: #374151;
                    font-weight: 500;
                    cursor: pointer;
                    margin-bottom: 24px;
                    transition: all 0.2s;
                }
                
                .back-button:hover {
                    border-color: #059669;
                    color: #059669;
                }
                
                .loading-state,
                .error-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 20px;
                    text-align: center;
                    color: #64748b;
                    background: white;
                    border-radius: 12px;
                }
                
                .loading-state .spinner {
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                .error-state button {
                    margin-top: 16px;
                    padding: 8px 16px;
                    background: #059669;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                }
                
                .detail-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 24px;
                }
                
                .detail-card {
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }
                
                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid #e5e7eb;
                }
                
                .card-header h2 {
                    font-size: 18px;
                    font-weight: 600;
                    color: #1e3a5f;
                    margin: 0;
                }
                
                .info-row {
                    display: flex;
                    gap: 12px;
                    padding: 12px 0;
                    border-bottom: 1px solid #f1f5f9;
                }
                
                .info-row:last-child {
                    border-bottom: none;
                }
                
                .info-row svg {
                    color: #94a3b8;
                    flex-shrink: 0;
                    margin-top: 2px;
                }
                
                .info-row div {
                    flex: 1;
                }
                
                .info-row label {
                    display: block;
                    font-size: 12px;
                    color: #64748b;
                    margin-bottom: 4px;
                }
                
                .info-row span {
                    color: #374151;
                    font-weight: 500;
                }
                
                .info-row code {
                    background: #f1f5f9;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 13px;
                    color: #1e3a5f;
                }
                
                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 500;
                }
                
                .status-badge.large {
                    padding: 8px 16px;
                    font-size: 14px;
                }
                
                .status-badge.small {
                    padding: 4px 10px;
                    font-size: 12px;
                }
                
                .status-badge.pending {
                    background: #fef3c7;
                    color: #d97706;
                }
                
                .status-badge.processing {
                    background: #dbeafe;
                    color: #2563eb;
                }
                
                .status-badge.completed {
                    background: #d1fae5;
                    color: #059669;
                }
                
                .status-badge.rejected {
                    background: #fee2e2;
                    color: #dc2626;
                }
                
                .update-card form {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                
                .form-group label {
                    font-weight: 500;
                    color: #374151;
                    font-size: 14px;
                }
                
                .form-group select,
                .form-group textarea {
                    padding: 12px;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 14px;
                    font-family: inherit;
                }
                
                .form-group select:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: #059669;
                }
                
                .update-message {
                    padding: 12px;
                    border-radius: 8px;
                    font-size: 14px;
                }
                
                .update-message.success {
                    background: #d1fae5;
                    color: #059669;
                }
                
                .update-message.error {
                    background: #fee2e2;
                    color: #dc2626;
                }
                
                .update-button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 12px 24px;
                    background: #059669;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                
                .update-button:hover:not(:disabled) {
                    background: #047857;
                }
                
                .update-button:disabled {
                    background: #9ca3af;
                    cursor: not-allowed;
                }
                
                .update-button .spinner {
                    animation: spin 0.8s linear infinite;
                }
                
                .history-card {
                    grid-column: span 2;
                }
                
                .timeline {
                    position: relative;
                }
                
                .timeline-item {
                    display: flex;
                    gap: 16px;
                    padding-bottom: 24px;
                    position: relative;
                }
                
                .timeline-item:last-child {
                    padding-bottom: 0;
                }
                
                .timeline-item::before {
                    content: '';
                    position: absolute;
                    left: 17px;
                    top: 36px;
                    bottom: 0;
                    width: 2px;
                    background: #e5e7eb;
                }
                
                .timeline-item:last-child::before {
                    display: none;
                }
                
                .timeline-dot {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                
                .timeline-dot.pending {
                    background: #fef3c7;
                    color: #d97706;
                }
                
                .timeline-dot.processing {
                    background: #dbeafe;
                    color: #2563eb;
                }
                
                .timeline-dot.completed {
                    background: #d1fae5;
                    color: #059669;
                }
                
                .timeline-dot.rejected {
                    background: #fee2e2;
                    color: #dc2626;
                }
                
                .timeline-content {
                    flex: 1;
                    padding-top: 4px;
                }
                
                .timeline-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 8px;
                }
                
                .timeline-date {
                    font-size: 13px;
                    color: #64748b;
                }
                
                .timeline-notes {
                    margin: 0;
                    color: #64748b;
                    font-size: 14px;
                }
                
                @media (max-width: 768px) {
                    .detail-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .history-card {
                        grid-column: span 1;
                    }
                }

                /* Documents Section */
                .documents-card {
                    grid-column: span 2;
                }

                .doc-count {
                    background: #e0f2fe;
                    color: #0284c7;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 500;
                }

                .documents-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .document-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    gap: 12px;
                }

                .doc-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex: 1;
                    min-width: 0;
                }

                .doc-info svg {
                    color: #0891b2;
                    flex-shrink: 0;
                }

                .doc-info > div {
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                }

                .doc-name {
                    font-weight: 500;
                    color: #374151;
                    font-size: 14px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .doc-label {
                    font-size: 12px;
                    color: #64748b;
                    margin-top: 2px;
                }

                .download-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 16px;
                    background: #059669;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 500;
                    text-decoration: none;
                    cursor: pointer;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }

                .download-btn:hover {
                    background: #047857;
                }

                @media (max-width: 768px) {
                    .documents-card {
                        grid-column: span 1;
                    }

                    .document-item {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .download-btn {
                        justify-content: center;
                    }
                }
            `}</style>
        </AdminLayout>
    );
}
