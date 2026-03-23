const { createClient } = require('@libsql/client');
const path = require('path');

// Try absolute path to prisma/dev.db
const dbPath = path.resolve(__dirname, 'prisma', 'dev.db');
console.log('Trying:', dbPath);
const c = createClient({ url: 'file:' + dbPath });
c.execute("SELECT name FROM sqlite_master WHERE type='table'")
    .then(r => {
        console.log('Tables in prisma/dev.db:', r.rows.map(row => row.name));

        // Also try root dev.db
        const dbPath2 = path.resolve(__dirname, 'dev.db');
        console.log('Trying:', dbPath2);
        const c2 = createClient({ url: 'file:' + dbPath2 });
        return c2.execute("SELECT name FROM sqlite_master WHERE type='table'")
            .then(r2 => {
                console.log('Tables in dev.db:', r2.rows.map(row => row.name));
                process.exit(0);
            });
    })
    .catch(e => { console.error('Error:', e.message); process.exit(1); });
