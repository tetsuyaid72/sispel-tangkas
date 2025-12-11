// API client for Pelayanan Desa Tangkas

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Types
export interface ServiceRequest {
    id: number;
    trackingNumber: string;
    serviceId: string;
    serviceTitle: string;
    applicantName: string;
    applicantPhone: string;
    applicantAddress?: string;
    applicantNik?: string;
    notes?: string;
    documents?: string;
    status: 'pending' | 'processing' | 'completed' | 'rejected';
    adminNotes?: string;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
}

export interface SubmitRequestData {
    serviceId: string;
    serviceTitle: string;
    applicantName: string;
    applicantPhone: string;
    applicantAddress?: string;
    applicantNik?: string;
    notes?: string;
    documents?: string[];
}

export interface SubmitResponse {
    message: string;
    trackingNumber: string;
    request: ServiceRequest;
}

export interface TrackResponse {
    request: {
        trackingNumber: string;
        serviceTitle: string;
        applicantName: string;
        status: string;
        createdAt: string;
        updatedAt: string;
        completedAt?: string;
    };
    history: Array<{
        id: number;
        previousStatus?: string;
        newStatus: string;
        notes?: string;
        changedAt: string;
    }>;
}

// Submit a new service request
export async function submitRequest(data: SubmitRequestData): Promise<SubmitResponse> {
    const response = await fetch(`${API_BASE_URL}/requests`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Gagal mengirim pengajuan');
    }

    return response.json();
}

// Track request status by tracking number
export async function trackRequest(trackingNumber: string): Promise<TrackResponse> {
    const response = await fetch(`${API_BASE_URL}/requests/track/${encodeURIComponent(trackingNumber)}`);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Pengajuan tidak ditemukan');
    }

    return response.json();
}

// ============== ADMIN API ==============

// Store token in memory (use localStorage in production)
let authToken: string | null = localStorage.getItem('adminToken');

export function setAuthToken(token: string | null) {
    authToken = token;
    if (token) {
        localStorage.setItem('adminToken', token);
    } else {
        localStorage.removeItem('adminToken');
    }
}

export function getAuthToken(): string | null {
    return authToken;
}

// Helper for authenticated requests
async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
    if (!authToken) {
        throw new Error('Tidak terautentikasi');
    }

    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (response.status === 401) {
        setAuthToken(null);
        throw new Error('Sesi telah berakhir');
    }

    return response;
}

// Admin login
export async function adminLogin(username: string, password: string): Promise<{
    token: string;
    user: { id: number; username: string; name: string; role: string };
}> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login gagal');
    }

    const data = await response.json();
    setAuthToken(data.token);
    return data;
}

// Admin logout
export async function adminLogout(): Promise<void> {
    try {
        await authFetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
    } finally {
        setAuthToken(null);
    }
}

// Get current admin user
export async function getCurrentUser(): Promise<{ user: { id: number; username: string; name: string; role: string } }> {
    const response = await authFetch(`${API_BASE_URL}/auth/me`);
    if (!response.ok) throw new Error('Gagal mendapatkan info user');
    return response.json();
}

// Get dashboard stats
export async function getStats(): Promise<{
    pending: number;
    processing: number;
    completed: number;
    rejected: number;
    total: number;
}> {
    const response = await authFetch(`${API_BASE_URL}/requests/stats`);
    if (!response.ok) throw new Error('Gagal mendapatkan statistik');
    return response.json();
}

// Get requests list (admin)
export async function getRequests(params: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
} = {}): Promise<{
    requests: ServiceRequest[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.set('status', params.status);
    if (params.search) searchParams.set('search', params.search);
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());

    const response = await authFetch(`${API_BASE_URL}/requests?${searchParams}`);
    if (!response.ok) throw new Error('Gagal mendapatkan daftar pengajuan');
    return response.json();
}

// Get single request detail (admin)
export async function getRequestDetail(id: number): Promise<{
    request: ServiceRequest;
    history: Array<{
        id: number;
        previousStatus?: string;
        newStatus: string;
        notes?: string;
        changedBy?: number;
        changedAt: string;
    }>;
}> {
    const response = await authFetch(`${API_BASE_URL}/requests/${id}`);
    if (!response.ok) throw new Error('Pengajuan tidak ditemukan');
    return response.json();
}

// Update request status (admin)
export async function updateRequestStatus(
    id: number,
    status: 'pending' | 'processing' | 'completed' | 'rejected',
    notes?: string
): Promise<{ message: string; request: ServiceRequest }> {
    const response = await authFetch(`${API_BASE_URL}/requests/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes }),
    });
    if (!response.ok) throw new Error('Gagal memperbarui status');
    return response.json();
}

// Delete request (admin)
export async function deleteRequest(id: number): Promise<{ message: string }> {
    const response = await authFetch(`${API_BASE_URL}/requests/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Gagal menghapus pengajuan');
    return response.json();
}
