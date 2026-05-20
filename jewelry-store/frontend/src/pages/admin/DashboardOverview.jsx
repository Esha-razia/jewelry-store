import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  ComposedChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Package,
  Brain,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

const EMPTY_ANALYTICS = {
  trendingCategories: [],
  inventoryRisk: [],
  salesTrend: [],
  inventoryHealth: [],
  categoryForecast: [],
  insights: [],
  priceOptimizations: [],
  priceHistoryChart: [],
  summary: { totalProducts: 0, atRisk: 0, topCategory: null, forecastDays: 7 },
};

const STATUS_LABELS = {
  out_of_stock: { label: 'Out of Stock', class: 'badge-danger' },
  critical: { label: 'Critical', class: 'badge-danger' },
  low: { label: 'Low Stock', class: 'badge-warning' },
  medium: { label: 'Medium', class: 'badge-warning' },
  healthy: { label: 'Healthy', class: 'badge-success' },
};

const TREND_ICONS = { rising: '↑', falling: '↓', stable: '→' };

const chartTooltipStyle = {
  backgroundColor: '#1a1a1a',
  border: '1px solid rgba(212, 175, 55, 0.3)',
  borderRadius: '8px',
  color: '#fff',
};

const ChartBox = ({ height = 280, children }) => (
  <div className="chart-container" style={{ height, minHeight: height, width: '100%' }}>
    <ResponsiveContainer width="100%" height={height} minWidth={0}>
      {children}
    </ResponsiveContainer>
  </div>
);

