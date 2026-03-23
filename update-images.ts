import { PrismaClient } from './src/generated/prisma';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import path from 'path';

const adapter = new PrismaLibSql({ url: 'file:' + path.resolve(process.cwd(), 'dev.db') });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.product.updateMany({
    where: { name: 'Wireless Headphones' },
    data: { image: '/products/headphones_hq.png' }
  });
  
  await prisma.product.updateMany({
    where: { name: 'Smart Watch' },
    data: { image: '/products/smartwatch_hq.png' }
  });
  
  await prisma.product.updateMany({
    where: { name: 'Running Shoes' },
    data: { image: '/products/shoes_hq.png' }
  });
  
  console.log('Images updated successfully!');
}

main().catch(console.error);
