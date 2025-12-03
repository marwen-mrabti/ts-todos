import ProductList from '@/components/product-list';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

const allProducts = [
  { id: 1, name: 'Laptop', category: 'electronics', price: 999 },
  { id: 2, name: 'Headphones', category: 'electronics', price: 199 },
  { id: 3, name: 'T-Shirt', category: 'clothing', price: 29 },
  { id: 4, name: 'Jeans', category: 'clothing', price: 79 },
  { id: 5, name: 'Novel', category: 'books', price: 15 },
  { id: 6, name: 'Cookbook', category: 'books', price: 35 },
  { id: 7, name: 'Smartphone', category: 'electronics', price: 699 },
  { id: 8, name: 'Jacket', category: 'clothing', price: 149 },
  { id: 9, name: 'Textbook', category: 'books', price: 89 },
  { id: 10, name: 'Tablet', category: 'electronics', price: 449 },
];

export type Products = typeof allProducts

const productSearchSchema = z.object({
  page: z.number().default(1),
  searchQuery: z.string().default(''),
  category: z.enum(['all', 'electronics', 'clothing', 'books']).default('all'),
  minPrice: z.number().optional().default(0),
});

export type ProductSearch = z.infer<typeof productSearchSchema>;

export const Route = createFileRoute('/products')({
  validateSearch: productSearchSchema,
  beforeLoad: ({ search }) => {
    return search
  },
  loader: async ({ context }) => {
    const { page, searchQuery, category, minPrice } = context

    const filteredProducts = allProducts.filter((product) => {
      const matchesQuery = product.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = category === 'all' || product.category === category
      const matchesMinPrice = product.price >= minPrice
      return matchesQuery && matchesCategory && matchesMinPrice
    })
    return { products: filteredProducts }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { products } = Route.useLoaderData()
  const { page, searchQuery, category, minPrice } = Route.useSearch()


  return <ProductList
    Route={Route}
    products={products}
    page={page}
    searchQuery={searchQuery || ''}
    category={category}
    minPrice={minPrice || 0}
  />
}
