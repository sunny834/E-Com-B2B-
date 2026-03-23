'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createProduct(data: {
  name: string;
  price: number;
  stock: number;
  sku: string;
  status: string;
  image?: string;
  categoryId?: string;
}) {
  try {
    const product = await prisma.product.create({
      data: {
        ...data,
      },
    });
    revalidatePath('/products');
    return { success: true, product };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateProduct(id: string, data: Partial<{
  name: string;
  price: number;
  stock: number;
  sku: string;
  status: string;
  image: string;
  categoryId: string;
}>) {
  try {
    const product = await prisma.product.update({
      where: { id },
      data,
    });
    revalidatePath('/products');
    return { success: true, product };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id },
    });
    revalidatePath('/products');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
