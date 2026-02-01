"use client"

import { Dispatch, SetStateAction, useEffect, useState, useMemo } from 'react';

import AddProduct from '@/components/Form/AddProduct/page';
import EditProduct from '@/components/Form/EditProduct/page';
import Modal from "@/components/UI/Modal/page";
import ProductTableSkeleton from "./ProductTableSkeleton";

type Product = {
  id: number;
  name: string | null;
  category: string | null;
  sizes: string | null;
  description: string | null;
  price: number | null;
  productImgUrl: string | null;
};

interface Props {
    products: Product[];
    setProducts: Dispatch<SetStateAction<Product[]>>;
    isLoading?: boolean
}

export default function ProductTable({ products, setProducts, isLoading }: Props) {

    const [editModal, setEditModal] = useState(false);
    const [addModal, setAddModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | -1>(-1);
    const [enabledStates, setEnabledStates] = useState<{ [key: number]: boolean }>({});
    const [deletingStates, setDeletingStates] = useState<{ [key: number]: boolean }>({});
    const [filterCategory, setFilterCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set());
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    // Build dynamic category list from product data
    const categories = useMemo(() => {
        const cats = new Set<string>();
        products.forEach(p => {
            if (p.category) cats.add(p.category);
        });
        return Array.from(cats).sort();
    }, [products]);

    // Global click detection for delete confirm button
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.confirm-delete-button')) {
                setEnabledStates({});
            }
        };
        window.addEventListener('click', handleClickOutside);
        return () => {
            window.removeEventListener('click', handleClickOutside);
        };
    }, []);

    // Delete Product
    const deleteProduct = async (productId: number) => {
        setDeletingStates(prev => ({ ...prev, [productId]: true }));
        try {
            const res = await fetch(`/api/store/${productId}`, {
                method: 'DELETE',
            })

            if (res.ok) {
                const data = await res.json();
                if (data.success && data.body) {
                    const newArray = products.filter(product => product.id !== data.body);
                    setProducts(newArray);
                    setSelectedProductIds(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(data.body);
                        return newSet;
                    });
                } else {
                    console.error('Delete failed:', data);
                }
            } else {
                const errorData = await res.json();
                console.error('Delete failed:', errorData);
            }
        } catch (error) {
            console.error('Error deleting product:', error);
        } finally {
            setDeletingStates(prev => {
                const newState = { ...prev };
                delete newState[productId];
                return newState;
            });
            setEnabledStates(prev => {
                const newState = { ...prev };
                delete newState[productId];
                return newState;
            });
        }
    }

    // Toggle Enabled States
    const toggleEnabled = (id: number) => {
        setEnabledStates(prev => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    // Filter and search products
    const filteredProducts = useMemo(() => {
        let filtered = products;

        // Filter by category
        if (filterCategory !== 'All') {
            filtered = filtered.filter(product => product.category === filterCategory);
        }

        // Search by name
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(product =>
                product.name?.toLowerCase().includes(query)
            );
        }

        // Sort by name
        return [...filtered].sort((a, b) =>
            (a.name || '').localeCompare(b.name || '')
        );
    }, [products, filterCategory, searchQuery]);

    // Clear selections for items that are no longer in the filtered results
    useEffect(() => {
        const visibleIds = new Set(filteredProducts.map(product => product.id));
        setSelectedProductIds(prev => {
            const newSet = new Set<number>();
            prev.forEach(id => {
                if (visibleIds.has(id)) {
                    newSet.add(id);
                }
            });
            return newSet;
        });
    }, [filteredProducts]);

    // Handle checkbox selection
    const handleSelectProduct = (productId: number) => {
        setSelectedProductIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(productId)) {
                newSet.delete(productId);
            } else {
                newSet.add(productId);
            }
            return newSet;
        });
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectedProductIds.size === filteredProducts.length) {
            setSelectedProductIds(new Set());
        } else {
            setSelectedProductIds(new Set(filteredProducts.map(product => product.id)));
        }
    };

    // Bulk delete
    const handleBulkDelete = async () => {
        if (selectedProductIds.size === 0 || isBulkDeleting) return;

        if (!confirm(`Are you sure you want to delete ${selectedProductIds.size} product(s)?`)) {
            return;
        }

        setIsBulkDeleting(true);
        const idsToDelete = Array.from(selectedProductIds);

        try {
            const deletePromises = idsToDelete.map(id =>
                fetch(`/api/store/${id}`, {
                    method: "DELETE",
                })
            );

            const results = await Promise.all(deletePromises);
            const successful = results.filter(res => res.ok);

            if (successful.length === idsToDelete.length) {
                setProducts(prev => prev.filter(product => !selectedProductIds.has(product.id)));
                setSelectedProductIds(new Set());
            } else {
                console.error('Some deletions failed');
                const failedIds = new Set(
                    idsToDelete.filter((_, index) => !results[index].ok)
                );
                setProducts(prev => prev.filter(product => !selectedProductIds.has(product.id) || failedIds.has(product.id)));
                setSelectedProductIds(failedIds);
            }
        } catch (error) {
            console.error('Bulk delete error:', error);
        } finally {
            setIsBulkDeleting(false);
        }
    };

    return (
      <>
        {editModal && selectedProduct !== -1 && selectedProduct ? (
          <Modal title="Edit Product" setModalEnable={setEditModal}>
            <EditProduct product={selectedProduct} setProducts={setProducts} setModalEnable={setEditModal} />
          </Modal>
        ) : null}

        {addModal && (
          <Modal title="Add Product" setModalEnable={setAddModal}>
            <AddProduct setProducts={setProducts} setModalEnable={setAddModal} />
          </Modal>
        )}

        <div className="px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-base font-semibold text-[var(--foreground)]">Store</h1>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
                type="button"
                className="block rounded-md bg-[var(--primary)] px-3 py-2 text-center text-sm font-semibold text-[var(--button-text)] shadow-sm hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[var(--primary-hover)]"
                onClick={() => setAddModal(true)}
              >
                Add Product
              </button>
            </div>
          </div>

          {/* Filter and Search Controls */}
          {products.length > 0 && (
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                  {/* Filter by Category */}
                  <div className="sm:w-48">
                      <label htmlFor="filter-category" className="block text-sm/6 font-medium text-[var(--foreground)] mb-2">
                          Filter by Category
                      </label>
                      <select
                          id="filter-category"
                          name="filter-category"
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                          className="block w-full px-3 py-2 rounded-md bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent sm:text-sm"
                      >
                          <option value="All">All Categories</option>
                          {categories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                          ))}
                      </select>
                  </div>

                  {/* Search by Name */}
                  <div className="sm:w-64">
                      <label htmlFor="search-name" className="block text-sm/6 font-medium text-[var(--foreground)] mb-2">
                          Search by Name
                      </label>
                      <input
                          id="search-name"
                          name="search-name"
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search products..."
                          className="block w-full px-3 py-2 rounded-md bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent sm:text-sm"
                      />
                  </div>
              </div>
          )}

          {/* Bulk Actions Bar */}
          {selectedProductIds.size > 0 && (
              <div className="mt-4 flex items-center justify-between rounded-md bg-[var(--card-bg)] p-4 border border-[var(--border)]">
                  <span className="text-sm font-medium text-[var(--foreground)]">
                      {selectedProductIds.size} product{selectedProductIds.size !== 1 ? 's' : ''} selected
                  </span>
                  <button
                      onClick={handleBulkDelete}
                      disabled={isBulkDeleting}
                      className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      {isBulkDeleting ? 'Deleting...' : `Delete ${selectedProductIds.size} product${selectedProductIds.size !== 1 ? 's' : ''}`}
                  </button>
              </div>
          )}

          {isLoading ? (
            <div className="mt-8 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <div className="overflow-x-auto shadow ring-1 ring-black/5 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-[var(--border)]">
                      <thead className="bg-[var(--card-bg)]">
                        <tr>
                          <th className="relative w-12 px-6 sm:w-16 sm:px-8"></th>
                          <th className="pl-3 pr-3.5 text-left text-sm font-semibold text-[var(--foreground)] sm:pl-6 w-1/4">Name</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">Category</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">Price</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">Sizes</th>
                          <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Edit</span></th>
                        </tr>
                      </thead>
                      <ProductTableSkeleton />
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : products.length > 0 && products ? (
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="overflow-x-auto shadow ring-1 ring-black/5 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-[var(--border)]">
                    <thead className="bg-[var(--card-bg)]">
                      <tr>
                        <th scope="col" className="relative w-12 px-6 sm:w-16 sm:px-8">
                          <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                              checked={filteredProducts.length > 0 && selectedProductIds.size === filteredProducts.length}
                              onChange={handleSelectAll}
                              aria-label="Select all products"
                          />
                        </th>
                        <th scope="col" className="pl-3 pr-3.5 text-left text-sm font-semibold text-[var(--foreground)] sm:pl-6 w-1/4">
                          Name
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">
                          Category
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">
                          Price
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-[var(--foreground)]">
                          Sizes
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Edit</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)] bg-[var(--card-bg)]">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product: Product, idx: number) => {
                          const enabled = enabledStates[product.id] || false;
                          const isDeleting = deletingStates[product.id] || false;

                          const handleDeleteClick = async () => {
                            if (isDeleting) return;
                            if (!enabled) {
                              toggleEnabled(product.id);
                            } else {
                              await deleteProduct(product.id);
                            }
                          };

                          return (
                            <tr
                              key={product.id ?? idx}
                              className="transition-colors duration-150"
                            >
                              <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                                    checked={selectedProductIds.has(product.id)}
                                    onChange={() => handleSelectProduct(product.id)}
                                    aria-label={`Select ${product.name}`}
                                />
                              </td>
                              <td className="whitespace-nowrap pl-3 pr-3 text-sm font-medium text-[var(--foreground)] sm:pl-6 w-full sm:w-1/3 md:w-1/4 max-w-[220px]">
                                <div className="flex items-center gap-3">
                                  {product.productImgUrl && (
                                    <img
                                      src={product.productImgUrl}
                                      alt={product.name || ''}
                                      className="h-10 w-10 rounded object-cover"
                                    />
                                  )}
                                  <span>{product.name}</span>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)]">
                                {product.category}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)]">
                                {product.price != null ? `$${product.price.toFixed(2)}` : '-'}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--foreground)] max-w-xs truncate">
                                {product.sizes || '-'}
                              </td>
                              <td className="whitespace-nowrap pr-6 py-4 text-sm text-[var(--foreground)] flex items-center justify-end gap-6">
                                  <button
                                      onClick={() => {
                                          handleDeleteClick();
                                      }}
                                      disabled={isDeleting}
                                      className={`confirm-delete-button relative inline-flex h-6 w-16 items-center justify-center rounded-full ${isDeleting ? 'bg-gray-400 cursor-not-allowed opacity-60' : enabled ? 'bg-red-600 hover:bg-red-500 cursor-pointer' : 'bg-[var(--background) hover:bg-[var(--muted)]/5 cursor-pointer'} ring-1 ring-[var(--border)]`}
                                  >
                                      {isDeleting ? (
                                          <span className="text-xs text-white font-semibold">...</span>
                                      ) : (
                                          <>
                                              <span className="text-xs text-white font-semibold">
                                                  {enabled ? 'Confirm' : ''}
                                              </span>
                                              <span className="text-xs text-[var(--foreground)] group-hover:text-red-600 text-right-1 font-semibold">
                                                  {!enabled ? 'Delete' : ''}
                                              </span>
                                          </>
                                      )}
                                  </button>
                                  <button
                                      onClick={() => {
                                      setSelectedProduct(product);
                                      setEditModal(true);
                                      }}
                                      className="text-[var(--primary)] bg-[var(--card-bg)] hover:text-[var(--background)] hover:bg-[var(--primary)] cursor-pointer rounded-full ring-1 ring-[var(--border)] py-1 px-3">
                                      Edit<span className="sr-only">, {product.name}</span>
                                  </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-sm text-[var(--muted)]">
                            No products found matching your filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          ) : (
            <div className="flex mt-10 p-6 text-sm text-[var(--muted)] items-center justify-center">No products available.</div>
          )}
        </div>
      </>
    )
  }
