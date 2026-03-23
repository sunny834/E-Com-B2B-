import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function DashboardPage() {
  // Aggregate stats from DB
  const [totalOrders, totalCustomers, lowStockCount, salesAgg] = await Promise.all([
    prisma.order.count(),
    prisma.customer.count(),
    prisma.product.count({
      where: {
        stock: { lte: prisma.product.fields.lowStockAt }
      }
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ['delivered', 'shipped'] } }
    })
  ]);

  const totalSales = salesAgg._sum.total || 0;

  // Recent orders
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      customer: true
    }
  });

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <div className="action-buttons">
          <Link href="/reports" className="btn btn-outline">Download Report</Link>
        </div>
      </div>

      <div className="stat-grid">
        <div className="card stat-card">
          <div className="stat-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="stat-icon sales">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            Total Sales
          </div>
          <div className="stat-value">${totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="stat-meta text-secondary">+12.5% from last month</div>
        </div>
        
        <div className="card stat-card">
          <div className="stat-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="stat-icon orders">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
            Orders
          </div>
          <div className="stat-value">{totalOrders.toLocaleString()}</div>
          <div className="stat-meta text-secondary">+8.2% from last month</div>
        </div>

        <div className="card stat-card">
          <div className="stat-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="stat-icon customers">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            Customers
          </div>
          <div className="stat-value">{totalCustomers.toLocaleString()}</div>
          <div className="stat-meta text-secondary">+2.4% from last month</div>
        </div>

        <div className="card stat-card">
          <div className="stat-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="stat-icon alerts">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Stock Alert
          </div>
          <div className="stat-value">{lowStockCount} <span style={{fontSize: '1rem', fontWeight: 500, color: 'var(--danger)'}}>Low Stock</span></div>
          <div className="stat-meta danger">Requires immediate attention</div>
        </div>
      </div>

      <div className="page-header" style={{ marginTop: '2rem' }}>
        <h2>Recent Orders</h2>
        <Link href="/orders" className="btn btn-outline btn-sm">View All</Link>
      </div>
      
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id}>
                <td style={{ fontWeight: 500 }}>{order.orderNumber}</td>
                <td>{order.customer.name}</td>
                <td>
                  <span className="status-badge" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    {order.type}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${order.status === 'delivered' ? 'status-active' : order.status === 'pending' ? 'status-low-stock' : 'status-inactive'}`} style={{textTransform: 'capitalize'}}>
                    {order.status}
                  </span>
                </td>
                <td style={{ fontWeight: 600 }}>${order.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
