import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      customer: {
        include: { company: true }
      },
      _count: {
        select: { items: true }
      }
    }
  });

  return (
    <div>
      <div className="page-header">
        <h1>Orders</h1>
        <div className="action-buttons">
          <button className="btn btn-outline flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            Export
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                  #{order.orderNumber.replace('ORD-', '')}
                </td>
                <td>
                  <div className="product-info">
                    <span className="product-name">{order.customer.name}</span>
                    {order.customer.company && (
                      <span className="product-meta">{order.customer.company.name}</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className="status-badge" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    {order.type}
                  </span>
                </td>
                <td>
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td style={{ color: 'var(--text-muted)' }}>
                  {order._count.items} items
                </td>
                <td style={{ fontWeight: 600 }}>
                  ${order.total.toFixed(2)}
                </td>
                <td>
                  <span className={`status-badge ${
                    order.status === 'delivered' ? 'status-active' :
                    order.status === 'shipped' ? 'status-low-stock' :
                    order.status === 'processing' ? 'status-low-stock' :
                    'status-inactive'
                  }`} style={{textTransform: 'capitalize'}}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <button className="btn btn-outline btn-sm">View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
