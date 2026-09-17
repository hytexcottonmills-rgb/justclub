/**
 * Cloudflare Edge & D1 Backend Client Service for JustClub
 * Fully compatible with Cloudflare Pages Functions (/api/*) and offline-first LocalStorage fallback.
 */

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('justclub_jwt_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('justclub_jwt_token', token);
  } else {
    localStorage.removeItem('justclub_jwt_token');
  }
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    // If backend is unreachable or local development offline, log and propagate
    console.warn(`[API Client] Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Auth
  auth: {
    login: async (email: string, passwordHash: string) => {
      return request<{ success: boolean; token?: string; user?: any; error?: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: passwordHash })
      });
    },
    googleLogin: async (credential: string) => {
      return request<{ success: boolean; token?: string; user?: any; error?: string }>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential })
      });
    },
    verify: async () => {
      return request<{ success: boolean; user?: any; error?: string }>('/auth/verify');
    }
  },

  // Club Tenant Profiles
  club: {
    getProfile: async () => request<{ success: boolean; profile: any }>('/club/profile'),
    updateProfile: async (profile: any) => request<{ success: boolean }>('/club/profile', {
      method: 'PUT',
      body: JSON.stringify(profile)
    })
  },

  // Support Helpdesk
  support: {
    createTicket: async (ticket: any) => request<{ success: boolean; id: string }>('/support/tickets', {
      method: 'POST',
      body: JSON.stringify(ticket)
    })
  },

  // Assets (Tables, Consoles, Simulators)
  assets: {
    getAll: async () => request<{ success: boolean; assets: any[] }>('/assets'),
    create: async (asset: any) => request<{ success: boolean; id: string }>('/assets', {
      method: 'POST',
      body: JSON.stringify(asset)
    }),
    update: async (id: string, asset: any) => request<{ success: boolean }>(`/assets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(asset)
    }),
    delete: async (id: string) => request<{ success: boolean }>(`/assets/${id}`, {
      method: 'DELETE'
    })
  },

  // Customer Ledgers & CRM
  customers: {
    getAll: async () => request<{ success: boolean; customers: any[] }>('/customers'),
    create: async (customer: any) => request<{ success: boolean; id: string }>('/customers', {
      method: 'POST',
      body: JSON.stringify(customer)
    }),
    updateLedger: async (id: string, deltaAmount: number, reason: string) => request<{ success: boolean }>(`/customers/${id}/ledger`, {
      method: 'POST',
      body: JSON.stringify({ deltaAmount, reason })
    })
  },

  // Bar & Café Inventory
  bar: {
    getAll: async () => request<{ success: boolean; barItems: any[] }>('/bar_items'),
    create: async (item: any) => request<{ success: boolean; id: string }>('/bar_items', {
      method: 'POST',
      body: JSON.stringify(item)
    }),
    updateStock: async (id: string, deltaStock: number) => request<{ success: boolean }>(`/bar_items/${id}/stock`, {
      method: 'POST',
      body: JSON.stringify({ deltaStock })
    }),
    update: async (id: string, item: any) => request<{ success: boolean }>(`/bar_items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item)
    }),
    delete: async (id: string) => request<{ success: boolean }>(`/bar_items/${id}`, {
      method: 'DELETE'
    })
  },

  // Game Sessions & Timers
  sessions: {
    getAllActive: async () => request<{ success: boolean; sessions: any[] }>('/sessions'),
    start: async (session: any) => request<{ success: boolean; id: string }>('/sessions', {
      method: 'POST',
      body: JSON.stringify(session)
    }),
    pause: async (id: string) => request<{ success: boolean }>(`/sessions/${id}/pause`, { method: 'POST' }),
    resume: async (id: string) => request<{ success: boolean }>(`/sessions/${id}/resume`, { method: 'POST' }),
    addBarOrder: async (id: string, order: any) => request<{ success: boolean }>(`/sessions/${id}/bar_orders`, {
      method: 'POST',
      body: JSON.stringify(order)
    }),
    end: async (id: string, settlementData?: any) => request<{ success: boolean }>(`/sessions/${id}/end`, {
      method: 'POST',
      body: JSON.stringify(settlementData || {})
    })
  },

  // Cashfree Gateway Config & Invoices
  cashfree: {
    getConfig: async () => request<{ success: boolean; config: any }>('/cashfree/config'),
    saveConfig: async (config: any) => request<{ success: boolean }>('/cashfree/config', {
      method: 'POST',
      body: JSON.stringify(config)
    }),
    createOrder: async (orderPayload: any) => request<{ success: boolean; paymentSessionId: string; orderId: string }>('/cashfree/create-order', {
      method: 'POST',
      body: JSON.stringify(orderPayload)
    }),
    verifyOrder: async (orderId: string) => request<{ success: boolean; message: string }>('/cashfree/verify-order', {
      method: 'POST',
      body: JSON.stringify({ orderId })
    })
  },

  // Superadmin SaaS Controls
  admin: {
    getTenants: async () => request<{ success: boolean; tenants: any[] }>('/admin/tenants'),
    toggleTenantStatus: async (tenantId: string) => request<{ success: boolean; newStatus: string }>(`/admin/tenants/${tenantId}/toggle`, {
      method: 'POST'
    }),
    getAuditLogs: async () => request<{ success: boolean; logs: any[] }>('/admin/audit_logs'),
    getTickets: async () => request<{ success: boolean; tickets: any[] }>('/admin/tickets'),
    updateTicketStatus: async (ticketId: string, status: string) => request<{ success: boolean }>(`/admin/tickets/${ticketId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status })
    })
  }
};
