import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function CustomersPage(props: { searchParams: Promise<{ type?: string }> }) {
  const searchParams = await props.searchParams;
  const currentType = searchParams.type === 'b2c' ? 'b2c' : 'b2b';

  const customers = await prisma.customer.findMany({
    where: { type: currentType },
    orderBy: { createdAt: 'desc' },
    include: {
      company: true,
      _count: { select: { orders: true } },
      orders: { select: { total: true } }
    }
  });

  return (
    <div>
      <div className="page-header">
        <h1>Customers</h1>
        <div className="action-buttons">
          <button className="btn btn-primary">+ Add Customer</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <Link 
          href="/customers?type=b2b" 
          style={{ 
            fontWeight: 600, 
            paddingBottom: '0.5rem', 
            color: currentType === 'b2b' ? 'var(--primary)' : 'var(--text-secondary)',
            borderBottom: currentType === 'b2b' ? '2px solid var(--primary)' : 'none'
          }}
        >
          B2B Companies
        </Link>
        <Link 
          href="/customers?type=b2c" 
          style={{ 
            fontWeight: 600, 
            paddingBottom: '0.5rem', 
            color: currentType === 'b2c' ? 'var(--primary)' : 'var(--text-secondary)',
            borderBottom: currentType === 'b2c' ? '2px solid var(--primary)' : 'none'
          }}
        >
          B2C Individuals
        </Link>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>{currentType === 'b2b' ? 'Customer / Company' : 'Name'}</th>
              <th>Email</th>
              {currentType === 'b2b' && <th>Credit Limit</th>}
              <th>Orders</th>
              <th>Total Spent</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => {
              const totalSpent = customer.orders.reduce((sum, o) => sum + o.total, 0);
              return (
                <tr key={customer.id}>
                  <td>
                    <div className="product-info">
                      <span className="product-name">{customer.name}</span>
                      {customer.company && (
                        <span className="product-meta">{customer.company.name}</span>
                      )}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {customer.email}
                  </td>
                  {currentType === 'b2b' && (
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                      ${(customer.company?.creditLimit || 0).toLocaleString()}
                    </td>
                  )}
                  <td>
                    {customer._count.orders}
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td>
                    <button className="btn btn-outline btn-sm">Edit</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {customers.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No customers found.
          </div>
        )}
      </div>
    </div>
  );
}