const DashboardOverview = () => {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, revenue: 0 });
  const [analytics, setAnalytics] = useState(EMPTY_ANALYTICS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!user?.token) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [pRes, oRes, uRes, analyticsRes] = await Promise.allSettled([
        axios.get('/api/products'),
        axios.get('/api/orders', config),
        axios.get('/api/users', config),
        axios.get('/api/analytics/dashboard', config),
      ]);

      if (pRes.status === 'fulfilled' && oRes.status === 'fulfilled' && uRes.status === 'fulfilled') {
        const totalRevenue = oRes.value.data.reduce(
          (acc, order) => acc + (order.isPaid ? order.totalPrice : 0),
          0
        );
        setStats({
          products: pRes.value.data.length,
          orders: oRes.value.data.length,
          users: uRes.value.data.length,
          revenue: totalRevenue.toFixed(2),
        });
      }

      if (analyticsRes.status === 'fulfilled') {
        setAnalytics(analyticsRes.value.data);
      } else {
        console.error(analyticsRes.reason);
        setError('AI analytics failed to load. Log in as admin and ensure the backend is running on port 4000.');
      }
    } catch (e) {
      console.error(e);
      setError('Failed to load dashboard data. Ensure backend is running and you are logged in as admin.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const forecastCategories = analytics.trendingCategories?.slice(0, 4) || [];
  const forecastKeys = forecastCategories.map((c) => c.name);
  const forecastColors = ['#D4AF37', '#F3E5AB', '#C0C0C0', '#8B7355'];
  const inventoryRisk = analytics.inventoryRisk || [];
  const hasSalesTrendData = analytics.salesTrend?.some((d) => d.revenue > 0 || d.units > 0);

  if (loading) {
    return (
      <div className="analytics-loading">
        <Brain size={32} className="spin-icon" />
        <p>AI is analyzing inventory & sales patterns...</p>
      </div>
    );
  }

  return (
    <div className="fade-in dashboard-analytics">
      <div className="flex-between analytics-header">
        <div>
          <h2 style={{ marginBottom: '0.25rem' }}>AI Inventory Intelligence</h2>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            Neural-network forecasts · stockout risk · category demand for next{' '}
            {analytics.summary?.forecastDays || 7} days
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline analytics-refresh"
          onClick={() => fetchData(true)}
          disabled={refreshing}
        >
          <RefreshCw size={16} className={refreshing ? 'spin-icon' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh AI Data'}
        </button>
      </div>

      {error && (
        <div className="glass-panel analytics-error" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <div className="grid analytics-stats-grid">
        <div className="glass-panel stat-card">
          <div className="stat-value">Rs. {stats.revenue}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-value">{stats.orders}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-value">{analytics.summary?.atRisk ?? 0}</div>
          <div className="stat-label">Items At Risk</div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-value text-gold">{analytics.summary?.topCategory || '—'}</div>
          <div className="stat-label">Top Category (AI)</div>
        </div>
      </div>

      {analytics.insights?.length > 0 && (
        <section className="analytics-section">
          <h3 className="section-title">
            <Sparkles size={20} /> AI Recommendations
          </h3>
          <div className="insights-grid">
            {analytics.insights.map((insight, i) => (
              <div key={i} className={`glass-panel insight-card insight-${insight.priority}`}>
                <span className={`insight-badge insight-badge-${insight.priority}`}>
                  {insight.priority}
                </span>
                <p>{insight.message}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* AI Pricing Intelligence Section */}
      <section className="analytics-section">
        <h3 className="section-title">
          <TrendingDown size={20} className="text-gold" /> AI Pricing Intelligence & Drop Suggestions
        </h3>
        
        <div className="grid analytics-charts-grid" style={{ marginBottom: '1.5rem' }}>
          
          {/* Price History Chart */}
          <div className="glass-panel chart-panel">
            <h4 className="chart-title text-gold">Price Trends (Last 30 Days)</h4>
            {analytics.priceHistoryChart?.length === 0 ? (
              <p className="text-muted" style={{ padding: '2rem 0', textAlign: 'center' }}>
                No pricing history recorded yet.
              </p>
            ) : (
              <ChartBox height={300}>
                <LineChart data={analytics.priceHistoryChart} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
                  <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.6)' }} tickFormatter={(v) => `Rs. ${v}`} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend />
                  {Object.keys(analytics.priceHistoryChart?.[0] || {})
                    .filter(key => key !== 'date')
                    .slice(0, 4)
                    .map((prodName, idx) => {
                      const colors = ['#D4AF37', '#ff6b6b', '#2ed573', '#00d2d3'];
                      return (
                        <Line
                          key={prodName}
                          type="monotone"
                          dataKey={prodName}
                          stroke={colors[idx % colors.length]}
                          strokeWidth={2.5}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                          name={prodName}
                        />
                      );
                    })}
                </LineChart>
              </ChartBox>
            )}
          </div>

          {/* AI Price Drop Recommendations */}
          <div className="glass-panel chart-panel" style={{ display: 'flex', flexDirection: 'column' }}>
            <h4 className="chart-title" style={{ color: '#ffa502' }}>Drop Price Recommendations</h4>
            <div className="pricing-recommendations-list" style={{ flex: 1, overflowY: 'auto', maxHeight: '300px' }}>
              {(!analytics.priceOptimizations || analytics.priceOptimizations.length === 0) ? (
                <p className="text-muted" style={{ padding: '2rem 0', textAlign: 'center' }}>
                  No steep price increases detected. Pricing structure looks optimal!
                </p>
              ) : (
                analytics.priceOptimizations.map((opt) => (
                  <div key={opt.productId} className="glass-panel pricing-opt-card" style={{ padding: '1rem', marginBottom: '0.75rem', borderLeft: '4px solid #ffa502', borderRadius: '6px', background: 'rgba(255,255,255,0.02)' }}>
                    <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                      <strong style={{ fontSize: '1.5rem', color: '#fff' }}>{opt.name}</strong>
                      <span style={{ fontSize: '0.8rem', color: '#ff6b6b', background: 'rgba(255,107,107,0.1)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>
                        +{opt.percentageIncrease}% Hike
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      <div>
                        <span className="text-muted">Current: </span>
                        <strong style={{ textDecoration: 'line-through', color: '#ff4757' }}>Rs. {opt.currentPrice}</strong>
                      </div>
                      <div>
                        <span className="text-gold">AI Recommended: </span>
                        <strong style={{ color: '#2ed573', fontSize: '1rem' }}>Rs. {opt.suggestedPrice}</strong>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.4' }}>
                      {opt.message.split(' (from')[0]} (Suggested drop to maximize customer conversions).
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Category graphs — top (original order) */}
      <section className="analytics-section">
        <h3 className="section-title">
          <TrendingUp size={20} /> Category Demand Forecast
        </h3>
        <div className="grid analytics-charts-grid">
          <div className="glass-panel chart-panel">
            <h4 className="chart-title text-gold">Predicted Units (Next 7 Days)</h4>
            <ChartBox height={300}>
              <BarChart data={analytics.trendingCategories} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
                <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.6)' }} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="predictedDemand" fill="#D4AF37" radius={[6, 6, 0, 0]} name="Predicted Units" />
              </BarChart>
            </ChartBox>
            <div className="category-trend-list">
              {analytics.trendingCategories?.map((cat) => (
                <div key={cat.name} className="category-trend-row">
                  <span>{cat.name}</span>
                  <span className="text-muted">
                    {TREND_ICONS[cat.trend] || '→'} {cat.trend} · {cat.avgDailySales}/day avg
                  </span>
                </div>
              ))}
            </div>
          </div>

          {analytics.categoryForecast?.length > 0 && forecastKeys.length > 0 && (
            <div className="glass-panel chart-panel">
              <h4 className="chart-title text-gold">Daily Forecast by Category</h4>
              <ChartBox height={300}>
                <LineChart data={analytics.categoryForecast} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.6)' }} />
                  <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.6)' }} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend />
                  {forecastKeys.map((key, i) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={forecastColors[i % forecastColors.length]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  ))}
                </LineChart>
              </ChartBox>
            </div>
          )}
        </div>
      </section>

      {/* Sales overview — middle */}
      <section className="analytics-section">
        <h3 className="section-title">
          <Package size={20} /> Sales & Inventory Overview
        </h3>
        <div className="grid analytics-charts-grid">
          <div className="glass-panel chart-panel">
            <h4 className="chart-title">Sales Trend (Last 45 Days)</h4>
            {!hasSalesTrendData ? (
              <p className="text-muted" style={{ padding: '2rem 0', textAlign: 'center' }}>
                No sales recorded in the last 45 days. Orders will appear here once customers checkout.
              </p>
            ) : (
              <ChartBox height={300}>
                <ComposedChart data={analytics.salesTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis
                    dataKey="date"
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    yAxisId="revenue"
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                    tickFormatter={(v) => `Rs. ${v}`}
                  />
                  <YAxis
                    yAxisId="units"
                    orientation="right"
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend />
                  <Area
                    yAxisId="revenue"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#D4AF37"
                    fill="url(#revenueGrad)"
                    name="Revenue (Rs.)"
                    dot={{ r: 3, fill: '#D4AF37' }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    yAxisId="units"
                    type="monotone"
                    dataKey="units"
                    stroke="#C0C0C0"
                    strokeWidth={2}
                    name="Units Sold"
                    dot={{ r: 3 }}
                  />
                </ComposedChart>
              </ChartBox>
            )}
          </div>

          {analytics.inventoryHealth?.length > 0 && (
            <div className="glass-panel chart-panel">
              <h4 className="chart-title">Stock Health Distribution</h4>
              <ChartBox height={300}>
                <PieChart>
                  <Pie
                    data={analytics.inventoryHealth}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {analytics.inventoryHealth.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend />
                </PieChart>
              </ChartBox>
            </div>
          )}
        </div>
      </section>

      {/* Stockout risk — bottom (original position) + fixed risk graph */}
      <section className="analytics-section" id="stockout-risk">
        <h3 className="section-title">
          <AlertTriangle size={20} /> Stockout Risk — AI Predictions
        </h3>
        <div className="stockout-risk-stack">
          <div className="glass-panel chart-panel stockout-risk-chart">
            <h4 className="chart-title" style={{ color: '#ff6b6b' }}>Risk Score by Product</h4>
            {inventoryRisk.length === 0 ? (
              <p className="text-muted" style={{ padding: '2rem 0', textAlign: 'center' }}>
                No risk data yet. Add orders and products to enable AI stockout predictions.
              </p>
            ) : (
              <ChartBox height={300}>
                <BarChart
                  data={inventoryRisk}
                  margin={{ top: 10, right: 10, left: -10, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis
                    dataKey="name"
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.6)' }} />
                  <Tooltip contentStyle={{ ...chartTooltipStyle, borderColor: '#ff6b6b' }} />
                  <Bar dataKey="riskScore" fill="#ff6b6b" radius={[6, 6, 0, 0]} name="Risk Score" />
                </BarChart>
              </ChartBox>
            )}
          </div>

          <div className="glass-panel chart-panel stockout-risk-table">
            <h4 className="chart-title" style={{ color: '#ff6b6b' }}>Items Running Low</h4>
            {inventoryRisk.length === 0 ? (
              <p className="text-muted" style={{ padding: '1rem 0' }}>
                No high-risk items detected. Inventory looks healthy.
              </p>
            ) : (
              <div className="inventory-table-wrap">
                <table className="inventory-risk-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Stock</th>
                      <th>Sales/Day</th>
                      <th>Days Left</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryRisk.map((item) => {
                      const statusInfo = STATUS_LABELS[item.status] || STATUS_LABELS.healthy;
                      return (
                        <tr key={item.id || item.name}>
                          <td>{item.name}</td>
                          <td className="text-muted">{item.category}</td>
                          <td>{item.stock}</td>
                          <td>{item.salesVelocity}</td>
                          <td>
                            {item.daysToStockout === null
                              ? '—'
                              : item.daysToStockout === 0
                                ? 'Now'
                                : `~${item.daysToStockout}d`}
                          </td>
                          <td>
                            <span className={statusInfo.class}>{statusInfo.label}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardOverview;
