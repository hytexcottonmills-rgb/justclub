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

async function request<T = any>(endpoint: string, options: RequestInit = {}, retries = 2, delay = 300): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
      });

      if (!res.ok) {
        if (res.status === 429) {
          throw new Error("Too many attempts, please wait a minute.");
        }
        const errData = await res.json().catch(() => ({}));
        if (errData.error === 'SUBSCRIPTION_REQUIRED') {
          throw new Error('SUBSCRIPTION_REQUIRED');
        }
        if (res.status === 402 || errData.error === 'TENANT_SUSPENDED') {
          throw new Error('TENANT_SUSPENDED');
        }
        // Retry on transient edge server glitches: 502, 503, 504
        if ([502, 503, 504].includes(res.status) && attempt < retries) {
          await new Promise(r => setTimeout(r, delay * Math.pow(2, attempt)));
          continue;
        }
        throw new Error(errData.error || `HTTP ${res.status}: ${res.statusText}`);
      }

      return await res.json();
    } catch (err) {
      if ((err as Error)?.message === "Too many attempts, please wait a minute.") {
        throw err;
      }
      // Retry transient network connectivity errors
      if (attempt < retries && (err instanceof TypeError || (err as any).name === 'AbortError')) {
        await new Promise(r => setTimeout(r, delay * Math.pow(2, attempt)));
        continue;
      }
      console.warn(`[API Client] Error on ${endpoint} (Attempt ${attempt + 1}/${retries + 1}):`, err);
      throw err;
    }
  }
  throw new Error(`API request to ${endpoint} failed after ${retries} retries`);
}

function buildQuery(limit?: number, offset?: number): string {
  const params = new URLSearchParams();
  if (limit !== undefined) params.append('limit', String(limit));
  if (offset !== undefined) params.append('offset', String(offset));
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

export const api = {
  // Auth
  auth: {
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
    getProfile: async () => request<{ success: boolean; profile: any; isViewOnly?: boolean; isSuspended?: boolean; daysRemaining?: number | null }>('/club/profile'),
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
    getAll: async (limit?: number, offset?: number) => request<{ success: boolean; assets: any[] }>(`/assets${buildQuery(limit, offset)}`),
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
    getAll: async (limit?: number, offset?: number) => request<{ success: boolean; customers: any[] }>(`/customers${buildQuery(limit, offset)}`),
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
    getAll: async (limit?: number, offset?: number) => request<{ success: boolean; barItems: any[] }>(`/bar_items${buildQuery(limit, offset)}`),
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
    getAllActive: async (limit?: number, offset?: number) => request<{ success: boolean; sessions: any[] }>(`/sessions${buildQuery(limit, offset)}`),
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

  // Razorpay Gateway Config & Invoices
  razorpay: {
    getConfig: async () => request<{ success: boolean; config: any }>('/razorpay/config'),
    saveConfig: async (config: any) => request<{ success: boolean }>('/razorpay/config', {
      method: 'POST',
      body: JSON.stringify(config)
    }),
    createOrder: async (orderPayload: any) => request<{ success: boolean; orderId: string; amount: number; currency: string; keyId: string }>('/razorpay/create-order', {
      method: 'POST',
      body: JSON.stringify(orderPayload)
    }),
    verifyOrder: async (verificationPayload: any) => request<{ success: boolean; message: string; order: any }>('/razorpay/verify-order', {
      method: 'POST',
      body: JSON.stringify(verificationPayload)
    })
  },

  // Superadmin SaaS Controls
  admin: {
    getSubscriptionSettings: async () => request<{ success: boolean; trialPeriodDays: number }>('/admin/subscription-settings'),
    updateSubscriptionSettings: async (trialPeriodDays: number) => request<{ success: boolean; trialPeriodDays: number }>('/admin/subscription-settings', {
      method: 'POST',
      body: JSON.stringify({ trialPeriodDays })
    }),
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
