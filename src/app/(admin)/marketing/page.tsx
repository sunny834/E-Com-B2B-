import { prisma } from '@/lib/prisma';

export default async function MarketingPage() {
  const discounts = await prisma.discount.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div className="page-header">
        <h1>Marketing & Discounts</h1>
        <button className="btn btn-primary">+ Create Promotion</button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Description</th>
              <th>Type</th>
              <th>Target</th>
              <th>Status</th>
              <th>Usage</th>
            </tr>
          </thead>
          <tbody>
            {discounts.map((discount) => (
              <tr key={discount.id}>
                <td style={{ fontWeight: 600 }}>{discount.code}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{discount.description || '-'}</td>
                <td>
                  {discount.type === 'percentage' ? `${discount.value}% OFF` : `$${discount.value} OFF`}
                </td>
                <td>
                  <span className="status-badge" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    {discount.targetType}
                  </span>
                </td>
                <td>
                  {discount.isActive ? (
                    <span className="status-badge status-active">Active</span>
                  ) : (
                    <span className="status-badge status-inactive">Inactive</span>
                  )}
                </td>
                <td>{discount.usedCount} uses</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
