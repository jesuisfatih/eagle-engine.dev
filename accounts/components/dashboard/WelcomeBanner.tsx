'use client';

import React from 'react';
import Link from 'next/link';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils';
import type { EnhancedDashboardStats, Promotion } from '@/types';

// ============================================
// WELCOME BANNER
// ============================================

interface WelcomeBannerProps {
  userName: string;
  companyName: string;
  stats?: EnhancedDashboardStats;
  activePromotions?: Promotion[];
  isFirstLogin?: boolean;
}

export function WelcomeBanner({
  userName,
  companyName,
  stats,
  activePromotions = [],
  isFirstLogin = false,
}: WelcomeBannerProps) {
  const firstName = userName.split(' ')[0] || 'there';
  const greeting = getGreeting();

  return (
    <div className="card bg-primary text-white mb-4">
      <div className="card-body">
        {/* Welcome Message */}
        <div className="row align-items-center">
          <div className="col-lg-8">
            <h4 className="card-title text-white mb-2">
              {greeting}, {firstName}! 👋
            </h4>
            <p className="card-text mb-3">
              {isFirstLogin ? (
                <>Welcome to <strong>{companyName}</strong>! Your B2B account is ready. Explore your personalized pricing below.</>
              ) : (
                <>Welcome back to <strong>{companyName}</strong> portal. Your exclusive pricing is active.</>
              )}
            </p>

            {/* Quick Actions */}
            <div className="d-flex flex-wrap gap-2 mb-3">
              <QuickActionButton
                href="/products"
                icon="ti-shopping-cart"
                label="Browse Products"
              />
              <QuickActionButton
                href="/orders"
                icon="ti-list"
                label="My Orders"
              />
              <QuickActionButton
                href="/cart"
                icon="ti-shopping-bag"
                label="View Cart"
                badge={stats?.cart?.itemCount}
              />
            </div>

            {/* Active Promotions */}
            {activePromotions.length > 0 && (
              <div className="d-flex align-items-center gap-2 mt-3">
                <span className="badge bg-warning text-dark">
                  <i className="ti ti-tag me-1"></i>
                  Active Deals
                </span>
                {activePromotions.slice(0, 2).map((promo) => (
                  <span key={promo.id} className="badge bg-light text-dark">
                    {promo.discountType === 'percentage' 
                      ? `${promo.discountValue}% OFF` 
                      : `$${promo.discountValue} OFF`}
                    {promo.minQuantity && ` on ${promo.minQuantity}+ items`}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Stats Summary */}
          <div className="col-lg-4 mt-3 mt-lg-0">
            <div className="row g-3">
              <StatCard
                label="This Month"
                value={formatCurrency(stats?.spending?.thisMonth || 0)}
                icon="ti-chart-bar"
              />
              <StatCard
                label="Savings"
                value={formatCurrency(stats?.spending?.savings || 0)}
                icon="ti-discount"
                variant="success"
              />
              <StatCard
                label="Orders"
                value={formatNumber(stats?.orders?.total || 0)}
                icon="ti-package"
              />
              <StatCard
                label="Credit"
                value={formatCurrency(stats?.credit?.available || 0)}
                icon="ti-credit-card"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// QUICK ACTION BUTTON
// ============================================

interface QuickActionButtonProps {
  href: string;
  icon: string;
  label: string;
  badge?: number;
}

function QuickActionButton({ href, icon, label, badge }: QuickActionButtonProps) {
  return (
    <Link href={href} className="btn btn-light btn-sm position-relative">
      <i className={`ti ${icon} me-1`}></i>
      {label}
      {badge && badge > 0 && (
        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
          {badge}
        </span>
      )}
    </Link>
  );
}

// ============================================
// STAT CARD
// ============================================

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  variant?: 'default' | 'success' | 'warning';
}

function StatCard({ label, value, icon, variant = 'default' }: StatCardProps) {
  const bgClass = variant === 'success' 
    ? 'bg-success bg-opacity-25' 
    : variant === 'warning' 
      ? 'bg-warning bg-opacity-25' 
      : 'bg-white bg-opacity-10';

  return (
    <div className="col-6">
      <div className={`rounded p-2 ${bgClass}`}>
        <div className="d-flex align-items-center">
          <i className={`ti ${icon} me-2`}></i>
          <div>
            <small className="d-block opacity-75">{label}</small>
            <strong>{value}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// DASHBOARD STATS CARDS
// ============================================

interface DashboardStatsCardsProps {
  stats: {
    pendingOrders: number;
    completedOrders: number;
    totalSpent: number;
    cartItems: number;
    savings?: number;
  };
}

export function DashboardStatsCards({ stats }: DashboardStatsCardsProps) {
  return (
    <div className="row g-4 mb-4">
      <div className="col-sm-6 col-lg-3">
        <StatsCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon="ti-clock"
          variant="warning"
        />
      </div>
      <div className="col-sm-6 col-lg-3">
        <StatsCard
          title="Completed Orders"
          value={stats.completedOrders}
          icon="ti-check"
          variant="success"
        />
      </div>
      <div className="col-sm-6 col-lg-3">
        <StatsCard
          title="Total Spent"
          value={formatCurrency(stats.totalSpent)}
          icon="ti-currency-dollar"
          variant="info"
        />
      </div>
      <div className="col-sm-6 col-lg-3">
        <StatsCard
          title="Total Savings"
          value={formatCurrency(stats.savings || 0)}
          icon="ti-discount"
          variant="primary"
          subtitle="From B2B pricing"
        />
      </div>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  variant: 'primary' | 'success' | 'warning' | 'info' | 'danger';
  subtitle?: string;
}

function StatsCard({ title, value, icon, variant, subtitle }: StatsCardProps) {
  return (
    <div className="card h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <p className="text-muted mb-1 small">{title}</p>
            <h4 className="mb-0">{value}</h4>
            {subtitle && <small className="text-muted">{subtitle}</small>}
          </div>
          <span className={`badge bg-label-${variant} rounded p-2`}>
            <i className={`ti ${icon} ti-sm`}></i>
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// QUICK ACTIONS PANEL
// ============================================

interface QuickActionsPanelProps {
  cartItemCount?: number;
  pendingApprovals?: number;
}

export function QuickActionsPanel({ cartItemCount = 0, pendingApprovals = 0 }: QuickActionsPanelProps) {
  return (
    <div className="card mb-4">
      <div className="card-header">
        <h5 className="card-title mb-0">Quick Actions</h5>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-6 col-md-3">
            <Link href="/products" className="btn btn-outline-primary w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3">
              <i className="ti ti-search ti-lg mb-2"></i>
              <span>Browse Products</span>
            </Link>
          </div>
          <div className="col-6 col-md-3">
            <Link href="/cart" className="btn btn-outline-primary w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3 position-relative">
              <i className="ti ti-shopping-cart ti-lg mb-2"></i>
              <span>View Cart</span>
              {cartItemCount > 0 && (
                <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-danger">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
          <div className="col-6 col-md-3">
            <Link href="/orders" className="btn btn-outline-primary w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3">
              <i className="ti ti-list-check ti-lg mb-2"></i>
              <span>Order History</span>
            </Link>
          </div>
          <div className="col-6 col-md-3">
            <Link href="/quotes" className="btn btn-outline-primary w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3 position-relative">
              <i className="ti ti-file-text ti-lg mb-2"></i>
              <span>Request Quote</span>
              {pendingApprovals > 0 && (
                <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-warning">
                  {pendingApprovals}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SAVINGS HIGHLIGHT
// ============================================

interface SavingsHighlightProps {
  totalSavings: number;
  savingsThisMonth: number;
  discountTier?: string;
}

export function SavingsHighlight({ totalSavings, savingsThisMonth, discountTier }: SavingsHighlightProps) {
  if (totalSavings <= 0) return null;

  return (
    <div className="alert alert-success d-flex align-items-center mb-4" role="alert">
      <i className="ti ti-discount ti-lg me-3"></i>
      <div className="flex-grow-1">
        <strong>You&apos;re saving with B2B pricing!</strong>
        <div className="small">
          Total savings: <strong>{formatCurrency(totalSavings)}</strong>
          {savingsThisMonth > 0 && (
            <> • This month: <strong>{formatCurrency(savingsThisMonth)}</strong></>
          )}
          {discountTier && (
            <> • Your tier: <span className="badge bg-success ms-1">{discountTier}</span></>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// ============================================
// EXPORTS
// ============================================

export default WelcomeBanner;
