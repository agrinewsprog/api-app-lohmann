import * as fs from 'fs';
import * as path from 'path';
import { Product, ProductWithStandards, Standard } from './productionProducts.types';

let productsCache: Product[] | null = null;
let standardsCache: ProductWithStandards[] | null = null;

export function loadProducts(): Product[] {
  if (productsCache) {
    return productsCache;
  }

  const productsPath = path.join(__dirname, '..', 'products.json');
  const data = fs.readFileSync(productsPath, 'utf-8');
  productsCache = JSON.parse(data) as Product[];
  return productsCache;
}

export function loadStandardsData(): ProductWithStandards[] {
  if (standardsCache) {
    return standardsCache;
  }

  const weightPath = path.join(__dirname, '..', '..', '..', '..', 'weight.json');
  const data = fs.readFileSync(weightPath, 'utf-8');
  standardsCache = JSON.parse(data) as ProductWithStandards[];
  return standardsCache;
}

export function getProductById(productId: string): Product | null {
  const products = loadProducts();
  return products.find(p => p.id === productId) || null;
}

export function getStandardsByProductId(productId: string): Standard[] | null {
  const standardsData = loadStandardsData();
  const productData = standardsData.find(item => item.product.id === productId);

  if (!productData) {
    return null;
  }

  return productData.standards;
}

export function clearCache(): void {
  productsCache = null;
  standardsCache = null;
}
