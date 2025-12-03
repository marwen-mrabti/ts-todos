import type { Products, ProductSearch } from "@/routes/products";
import { Link } from "@tanstack/react-router";

interface ProductListProps {
  Route: any;
  products: Products;
  page: ProductSearch['page'];
  searchQuery: ProductSearch['searchQuery']
  category: ProductSearch['category'];
  minPrice: ProductSearch['minPrice'];
}

export default function ProductList({ Route, products, page, searchQuery, category, minPrice }: ProductListProps) {

  // Filter products based on search params
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === 'all' || product.category === category;
    const matchesPrice = minPrice && product.price >= minPrice;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Pagination
  const itemsPerPage = 3;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="h-full p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-secondary-foreground mb-8">Product Search</h1>

        {/* Filters */}
        <div className=" rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {

                  const newQuery = e.target.value;

                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.currentTarget;
                    // Navigate using the Link component programmatically
                    window.location.href = `/products?searchQuery=${encodeURIComponent(input.value)}&category=${category}&minPrice=${minPrice}&page=1`;
                  }
                }}
                placeholder="Search products... (press Enter)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Category
              </label>
              <div className="flex gap-2 flex-wrap">
                {(['all', 'electronics', 'clothing', 'books'] as const).map((cat) => (
                  <Link
                    key={cat}
                    from={Route.fullPath}
                    to="/products"
                    search={(prev) => ({
                      ...prev,
                      category: cat,
                      page: 1 // Reset to page 1 when changing filters
                    })}
                    className={`px-4 py-2 rounded-lg transition-colors ${category === cat
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-muted-foreground hover:bg-gray-300'
                      }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Link>
                ))}
              </div>
            </div>

            {/* Min Price Links */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Min Price: ${minPrice}
              </label>
              <div className="flex gap-2 flex-wrap">
                {[0, 50, 100, 200, 500].map((price) => (
                  <Link
                    key={price}
                    from={Route.fullPath}
                    to="/products"
                    search={(prev) => ({
                      ...prev,
                      minPrice: price,
                      page: 1
                    })}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${minPrice === price
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-muted-foreground hover:bg-gray-300'
                      }`}
                  >
                    ${price}+
                  </Link>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <Link
                from={Route.fullPath}
                to="/products"
                search={{
                  page: 1,
                  searchQuery: '',
                  category: 'all',
                  minPrice: 0,
                }}
                className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-center"
              >
                Reset Filters
              </Link>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Results ({filteredProducts.length})
            </h2>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages || 1}
            </span>
          </div>

          {paginatedProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No products found</p>
          ) : (
            <div className="space-y-4">
              {paginatedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{product.category}</p>
                  </div>
                  <span className="text-lg font-bold text-blue-600">${product.price}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Link
              from={Route.fullPath}
              to="/products"
              search={(prev) => ({
                ...prev,
                page: Math.max(1, page - 1)
              })}
              disabled={page === 1}
              className={`px-4 py-2 bg-white border border-gray-300 rounded-lg transition-colors ${page === 1
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-gray-50'
                }`}
            >
              Previous
            </Link>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Link
                key={pageNum}
                from={Route.fullPath}
                to="/products"
                search={(prev) => ({
                  ...prev,
                  page: pageNum
                })}
                className={`px-4 py-2 rounded-lg transition-colors ${page === pageNum
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                {pageNum}
              </Link>
            ))}

            <Link
              from={Route.fullPath}
              to="/products"
              search={(prev) => ({
                ...prev,
                page: Math.min(totalPages, page + 1)
              })}
              disabled={page === totalPages}
              className={`px-4 py-2 bg-white border border-gray-300 rounded-lg transition-colors ${page === totalPages
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-gray-50'
                }`}
            >
              Next
            </Link>
          </div>
        )}

        {/* Current Search Params Display */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm font-mono text-muted-foreground">
            <strong>Current Search Params:</strong>
          </p>
          <pre className="text-xs mt-2 text-gray-600">
            {JSON.stringify({ page, searchQuery, category, minPrice }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}