import { prisma } from '@/lib/prisma';
import ProductClient from './ProductClient';

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const categories = await prisma.category.findMany();

  return <ProductClient initialProducts={products} categories={categories} />;
}
