import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getStats, getRequests, ServiceRequest } from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import {
    Clock,
    Loader2,
    CheckCircle,
    XCircle,
    FileText,
    ChevronRight,
    AlertCircle
} from 'lucide-react';

interface Stats {
    pending: number;
    processing: number;
    completed: number;
    rejected: number;
    total: number;
}

export default function Dashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentRequests, setRecentRequests] = useState<ServiceRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [statsData, requestsData] = await Promise.all([
                getStats(),
                getRequests({ limit: 5 })
            ]);
            setStats(statsData);
            setRecentRequests(requestsData.requests);
        } catch (err: any) {
            setError(err.message || 'Gagal memuat data');
        } finally {
            setIsLoading(false);
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
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AdminLayout title="Dashboard">
            {isLoading ? (
                <div className="loading-state">
                    <Loader2 className="spinner" size={32} />
                    <p>Memuat data...</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <AlertCircle size={32} />
                    <p>{error}</p>
                    <button onClick={loadData}>Coba Lagi</button>
                </div>
            ) : (
                <>
                    {/* Stats cards */}
                    <div className="stats-grid">
                        <div className="stat-card pending">
                            <div className="stat-icon">
                                <Clock size={24} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">{stats?.pending || 0}</span>
                                <span className="stat-label">Menunggu</span>
                            </div>
                        </div>

                        <div className="stat-card processing">
                            <div className="stat-icon">
                                <Loader2 size={24} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">{stats?.processing || 0}</span>
                                <span className="stat-label">Diproses</span>
                            </div>
                        </div>

                        <div className="stat-card completed">
                            <div className="stat-icon">
                                <CheckCircle size={24} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">{stats?.completed || 0}</span>
                                <span className="stat-label">Selesai</span>
                            </div>
                        </div>

                        <div className="stat-card rejected">
                            <div className="stat-icon">
                                <XCircle size={24} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">{stats?.rejected || 0}</span>
                                <span className="stat-label">Ditolak</span>
                            </div>
                        </div>
                    </div>

                    {/* Recent requests */}
                    <div className="recent-section">
                        <div className="section-header">
                            <h2>Pengajuan Terbaru</h2>
                            <button
                                className="view-all-button"
                                onClick={() => navigate('/admin/requests')}
                            >
                                Lihat Semua
                                <ChevronRight size={18} />
                            </button>
                        </div>

                        <div className="requests-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>No. Tracking</th>
                                        <th>Pemohon</th>
                                        <th>Layanan</th>
                                        <th>Status</th>
                                        <th>Tanggal</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="empty-cell">
                                                Belum ada pengajuan
                                            </td>
                                        </tr>
                                    ) : (
                                        recentRequests.map((request) => (
                                            <tr key={request.id}>
                                                <td data-label="Tracking">
                                                    <code>{request.trackingNumber}</code>
                                                </td>
                                                <td data-label="Pemohon">{request.applicantName}</td>
                                                <td data-label="Layanan">{request.serviceTitle}</td>
                                                <td data-label="Status">
                                                    <span className={`status-badge ${request.status}`}>
                                                        {getStatusIcon(request.status)}
                                                        {getStatusLabel(request.status)}
                                                    </span>
                                                </td>
                                                <td data-label="Tanggal">{formatDate(request.createdAt)}</td>
                                                <td data-label="">
                                                    <button
                                                        className="detail-button"
                                                        onClick={() => navigate(`/admin/requests/${request.id}`)}
                                                    >
                                                        Detail
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            <style>{`
                .loading-state,
                .error-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 20px;
                    text-align: center;
                    color: #64748b;
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
                
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 32px;
                }
                
                .stat-card {
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }
                
                .stat-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .stat-card.pending .stat-icon {
                    background: #fef3c7;
                    color: #d97706;
                }
                
                .stat-card.processing .stat-icon {
                    background: #dbeafe;
                    color: #2563eb;
                }
                
                .stat-card.completed .stat-icon {
                    background: #d1fae5;
                    color: #059669;
                }
                
                .stat-card.rejected .stat-icon {
                    background: #fee2e2;
                    color: #dc2626;
                }
                
                .stat-content {
                    display: flex;
                    flex-direction: column;
                }
                
                .stat-value {
                    font-size: 32px;
                    font-weight: 700;
                    color: #1e3a5f;
                }
                
                .stat-label {
                    color: #64748b;
                    font-size: 14px;
                }
                
                .recent-section {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                    overflow: hidden;
                }
                
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 24px;
                    border-bottom: 1px solid #e2e8f0;
                }
                
                .section-header h2 {
                    font-size: 18px;
                    font-weight: 600;
                    color: #1e3a5f;
                    margin: 0;
                }
                
                .view-all-button {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    background: none;
                    border: none;
                    color: #059669;
                    font-weight: 500;
                    cursor: pointer;
                }
                
                .view-all-button:hover {
                    text-decoration: underline;
                }
                
                .requests-table {
                    overflow-x: auto;
                }
                
                .requests-table table {
                    width: 100%;
                    border-collapse: collapse;
                }
                
                .requests-table th {
                    text-align: left;
                    padding: 12px 16px;
                    background: #f8fafc;
                    color: #64748b;
                    font-weight: 600;
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .requests-table td {
                    padding: 16px;
                    border-top: 1px solid #e2e8f0;
                    color: #374151;
                }
                
                .requests-table code {
                    background: #f1f5f9;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 13px;
                    color: #1e3a5f;
                }
                
                .empty-cell {
                    text-align: center;
                    color: #94a3b8;
                    padding: 40px !important;
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
                
                .detail-button {
                    padding: 6px 12px;
                    background: #f1f5f9;
                    border: none;
                    border-radius: 6px;
                    color: #1e3a5f;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                
                .detail-button:hover {
                    background: #e2e8f0;
                }
                
                @media (max-width: 640px) {
                    .stats-grid {
                        grid-template-columns: 1fr 1fr;
                        gap: 12px;
                    }
                    
                    .stat-card {
                        padding: 16px;
                    }
                    
                    .stat-number {
                        font-size: 28px;
                    }
                    
                    .stat-label {
                        font-size: 12px;
                    }
                }

                @media (max-width: 768px) {
                    .requests-table {
                        display: block;
                    }
                    
                    .requests-table thead {
                        display: none;
                    }
                    
                    .requests-table tbody {
                        display: flex;
                        flex-direction: column;
                        gap: 12px;
                    }
                    
                    .requests-table tr {
                        display: flex;
                        flex-direction: column;
                        background: #f8fafc;
                        border-radius: 12px;
                        padding: 16px;
                        gap: 8px;
                        border: 1px solid #e2e8f0;
                    }
                    
                    .requests-table td {
                        padding: 0;
                        border: none;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    
                    .requests-table td::before {
                        content: attr(data-label);
                        font-weight: 600;
                        color: #64748b;
                        font-size: 12px;
                        text-transform: uppercase;
                    }
                    
                    .requests-table code {
                        font-size: 12px;
                    }
                    
                    .empty-cell {
                        text-align: center;
                    }
                    
                    .recent-section h2 {
                        font-size: 18px;
                    }
                }
            `}</style>
        </AdminLayout>
    );
}
