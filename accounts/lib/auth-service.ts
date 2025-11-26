/**
 * Eagle B2B - Silent Authentication Service
 * Seamless Shopify SSO without user interruption
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';

export class AuthService {
  private static instance: AuthService;
  private tokenRefreshTimer: NodeJS.Timeout | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Silent Authentication - No user interruption
   */
  async silentAuth(shopifyCustomerId: string, email: string): Promise<boolean> {
    try {
      // Create hidden iframe for background auth
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.style.position = 'absolute';
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      document.body.appendChild(iframe);

      // Background authentication
      const response = await fetch(
        `${API_URL}/api/v1/auth/shopify-callback?customer_id=${shopifyCustomerId}&email=${email}`,
        { 
          credentials: 'include',
          mode: 'cors'
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        if (data.token) {
          this.setToken(data.token);
          this.setUserData(data.user);
          this.startTokenRefresh();
          
          // Cleanup
          document.body.removeChild(iframe);
          return true;
        }
      }

      document.body.removeChild(iframe);
      return false;
    } catch (error) {
      console.error('Silent auth failed:', error);
      return false;
    }
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    localStorage.setItem('eagle_token', token);
    sessionStorage.setItem('eagle_session', 'active');
    
    // Set cookie for cross-domain
    document.cookie = `eagle_auth=${token}; path=/; max-age=2592000; secure; samesite=lax`;
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    return localStorage.getItem('eagle_token');
  }

  /**
   * Set user data
   */
  setUserData(user: any): void {
    localStorage.setItem('eagle_userId', user.id);
    localStorage.setItem('eagle_companyId', user.companyId);
    localStorage.setItem('eagle_userEmail', user.email);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const session = sessionStorage.getItem('eagle_session');
    return !!(token && session === 'active');
  }

  /**
   * Auto token refresh - 1 hour before expiry
   */
  startTokenRefresh(): void {
    if (this.tokenRefreshTimer) {
      clearInterval(this.tokenRefreshTimer);
    }

    // Refresh every 6 hours (token valid for 7 days)
    this.tokenRefreshTimer = setInterval(async () => {
      await this.refreshToken();
    }, 6 * 60 * 60 * 1000);
  }

  /**
   * Refresh token silently
   */
  async refreshToken(): Promise<boolean> {
    try {
      const currentToken = this.getToken();
      if (!currentToken) return false;

      const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          this.setToken(data.token);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  /**
   * Logout
   */
  logout(): void {
    localStorage.removeItem('eagle_token');
    localStorage.removeItem('eagle_userId');
    localStorage.removeItem('eagle_companyId');
    localStorage.removeItem('eagle_userEmail');
    sessionStorage.removeItem('eagle_session');
    document.cookie = 'eagle_auth=; path=/; max-age=0';
    
    if (this.tokenRefreshTimer) {
      clearInterval(this.tokenRefreshTimer);
    }
  }

  /**
   * Shopify SSO - Generate Multipass URL
   */
  async getShopifySsoUrl(returnTo?: string): Promise<string | null> {
    try {
      const token = this.getToken();
      if (!token) return null;

      const response = await fetch(`${API_URL}/api/v1/auth/shopify-sso`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ returnTo }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.ssoUrl;
      }

      return null;
    } catch (error) {
      console.error('Shopify SSO URL generation failed:', error);
      return null;
    }
  }
}

// Global instance
export const authService = AuthService.getInstance();

