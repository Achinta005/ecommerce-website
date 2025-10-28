import ProductDetail from './ProductDetail';
import { notFound } from 'next/navigation';
import { connectDB } from "@/app/lib/db";
import Product from "@/app/model/product";

interface ProductType {
  _id: string;
  id?: string;
  slug: string;
  name: string;
  price: string | number;
  category: string;
  rating?: number;
  reviewCount?: number;
  image?: string;
  images?: string[];
  description: string;
  features?: string[];
  specifications?: { [key: string]: string };
  inStock?: boolean;
  stock?: number;
  inventory?: number;
  lastUpdated?: string;
}

async function getProduct(slug: string): Promise<ProductType | null> {
  try {
    await connectDB();
    
    console.log('Looking for product with slug:', slug);

    const product = await Product.findOne({ slug: slug }).lean();

    if (!product) {
      console.log('Product not found with slug:', slug);
      return null;
    }

    console.log('Product found:', product.name);

    const productData = {
      ...product,
      _id: product._id.toString(),
      images: product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []),
      rating: product.rating || 4.5,
      reviewCount: product.reviewCount || 0,
      inStock: product.inStock !== undefined ? product.inStock : (product.inventory ? product.inventory > 0 : true),
      stock: product.stock || product.inventory
    };

    return productData as ProductType;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Generate static params at build time
export async function generateStaticParams() {
  try {
    await connectDB();
    const products = await Product.find({}).select('slug').lean();
    
    console.log('Generating static params for slugs:', products.map(p => p.slug));
    
    return products.map((product) => ({
      slug: product.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  
  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: `${product.name} - ShopHub`,
    description: product.description,
  };
}

// ISR configuration
export const revalidate = 60;
export const dynamicParams = true;

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  
  if (!product) {
    notFound();
  }
  
  return <ProductDetail product={product} />;
}