'use client';

import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils';

// Types
interface SpendingData {
  period: string;
  amount: number;
  orderCount: number;
}

interface CategorySpend {
  category: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  trendPercent?: number;
}

interface TopProduct {
  productId: string;
  title: string;
  image?: string;
  quantity: number;
  totalSpent: number;
  orderCount: number;
}

interface AnalyticsSummary {
  totalSpent: number;
  totalOrders: number;
  averageOrderValue: number;
  totalSavings: number;
  periodChange: number;
}

// Main Analytics Dashboard
interface SpendingAnalyticsDashboardProps {
  summary: AnalyticsSummary;
  monthlyData: SpendingData[];
  categoryBreakdown: CategorySpend[];
  topProducts: TopProduct[];
  period?: 'month' | 'quarter' | 'year';
  onPeriodChange?: (period: 'month' | 'quarter' | 'year') => void;
}

export function SpendingAnalyticsDashboard({
  summary,
  monthlyData,
  categoryBreakdown,
  topProducts,
  period = 'month',
  onPeriodChange
}: SpendingAnalyticsDashboardProps) {
  return (
    <div className="spending-analytics-dashboard">
      {/* Period Selector */}
      {onPeriodChange && (
        <div className="d-flex justify-content-end mb-4">
          <div className="btn-group">
            {(['month', 'quarter', 'year'] as const).map(p => (
              <button
                key={p}
                className={`btn btn-sm ${period === p ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => onPeriodChange(p)}
              >
                {p === 'month' ? 'This Month' : p === 'quarter' ? 'This Quarter' : 'This Year'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <SummaryCard
            title="Total Spent"
            value={formatCurrency(summary.totalSpent)}
            change={summary.periodChange}
            icon="wallet"
            color="primary"
          />
        </div>
        <div className="col-md-3">
          <SummaryCard
            title="Total Orders"
            value={formatNumber(summary.totalOrders)}
            icon="shopping-cart"
            color="info"
          />
        </div>
        <div className="col-md-3">
          <SummaryCard
            title="Average Order"
            value={formatCurrency(summary.averageOrderValue)}
            icon="receipt"
            color="warning"
          />
        </div>
        <div className="col-md-3">
          <SummaryCard
            title="Total Savings"
            value={formatCurrency(summary.totalSavings)}
            icon="discount"
            color="success"
          />
        </div>
      </div>

      <div className="row g-4">
        {/* Spending Chart */}
        <div className="col-lg-8">
          <SpendingChart data={monthlyData} />
        </div>

        {/* Category Breakdown */}
        <div className="col-lg-4">
          <CategoryBreakdown categories={categoryBreakdown} />
        </div>

        {/* Top Products */}
        <div className="col-12">
          <TopProductsTable products={topProducts} />
        </div>
      </div>
    </div>
  );
}

// Summary Card Component
interface SummaryCardProps {
  title: string;
  value: string;
  change?: number;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'info' | 'danger';
}

export function SummaryCard({ title, value, change, icon, color }: SummaryCardProps) {
  return (
    <div className="card h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <p className="text-muted mb-1">{title}</p>
            <h3 className="mb-0">{value}</h3>
            {change !== undefined && (
              <small className={change >= 0 ? 'text-success' : 'text-danger'}>
                <i className={`ti ti-trending-${change >= 0 ? 'up' : 'down'} me-1`}></i>
                {formatPercent(Math.abs(change))} vs last period
              </small>
            )}
          </div>
          <div 
            className={`rounded-circle bg-${color} bg-opacity-10 d-flex align-items-center justify-content-center`}
            style={{ width: 48, height: 48 }}
          >
            <i className={`ti ti-${icon} fs-4 text-${color}`}></i>
          </div>
        </div>
      </div>
    </div>
  );
}

// Spending Chart (Simple bar representation)
interface SpendingChartProps {
  data: SpendingData[];
}

export function SpendingChart({ data }: SpendingChartProps) {
  const maxAmount = Math.max(...data.map(d => d.amount), 1);

  return (
    <div className="card h-100">
      <div className="card-header">
        <h6 className="mb-0">
          <i className="ti ti-chart-bar me-2"></i>
          Spending Over Time
        </h6>
      </div>
      <div className="card-body">
        {data.length === 0 ? (
          <div className="text-center py-4 text-muted">
            <i className="ti ti-chart-off ti-2x mb-2"></i>
            <p className="mb-0">No spending data available</p>
          </div>
        ) : (
          <div className="spending-chart">
            <div className="d-flex align-items-end justify-content-between" style={{ height: 200 }}>
              {data.map((item, index) => {
                const height = (item.amount / maxAmount) * 100;
                return (
                  <div 
                    key={index} 
                    className="text-center flex-fill px-1"
                    style={{ maxWidth: `${100 / data.length}%` }}
                  >
                    <div 
                      className="bg-primary rounded-top mx-auto position-relative"
                      style={{ 
                        height: `${Math.max(height, 5)}%`, 
                        minHeight: 10,
                        maxWidth: 40,
                        transition: 'height 0.3s ease'
                      }}
                      title={`${item.period}: ${formatCurrency(item.amount)}`}
                    >
                      <div 
                        className="position-absolute w-100 text-center"
                        style={{ top: -20 }}
                      >
                        <small className="text-muted" style={{ fontSize: 10 }}>
                          {formatCurrency(item.amount)}
                        </small>
                      </div>
                    </div>
                    <small className="text-muted d-block mt-2" style={{ fontSize: 11 }}>
                      {item.period}
                    </small>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Category Breakdown
interface CategoryBreakdownProps {
  categories: CategorySpend[];
}

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  const colors = ['primary', 'success', 'warning', 'info', 'danger', 'secondary'];

  return (
    <div className="card h-100">
      <div className="card-header">
        <h6 className="mb-0">
          <i className="ti ti-category me-2"></i>
          Spending by Category
        </h6>
      </div>
      <div className="card-body">
        {categories.length === 0 ? (
          <div className="text-center py-4 text-muted">
            <p className="mb-0">No category data</p>
          </div>
        ) : (
          <div>
            {categories.map((cat, index) => (
              <div key={cat.category} className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-truncate" style={{ maxWidth: '60%' }}>
                    {cat.category}
                  </span>
                  <span className="fw-semibold">
                    {formatCurrency(cat.amount)}
                    {cat.trend !== 'stable' && (
                      <i className={`ti ti-arrow-${cat.trend === 'up' ? 'up' : 'down'} ms-1 text-${cat.trend === 'up' ? 'success' : 'danger'} small`}></i>
                    )}
                  </span>
                </div>
                <div className="progress" style={{ height: 8 }}>
                  <div 
                    className={`progress-bar bg-${colors[index % colors.length]}`}
                    style={{ width: `${cat.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Top Products Table
interface TopProductsTableProps {
  products: TopProduct[];
  maxItems?: number;
}

export function TopProductsTable({ products, maxItems = 5 }: TopProductsTableProps) {
  const displayProducts = products.slice(0, maxItems);

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          <i className="ti ti-star me-2"></i>
          Most Purchased Products
        </h6>
        {products.length > maxItems && (
          <a href="/products" className="btn btn-sm btn-outline-primary">
            View All
          </a>
        )}
      </div>
      <div className="card-body p-0">
        {displayProducts.length === 0 ? (
          <div className="text-center py-4 text-muted">
            <p className="mb-0">No purchase history</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Product</th>
                  <th className="text-center">Times Ordered</th>
                  <th className="text-center">Total Qty</th>
                  <th className="text-end">Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {displayProducts.map((product, index) => (
                  <tr key={product.productId}>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="badge bg-light text-muted me-2">{index + 1}</span>
                        {product.image && (
                          <img 
                            src={product.image} 
                            alt={product.title}
                            className="rounded me-2"
                            style={{ width: 40, height: 40, objectFit: 'cover' }}
                          />
                        )}
                        <span className="fw-semibold">{product.title}</span>
                      </div>
                    </td>
                    <td className="text-center">
                      <span className="badge bg-light text-muted">
                        {product.orderCount} order{product.orderCount !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="text-center">{formatNumber(product.quantity)}</td>
                    <td className="text-end fw-semibold">{formatCurrency(product.totalSpent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Savings Summary Widget
interface SavingsSummaryProps {
  totalSavings: number;
  savingsBreakdown: Array<{
    type: string;
    amount: number;
  }>;
}

export function SavingsSummary({ totalSavings, savingsBreakdown }: SavingsSummaryProps) {
  return (
    <div className="card bg-success text-white">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <p className="mb-1 opacity-75">Total Savings</p>
            <h3 className="mb-0">{formatCurrency(totalSavings)}</h3>
          </div>
          <div 
            className="rounded-circle bg-white bg-opacity-25 d-flex align-items-center justify-content-center"
            style={{ width: 56, height: 56 }}
          >
            <i className="ti ti-discount-2 fs-3"></i>
          </div>
        </div>
        
        {savingsBreakdown.length > 0 && (
          <div className="pt-3 border-top border-white border-opacity-25">
            <div className="row g-2">
              {savingsBreakdown.map(item => (
                <div key={item.type} className="col-6">
                  <small className="opacity-75">{item.type}</small>
                  <div className="fw-semibold">{formatCurrency(item.amount)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Quick Stats Row
interface QuickStat {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
}

interface QuickStatsRowProps {
  stats: QuickStat[];
}

export function QuickStatsRow({ stats }: QuickStatsRowProps) {
  return (
    <div className="row g-3">
      {stats.map((stat, index) => (
        <div key={index} className={`col-md-${12 / stats.length}`}>
          <div className="card h-100">
            <div className="card-body d-flex align-items-center">
              <div 
                className={`rounded bg-${stat.color || 'primary'} bg-opacity-10 d-flex align-items-center justify-content-center me-3`}
                style={{ width: 44, height: 44 }}
              >
                <i className={`ti ti-${stat.icon} fs-4 text-${stat.color || 'primary'}`}></i>
              </div>
              <div>
                <p className="text-muted mb-0 small">{stat.label}</p>
                <h5 className="mb-0">{stat.value}</h5>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Order Frequency Chart
interface OrderFrequencyProps {
  weeklyOrders: number[];
  labels?: string[];
}

export function OrderFrequencyChart({ weeklyOrders, labels }: OrderFrequencyProps) {
  const defaultLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const displayLabels = labels || defaultLabels;
  const maxOrders = Math.max(...weeklyOrders, 1);

  return (
    <div className="card">
      <div className="card-header">
        <h6 className="mb-0">
          <i className="ti ti-calendar-stats me-2"></i>
          Order Frequency
        </h6>
      </div>
      <div className="card-body">
        <div className="d-flex align-items-end justify-content-between" style={{ height: 120 }}>
          {weeklyOrders.map((count, index) => {
            const height = (count / maxOrders) * 100;
            return (
              <div key={index} className="text-center" style={{ flex: 1 }}>
                <div 
                  className="bg-primary bg-opacity-75 rounded-top mx-auto"
                  style={{ 
                    height: `${Math.max(height, 5)}%`,
                    minHeight: count > 0 ? 10 : 4,
                    width: 24,
                    transition: 'height 0.3s ease'
                  }}
                  title={`${count} orders`}
                ></div>
                <small className="text-muted d-block mt-2">{displayLabels[index]}</small>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
