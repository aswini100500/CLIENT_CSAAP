import React from "react";
import { useState } from "react";
import {
  Layers,
  Plus,
  Search,
  Trash2,
  X,
  Boxes,
} from "lucide-react";

export default function ItemCategories() {
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: "Raw Materials",
      description: "Primary materials used in production",
      items: 24,
      value: "₹15,42,800.00",
      parent: null,
      isActive: true,
      products: [
        {
          id: 1,
          name: "Steel Rods",
          code: "STM001",
          price: "₹1,200.00",
          stock: 150,
          unit: "kg",
        },
        {
          id: 2,
          name: "Copper Wires",
          code: "COP002",
          price: "₹850.00",
          stock: 200,
          unit: "meters",
        },
      ],
    },
    {
      id: 2,
      name: "Finished Goods",
      description: "Completed products ready for sale",
      items: 18,
      value: "₹28,75,600.00",
      parent: null,
      isActive: true,
      products: [
        {
          id: 3,
          name: "LED Bulbs",
          code: "LED001",
          price: "₹250.00",
          stock: 500,
          unit: "pcs",
        },
        {
          id: 4,
          name: "Switches",
          code: "SWT001",
          price: "₹180.00",
          stock: 300,
          unit: "pcs",
        },
      ],
    },
    {
      id: 3,
      name: "Semi-Finished Goods",
      description: "Partially completed products",
      items: 12,
      value: "₹9,84,300.00",
      parent: null,
      isActive: true,
      products: [
        {
          id: 5,
          name: "Circuit Boards",
          code: "CIR001",
          price: "₹1,500.00",
          stock: 80,
          unit: "pcs",
        },
      ],
    },
    {
      id: 4,
      name: "Consumables",
      description: "Items consumed during operations",
      items: 35,
      value: "₹3,42,100.00",
      parent: null,
      isActive: true,
      products: [
        {
          id: 6,
          name: "Lubricants",
          code: "LUB001",
          price: "₹450.00",
          stock: 100,
          unit: "liters",
        },
      ],
    },
    {
      id: 5,
      name: "Steel",
      description: "Various steel products and raw materials",
      items: 8,
      value: "₹12,45,000.00",
      parent: 1,
      isActive: true,
      products: [
        {
          id: 7,
          name: "Steel Sheets",
          code: "STS001",
          price: "₹2,800.00",
          stock: 50,
          unit: "sheets",
        },
      ],
    },
  ]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "",
    code: "",
    price: "",
    stock: "",
    unit: "",
    categoryId: null,
  });

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = () => {
    if (newProduct.name.trim() && newProduct.categoryId) {
      const updatedCategories = categories.map((category) => {
        if (category.id === newProduct.categoryId) {
          const product = {
            id: category.products.length + 1,
            name: newProduct.name,
            code: newProduct.code,
            price: newProduct.price.startsWith("₹") ? newProduct.price : `₹${newProduct.price}`,
            stock: parseInt(newProduct.stock) || 0,
            unit: newProduct.unit,
          };
          return {
            ...category,
            products: [...category.products, product],
            items: category.items + 1,
          };
        }
        return category;
      });

      setCategories(updatedCategories);
      setNewProduct({
        name: "",
        code: "",
        price: "",
        stock: "",
        unit: "",
        categoryId: null,
      });
      setIsAddingProduct(false);
    }
  };

  const handleDeleteProduct = (categoryId, productId) => {
    const updatedCategories = categories.map((category) => {
      if (category.id === categoryId) {
        return {
          ...category,
          products: category.products.filter((p) => p.id !== productId),
          items: category.items - 1,
        };
      }
      return category;
    });
    setCategories(updatedCategories);
  };

  return (
    <div className="erp-root app-shell min-h-screen p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="bg-white app-panel border border-[#e2f2e9] rounded-2xl p-6 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="size-11 rounded-2xl bg-[#ecfdf5] border border-[#c6f1d6] flex items-center justify-center shrink-0">
              <Layers className="size-6 text-[#00a651]" />
            </div>
            <div>
              <h1 className="app-title text-xl font-extrabold text-[#042f2e]">
                Stock Ledger & Categories
              </h1>
              <p className="app-subtitle text-xs md:text-sm text-[#475569] font-medium mt-0.5">
                Manage item category hierarchy and linked product inventory catalog.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setNewProduct((prev) => ({
                  ...prev,
                  categoryId: categories[0]?.id || 1,
                }));
                setIsAddingProduct(true);
              }}
              className="app-btn-primary flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="size-4" /> Add Product
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="app-panel p-4 border border-[#e2f2e9] rounded-2xl bg-white shadow-2xs">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] size-4" />
            <input
              type="text"
              placeholder="Search categories by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="app-input w-full pl-10 pr-4 py-2.5 border border-[#e2f2e9] rounded-xl text-sm font-medium text-slate-900 bg-white placeholder-[#94a3b8] focus:border-[#00a651] focus:ring-4 focus:ring-[rgba(0,166,81,0.16)] outline-none"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className={`app-panel overflow-hidden border rounded-2xl bg-white shadow-2xs transition-all duration-200 ${
                selectedCategory?.id === category.id
                  ? "border-[#00a651] ring-2 ring-[rgba(0,166,81,0.16)]"
                  : "border-[#e2f2e9] hover:border-[#c6f1d6]"
              }`}
            >
              <div className="app-section-bar px-5 py-4 bg-[#f0fdf4]/60 border-b border-[#e2f2e9] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Boxes className="size-4 text-[#00a651]" />
                  <h3 className="app-heading text-sm font-bold text-[#042f2e]">
                    {category.name}
                  </h3>
                </div>
                <span className="text-xs font-semibold text-[#00a651] bg-[#f0fdf4] px-2.5 py-1 rounded-lg border border-[#c6f1d6]">
                  {category.items} items
                </span>
              </div>

              <div className="p-5 space-y-4">
                <p className="text-xs text-[#475569] font-medium leading-relaxed">
                  {category.description}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-[#e2f2e9] text-xs">
                  <span className="text-[#64748b] font-medium">Category Valuation:</span>
                  <span className="font-bold text-[#042f2e] text-sm">{category.value}</span>
                </div>

                {/* Sub Products List Preview */}
                {category.products && category.products.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#e2f2e9] space-y-2">
                    <p className="text-xs font-bold text-[#475569] uppercase tracking-wider">
                      Linked Products
                    </p>
                    <div className="space-y-2">
                      {category.products.map((prod) => (
                        <div
                          key={prod.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-[#f8faf8] border border-[#e2f2e9] text-xs"
                        >
                          <div>
                            <span className="font-semibold text-slate-900 block">{prod.name}</span>
                            <span className="text-xs text-slate-500 font-medium mt-0.5 block">
                              Code: {prod.code} | Stock: {prod.stock} {prod.unit}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#00a651] text-xs">{prod.price}</span>
                            <button
                              onClick={() => handleDeleteProduct(category.id, prod.id)}
                              className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                              title="Delete Product"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setNewProduct({
                      name: "",
                      code: "",
                      price: "",
                      stock: "",
                      unit: "",
                      categoryId: category.id,
                    });
                    setIsAddingProduct(true);
                  }}
                  className="w-full mt-3 py-2.5 text-xs font-bold text-[#00a651] bg-[#f0fdf4] border border-[#c6f1d6] rounded-xl hover:bg-[#00a651] hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="size-4" /> Add Product to {category.name}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Overlay */}
        {isAddingProduct && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-[#e2f2e9] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden space-y-4">
              <div className="px-6 py-4 bg-[#f0fdf4]/60 border-b border-[#e2f2e9] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-xl bg-[#ecfdf5] border border-[#c6f1d6] flex items-center justify-center">
                    <Plus className="size-4 text-[#00a651]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#042f2e]">
                    Add New Product
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddingProduct(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#042f2e] hover:bg-slate-100 transition-all"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="app-label block text-xs font-bold text-slate-800 mb-1.5">
                    Target Category
                  </label>
                  <select
                    value={newProduct.categoryId || ""}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        categoryId: Number(e.target.value),
                      })
                    }
                    className="app-input w-full px-3.5 py-2.5 border border-[#e2f2e9] rounded-xl text-sm font-medium text-slate-900 bg-white outline-none cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="app-label block text-xs font-bold text-slate-800 mb-1.5">
                    Product Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Copper Cable 2.5mm"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    className="app-input w-full px-3.5 py-2.5 border border-[#e2f2e9] rounded-xl text-sm font-medium text-slate-900 bg-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="app-label block text-xs font-bold text-slate-800 mb-1.5">
                      Product Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. COP003"
                      value={newProduct.code}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, code: e.target.value })
                      }
                      className="app-input w-full px-3.5 py-2.5 border border-[#e2f2e9] rounded-xl text-sm font-medium text-slate-900 bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="app-label block text-xs font-bold text-slate-800 mb-1.5">
                      Unit Price
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 950.00"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, price: e.target.value })
                      }
                      className="app-input w-full px-3.5 py-2.5 border border-[#e2f2e9] rounded-xl text-sm font-medium text-slate-900 bg-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="app-label block text-xs font-bold text-slate-800 mb-1.5">
                      Initial Stock Qty
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={newProduct.stock}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, stock: e.target.value })
                      }
                      className="app-input w-full px-3.5 py-2.5 border border-[#e2f2e9] rounded-xl text-sm font-medium text-slate-900 bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="app-label block text-xs font-bold text-slate-800 mb-1.5">
                      Unit
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. meters / pcs / kg"
                      value={newProduct.unit}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, unit: e.target.value })
                      }
                      className="app-input w-full px-3.5 py-2.5 border border-[#e2f2e9] rounded-xl text-sm font-medium text-slate-900 bg-white outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-[#e2f2e9] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddingProduct(false)}
                  className="app-btn-secondary flex items-center gap-1.5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddProduct}
                  className="app-btn-primary flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="size-4" /> Save Product
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
