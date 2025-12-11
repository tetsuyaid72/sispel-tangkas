import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getRequests, ServiceRequest, updateRequestStatus, deleteRequest } from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import {
    Clock,
    Loader2,
    CheckCircle,
    XCircle,
    FileText,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Trash2,
    Eye,
    AlertCircle
} from 'lucide-react';

type StatusFilter = 'all' | 'pending' | 'processing' | 'completed' | 'rejected';

export default function AdminRequests() {
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    const navigate = useNavigate();

    useEffect(() => {
        loadRequests();
    }, [pagination.page, statusFilter]);

    const loadRequests = async () => {
        try {
            setIsLoading(true);
            const data = await getRequests({
                page: pagination.page,
                limit: pagination.limit,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                search: searchQuery || undefined
            });
            setRequests(data.requests);
            setPagination(prev => ({
                ...prev,
                total: data.pagination.total,
                totalPages: data.pagination.totalPages
            }));
        } catch (err: any) {
            setError(err.message || 'Gagal memuat data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
        loadRequests();
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Yakin ingin menghapus pengajuan ini?')) return;

        try {
            await deleteRequest(id);
            loadRequests();
        } catch (err: any) {
            alert(err.message || 'Gagal menghapus');
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock size={16} />;
            case 'processing': return <Loader2 size={16} />;
            case 'completed': return <CheckCircle size={16} />;
            case 'rejected': return <XCircle size={16} />;
            default: return <FileText size={16} />;
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
        <AdminLayout title="Daftar Pengajuan">
            {/* Filters */}
            <div className="filters-section">
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-input-wrapper">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Cari nama, nomor HP, atau nomor tracking..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="search-button">Cari</button>
                </form>

                <div className="status-filters">
                    <Filter size={18} />
                    {(['all', 'pending', 'processing', 'completed', 'rejected'] as StatusFilter[]).map((status) => (
                        <button
                            key={status}
                            className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
                            onClick={() => {
                                setStatusFilter(status);
                                setPagination(prev => ({ ...prev, page: 1 }));
                            }}
                        >
                            {status === 'all' ? 'Semua' : getStatusLabel(status)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="loading-state">
                    <Loader2 className="spinner" size={32} />
                    <p>Memuat data...</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <AlertCircle size={32} />
                    <p>{error}</p>
                    <button onClick={loadRequests}>Coba Lagi</button>
                </div>
            ) : (
                <>
                    <div className="table-container">
                        <table className="requests-table">
                            <thead>
                                <tr>
                                    <th>No. Tracking</th>
                                    <th>Pemohon</th>
                                    <th>No. HP</th>
                                    <th>Layanan</th>
                                    <th>Status</th>
                                    <th>Tanggal</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="empty-cell">
                                            Tidak ada pengajuan ditemukan
                                        </td>
                                    </tr>
                                ) : (
                                    requests.map((request) => (
                                        <tr key={request.id}>
                                            <td>
                                                <code>{request.trackingNumber}</code>
                                            </td>
                                            <td>{request.applicantName}</td>
                                            <td>{request.applicantPhone}</td>
                                            <td>{request.serviceTitle}</td>
                                            <td>
                                                <span className={`status-badge ${request.status}`}>
                                                    {getStatusIcon(request.status)}
                                                    {getStatusLabel(request.status)}
                                                </span>
                                            </td>
                                            <td>{formatDate(request.createdAt)}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="action-btn view"
                                                        onClick={() => navigate(`/admin/requests/${request.id}`)}
                                                        title="Lihat Detail"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        className="action-btn delete"
                                                        onClick={() => handleDelete(request.id)}
                                                        title="Hapus"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="pagination">
                            <span className="pagination-info">
                                Halaman {pagination.page} dari {pagination.totalPages} ({pagination.total} data)
                            </span>
                            <div className="pagination-buttons">
                                <button
                                    disabled={pagination.page === 1}
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                >
                                    <ChevronLeft size={18} />
                                    Sebelumnya
                                </button>
                                <button
                                    disabled={pagination.page === pagination.totalPages}
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                >
                                    Berikutnya
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            <style>{`
                .filters-section {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 24px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }
                
                .search-form {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 16px;
                }
                
                .search-input-wrapper {
                    flex: 1;
                    position: relative;
                }
                
                .search-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                }
                
                .search-input-wrapper input {
                    width: 100%;
                    padding: 12px 12px 12px 42px;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 14px;
                    box-sizing: border-box;
                }
                
                .search-input-wrapper input:focus {
                    outline: none;
                    border-color: #059669;
                }
                
                .search-button {
                    padding: 12px 24px;
                    background: #059669;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                }
                
                .search-button:hover {
                    background: #047857;
                }
                
                .status-filters {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #64748b;
                }
                
                .filter-btn {
                    padding: 8px 16px;
                    border: 1px solid #e5e7eb;
                    background: white;
                    border-radius: 20px;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .filter-btn:hover {
                    border-color: #059669;
                    color: #059669;
                }
                
                .filter-btn.active {
                    background: #059669;
                    border-color: #059669;
                    color: white;
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
                
                .table-container {
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }
                
                .requests-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                
                .requests-table th {
                    text-align: left;
                    padding: 14px 16px;
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
                    font-size: 14px;
                }
                
                .requests-table code {
                    background: #f1f5f9;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
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
                    font-size: 12px;
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
                
                .action-buttons {
                    display: flex;
                    gap: 8px;
                }
                
                .action-btn {
                    padding: 8px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .action-btn.view {
                    background: #dbeafe;
                    color: #2563eb;
                }
                
                .action-btn.view:hover {
                    background: #bfdbfe;
                }
                
                .action-btn.delete {
                    background: #fee2e2;
                    color: #dc2626;
                }
                
                .action-btn.delete:hover {
                    background: #fecaca;
                }
                
                .pagination {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 20px;
                    padding: 16px 20px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }
                
                .pagination-info {
                    color: #64748b;
                    font-size: 14px;
                }
                
                .pagination-buttons {
                    display: flex;
                    gap: 12px;
                }
                
                .pagination-buttons button {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 16px;
                    border: 1px solid #e5e7eb;
                    background: white;
                    border-radius: 8px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .pagination-buttons button:hover:not(:disabled) {
                    border-color: #059669;
                    color: #059669;
                }
                
                .pagination-buttons button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                @media (max-width: 768px) {
                    .search-form {
                        flex-direction: column;
                    }
                    
                    .status-filters {
                        flex-wrap: wrap;
                    }
                    
                    .requests-table th:nth-child(3),
                    .requests-table td:nth-child(3),
                    .requests-table th:nth-child(4),
                    .requests-table td:nth-child(4) {
                        display: none;
                    }
                    
                    .pagination {
                        flex-direction: column;
                        gap: 12px;
                    }
                }
            `}</style>
        </AdminLayout>
    );
}
