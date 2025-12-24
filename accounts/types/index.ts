/**
 * Accounts Portal Types
 * Re-exports from shared types with accounts-specific additions
 */

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  accountType: 'b2b' | 'normal';
  email: string;
  verificationCode: string;
  codeSent: boolean;
  emailVerified: boolean;
  skipEmailVerification: boolean;
  firstName: string;
  lastName: string;
  phone: string;
  companyName: string;
  taxId: string;
  billingAddress1: string;
  billingAddress2: string;
  billingCity: string;
  billingState: string;
  billingPostalCode: string;
  billingCountry: string;
  shippingSameAsBilling: boolean;
  shippingAddress1: string;
  shippingAddress2: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
  password: string;
  confirmPassword: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  companyId: string;
  merchantId?: string;
  isActive: boolean;
}

export interface AuthResponse {
  accessToken?: string;
  token?: string;
  refreshToken?: string;
  user: AuthUser;
}

// Product Types
export interface ProductVariant {
  id: string;
  shopifyVariantId: string;
  title: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  inventoryQuantity: number;
  option1?: string;
  option2?: string;
  option3?: string;
}

export interface Product {
  id: string;
  shopifyProductId: string;
  title: string;
  description?: string;
  vendor: string;
  productType?: string;
  handle: string;
  status: string;
  imageUrl?: string;
  images: { url: string; alt?: string }[];
  variants: ProductVariant[];
  options?: { name: string; values: string[] }[];
  tags?: string[];
}

export interface B2BPricing {
  variantId: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  minQty?: number;
  qtyBreaks?: { qty: number; price: number }[];
}

// Order Types
export interface OrderLineItem {
  id: string;
  title: string;
  variantTitle?: string;
  sku?: string;
  quantity: number;
  price: number;
  totalPrice: number;
  imageUrl?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  shopifyOrderId?: string;
  financialStatus: string;
  fulfillmentStatus: string;
  totalPrice: number;
  subtotalPrice: number;
  totalTax: number;
  currency: string;
  lineItems: OrderLineItem[];
  shippingAddress?: Address;
  billingAddress?: Address;
  createdAt: string;
  updatedAt?: string;
}

export interface Address {
  id?: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  countryCode: string;
  phone?: string;
  isDefault?: boolean;
}

// Cart Types
export interface CartItem {
  id: string;
  variantId: string;
  productId: string;
  title: string;
  variantTitle?: string;
  sku?: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  itemCount: number;
  currency: string;
}

// Dashboard Types
export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalSpent: number;
}

// User Profile Types
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  isActive: boolean;
  company?: {
    id: string;
    name: string;
    status: string;
  };
  addresses?: Address[];
  lastLoginAt?: string;
  createdAt: string;
}

// Form validation helpers
export interface FormFieldError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: FormFieldError[];
  loading: boolean;
  submitted: boolean;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
