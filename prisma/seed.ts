import { PrismaClient } from '../src/generated/prisma';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL || process.env.STORAGE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || '';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ecom.com' },
    update: {},
    create: {
      email: 'admin@ecom.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
    },
  });

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { name: 'Electronics' }, update: {}, create: { name: 'Electronics', description: 'Electronic devices and gadgets' } }),
    prisma.category.upsert({ where: { name: 'Wearables' }, update: {}, create: { name: 'Wearables', description: 'Smart watches and fitness trackers' } }),
    prisma.category.upsert({ where: { name: 'Footwear' }, update: {}, create: { name: 'Footwear', description: 'Shoes, sneakers, and boots' } }),
    prisma.category.upsert({ where: { name: 'Accessories' }, update: {}, create: { name: 'Accessories', description: 'Bags, cases, and accessories' } }),
    prisma.category.upsert({ where: { name: 'Audio' }, update: {}, create: { name: 'Audio', description: 'Headphones, speakers, and audio equipment' } }),
    prisma.category.upsert({ where: { name: 'Photography' }, update: {}, create: { name: 'Photography', description: 'Cameras and photography equipment' } }),
  ]);

  // Products (matching the screenshot)
  const products = [
    { name: 'Wireless Headphones', price: 99.00, sku: 'WH-001', stock: 120, status: 'active', categoryId: categories[4].id, image: '/products/headphones.svg', description: 'Premium wireless headphones with noise cancellation' },
    { name: 'Smart Watch', price: 199.00, sku: 'SW-001', stock: 45, status: 'active', categoryId: categories[1].id, image: '/products/smartwatch.svg', description: 'Feature-rich smartwatch with health monitoring' },
    { name: 'Running Shoes', price: 79.00, sku: 'RS-001', stock: 15, lowStockAt: 20, status: 'active', categoryId: categories[2].id, image: '/products/shoes.svg', description: 'Lightweight running shoes for training' },
    { name: 'Laptop Backpack', price: 49.00, sku: 'LB-001', stock: 85, status: 'active', categoryId: categories[3].id, image: '/products/backpack.svg', description: 'Water-resistant laptop backpack with USB charging' },
    { name: 'Bluetooth Speaker', price: 59.00, sku: 'BS-001', stock: 30, status: 'active', categoryId: categories[4].id, image: '/products/speaker.svg', description: 'Portable Bluetooth speaker with 360 sound' },
    { name: 'Digital Camera', price: 450.00, sku: 'DC-001', stock: 8, lowStockAt: 10, status: 'active', categoryId: categories[5].id, image: '/products/camera.svg', description: 'Professional digital camera with 4K video' },
    { name: 'Mechanical Keyboard', price: 129.00, sku: 'MK-001', stock: 60, status: 'active', categoryId: categories[0].id, image: '/products/keyboard.svg', description: 'RGB mechanical keyboard with Cherry MX switches' },
    { name: 'Wireless Mouse', price: 39.00, sku: 'WM-001', stock: 200, status: 'active', categoryId: categories[0].id, image: '/products/mouse.svg', description: 'Ergonomic wireless mouse with long battery' },
    { name: 'USB-C Hub', price: 45.00, sku: 'UH-001', stock: 5, lowStockAt: 10, status: 'active', categoryId: categories[0].id, image: '/products/usbhub.svg', description: '7-in-1 USB-C hub with HDMI and ethernet' },
    { name: 'Monitor Stand', price: 35.00, sku: 'MS-001', stock: 40, status: 'inactive', categoryId: categories[3].id, image: '/products/stand.svg', description: 'Adjustable monitor stand with cable management' },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    });
  }

  // Bulk pricing for B2B
  const allProducts = await prisma.product.findMany();
  for (const product of allProducts.slice(0, 6)) {
    const bulkData = [
      { productId: product.id, minQty: 10, maxQty: 49, price: product.price * 0.9 },
      { productId: product.id, minQty: 50, maxQty: 99, price: product.price * 0.8 },
      { productId: product.id, minQty: 100, maxQty: null, price: product.price * 0.7 },
    ];
    for (const bp of bulkData) {
      try {
        await prisma.bulkPricing.create({ data: bp });
      } catch { /* skip if already exists */ }
    }
  }

  // Companies (B2B)
  const companies = await Promise.all([
    prisma.company.upsert({ where: { email: 'info@techcorp.com' }, update: {}, create: { name: 'TechCorp Industries', email: 'info@techcorp.com', phone: '+1-555-0100', address: '123 Tech Blvd, San Francisco, CA', creditLimit: 50000, paymentTerms: 'Net 30', status: 'active' } }),
    prisma.company.upsert({ where: { email: 'orders@retailmax.com' }, update: {}, create: { name: 'RetailMax Group', email: 'orders@retailmax.com', phone: '+1-555-0200', address: '456 Commerce Ave, New York, NY', creditLimit: 75000, paymentTerms: 'Net 45', status: 'active' } }),
    prisma.company.upsert({ where: { email: 'procurement@globalgoods.com' }, update: {}, create: { name: 'Global Goods LLC', email: 'procurement@globalgoods.com', phone: '+1-555-0300', address: '789 Trade St, Chicago, IL', creditLimit: 30000, paymentTerms: 'Net 15', status: 'active' } }),
  ]);

  // B2B Customers (associated with companies)
  const b2bCustomers = await Promise.all([
    prisma.customer.upsert({ where: { email: 'john@techcorp.com' }, update: {}, create: { name: 'John Mitchell', email: 'john@techcorp.com', phone: '+1-555-0101', type: 'b2b', companyId: companies[0].id } }),
    prisma.customer.upsert({ where: { email: 'sarah@retailmax.com' }, update: {}, create: { name: 'Sarah Chen', email: 'sarah@retailmax.com', phone: '+1-555-0201', type: 'b2b', companyId: companies[1].id } }),
    prisma.customer.upsert({ where: { email: 'mike@globalgoods.com' }, update: {}, create: { name: 'Mike Johnson', email: 'mike@globalgoods.com', phone: '+1-555-0301', type: 'b2b', companyId: companies[2].id } }),
  ]);

  // B2C Customers
  const b2cCustomers = await Promise.all([
    prisma.customer.upsert({ where: { email: 'emma.wilson@gmail.com' }, update: {}, create: { name: 'Emma Wilson', email: 'emma.wilson@gmail.com', phone: '+1-555-1001', type: 'b2c', address: '321 Oak Lane, Austin, TX' } }),
    prisma.customer.upsert({ where: { email: 'david.brown@yahoo.com' }, update: {}, create: { name: 'David Brown', email: 'david.brown@yahoo.com', phone: '+1-555-1002', type: 'b2c', address: '654 Pine Ave, Seattle, WA' } }),
    prisma.customer.upsert({ where: { email: 'lisa.garcia@hotmail.com' }, update: {}, create: { name: 'Lisa Garcia', email: 'lisa.garcia@hotmail.com', phone: '+1-555-1003', type: 'b2c', address: '987 Maple Dr, Denver, CO' } }),
    prisma.customer.upsert({ where: { email: 'james.taylor@outlook.com' }, update: {}, create: { name: 'James Taylor', email: 'james.taylor@outlook.com', phone: '+1-555-1004', type: 'b2c', address: '147 Elm St, Portland, OR' } }),
    prisma.customer.upsert({ where: { email: 'olivia.martinez@gmail.com' }, update: {}, create: { name: 'Olivia Martinez', email: 'olivia.martinez@gmail.com', phone: '+1-555-1005', type: 'b2c', address: '258 Cedar Rd, Miami, FL' } }),
  ]);

  const allCustomers = [...b2bCustomers, ...b2cCustomers];

  // Orders
  const orderData = [
    { orderNumber: 'ORD-2026-001', customerId: b2bCustomers[0].id, type: 'b2b', status: 'delivered', subtotal: 8910, tax: 712.8, shipping: 0, total: 9622.8, paymentMethod: 'net_terms', paymentStatus: 'paid' },
    { orderNumber: 'ORD-2026-002', customerId: b2cCustomers[0].id, type: 'b2c', status: 'shipped', subtotal: 298, tax: 23.84, shipping: 9.99, total: 331.83, paymentMethod: 'credit_card', paymentStatus: 'paid' },
    { orderNumber: 'ORD-2026-003', customerId: b2bCustomers[1].id, type: 'b2b', status: 'processing', subtotal: 3960, tax: 316.8, shipping: 0, total: 4276.8, paymentMethod: 'net_terms', paymentStatus: 'pending' },
    { orderNumber: 'ORD-2026-004', customerId: b2cCustomers[1].id, type: 'b2c', status: 'pending', subtotal: 79, tax: 6.32, shipping: 5.99, total: 91.31, paymentMethod: 'paypal', paymentStatus: 'paid' },
    { orderNumber: 'ORD-2026-005', customerId: b2bCustomers[2].id, type: 'b2b', status: 'delivered', subtotal: 2250, tax: 180, shipping: 0, total: 2430, paymentMethod: 'net_terms', paymentStatus: 'paid' },
    { orderNumber: 'ORD-2026-006', customerId: b2cCustomers[2].id, type: 'b2c', status: 'shipped', subtotal: 199, tax: 15.92, shipping: 0, total: 214.92, paymentMethod: 'credit_card', paymentStatus: 'paid' },
    { orderNumber: 'ORD-2026-007', customerId: b2cCustomers[3].id, type: 'b2c', status: 'delivered', subtotal: 148, tax: 11.84, shipping: 5.99, total: 165.83, paymentMethod: 'credit_card', paymentStatus: 'paid' },
    { orderNumber: 'ORD-2026-008', customerId: b2cCustomers[4].id, type: 'b2c', status: 'pending', subtotal: 450, tax: 36, shipping: 0, total: 486, paymentMethod: 'credit_card', paymentStatus: 'pending' },
  ];

  for (const order of orderData) {
    const existing = await prisma.order.findUnique({ where: { orderNumber: order.orderNumber } });
    if (!existing) {
      const createdOrder = await prisma.order.create({ data: order });

      // Add order items
      const randomProducts = allProducts.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1);
      for (const product of randomProducts) {
        const qty = order.type === 'b2b' ? Math.floor(Math.random() * 50) + 10 : Math.floor(Math.random() * 3) + 1;
        await prisma.orderItem.create({
          data: {
            orderId: createdOrder.id,
            productId: product.id,
            quantity: qty,
            price: product.price,
            total: qty * product.price,
          },
        });
      }
    }
  }

  // Discounts
  await prisma.discount.upsert({ where: { code: 'WELCOME10' }, update: {}, create: { code: 'WELCOME10', description: '10% off for new customers', type: 'percentage', value: 10, targetType: 'b2c', isActive: true } });
  await prisma.discount.upsert({ where: { code: 'B2BBULK15' }, update: {}, create: { code: 'B2BBULK15', description: '15% off on bulk orders', type: 'percentage', value: 15, minOrder: 1000, targetType: 'b2b', isActive: true } });
  await prisma.discount.upsert({ where: { code: 'FLAT20' }, update: {}, create: { code: 'FLAT20', description: '$20 off on orders above $200', type: 'fixed', value: 20, minOrder: 200, targetType: 'all', isActive: true } });
  await prisma.discount.upsert({ where: { code: 'SUMMER25' }, update: {}, create: { code: 'SUMMER25', description: '25% summer sale discount', type: 'percentage', value: 25, targetType: 'all', isActive: false } });

  // Settings
  const settings = [
    { key: 'store_name', value: 'E-Commerce Admin' },
    { key: 'store_currency', value: 'USD' },
    { key: 'store_timezone', value: 'America/New_York' },
    { key: 'b2b_enabled', value: 'true' },
    { key: 'b2c_enabled', value: 'true' },
    { key: 'b2b_min_order', value: '100' },
    { key: 'b2b_default_terms', value: 'Net 30' },
    { key: 'b2c_guest_checkout', value: 'true' },
    { key: 'low_stock_threshold', value: '10' },
    { key: 'tax_rate', value: '8' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log(`  👤 Admin: admin@ecom.com / admin123`);
  console.log(`  📦 Products: ${allProducts.length}`);
  console.log(`  🏢 Companies: ${companies.length}`);
  console.log(`  👥 Customers: ${allCustomers.length}`);
  console.log(`  📋 Orders: ${orderData.length}`);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
