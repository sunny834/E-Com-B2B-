import { prisma } from '@/lib/prisma';

export default async function SettingsPage() {
  const settingsArray = await prisma.setting.findMany();
  const settings = Object.fromEntries(settingsArray.map((s) => [s.key, s.value]));

  return (
    <div>
      <div className="page-header">
        <h1>Settings</h1>
        <button className="btn btn-primary">Save Changes</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>General Store Settings</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Store Name</label>
            <input type="text" defaultValue={settings.store_name} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Currency</label>
            <input type="text" defaultValue={settings.store_currency} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Tax Rate (%)</label>
            <input type="text" defaultValue={settings.tax_rate} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>B2B Features</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <input type="checkbox" id="b2b" defaultChecked={settings.b2b_enabled === 'true'} style={{ width: '18px', height: '18px' }} />
            <label htmlFor="b2b" style={{ fontWeight: 500 }}>Enable B2B Portal</label>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>B2B Minimum Order Quantity</label>
            <input type="number" defaultValue={settings.b2b_min_order} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Default Payment Terms</label>
            <input type="text" defaultValue={settings.b2b_default_terms} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
