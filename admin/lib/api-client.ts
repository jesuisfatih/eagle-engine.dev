const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    
    // Load token from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('eagle_admin_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('eagle_admin_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('eagle_admin_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // Companies
  async getCompanies(params?: { status?: string; search?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/companies${query ? `?${query}` : ''}`);
  }

  async getCompany(id: string) {
    return this.request(`/api/v1/companies/${id}`);
  }

  async createCompany(data: any) {
    return this.request('/api/v1/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCompanyStats() {
    return this.request('/api/v1/companies/stats');
  }

  // Pricing Rules
  async getPricingRules(params?: { isActive?: boolean; companyId?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/pricing/rules${query ? `?${query}` : ''}`);
  }

  async createPricingRule(data: any) {
    return this.request('/api/v1/pricing/rules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePricingRule(id: string, data: any) {
    return this.request(`/api/v1/pricing/rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePricingRule(id: string) {
    return this.request(`/api/v1/pricing/rules/${id}`, {
      method: 'DELETE',
    });
  }

  // Orders
  async getOrders(params?: { companyId?: string; status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/orders${query ? `?${query}` : ''}`);
  }

  async getOrderStats() {
    return this.request('/api/v1/orders/stats');
  }

  // Merchants
  async getMerchant() {
    return this.request('/api/v1/merchants/me');
  }

  async getMerchantStats() {
    return this.request('/api/v1/merchants/stats');
  }

  async updateSettings(settings: any) {
    return this.request('/api/v1/merchants/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Sync
  async triggerInitialSync() {
    return this.request('/api/v1/sync/initial', {
      method: 'POST',
    });
  }

  async getSyncStatus() {
    return this.request('/api/v1/sync/status');
  }

  // Analytics
  async getAnalytics(params?: { from?: string; to?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/events/analytics${query ? `?${query}` : ''}`);
  }
}

export const apiClient = new ApiClient(API_URL);

