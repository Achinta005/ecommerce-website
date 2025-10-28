import Home from './Home';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  slug: string;
  rating: number;
  images: string[];
  inventory: number;
  description?: string;
  lastUpdated: string;
}

async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products`, {
      method: "GET",
      cache: 'force-cache',
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const products: Product[] = await response.json();
    
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export default async function Page() {
  const products = await getProducts();

  return <Home products={products} />;
}

// Generate static params at build time
export const dynamic = 'force-static';