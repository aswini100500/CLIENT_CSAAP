import React, { useState, useEffect } from "react";
import operationApi from "../../../api/operation";

const IndentEntryO = () => {
  const [supplier, setSupplier] = useState({
    id: "",
    name: "",
    contact: "",
    gst: "",
  });

  const [productForm, setProductForm] = useState({
    category: "",
    product: "",
    quantity: "",
    units: "Pieces",
    description: "",
  });

  const [productList, setProductList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [activeTab, setActiveTab] = useState("entry");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
  });
  const [newProduct, setNewProduct] = useState({
    name: "",
    category_id: "",
    description: "",
  });

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      setLoadingConfig(true);
      const response = await operationApi.getIndentMasterData();
      const { categories, products, suppliers } = response.data.data;
      setCategories(categories || []);
      setProducts(products || []);
      setSuppliers(suppliers || []);
    } catch (error) {
      console.error("Error fetching indent master data:", error);
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleCategoryModalChange = (e) => {
    const { name, value } = e.target;
    setNewCategory((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductModalChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const saveCategory = async () => {
    if (!newCategory.name.trim()) {
      alert("Please enter category name");
      return;
    }
    try {
      setLoadingConfig(true);
      await operationApi.createCategory({
        name: newCategory.name,
        description: newCategory.description,
      });
      const master = await operationApi.getIndentMasterData();
      const newCats = master.data.data.categories || [];
      setCategories(newCats);
      const created = newCats.find(
        (c) =>
          String(c.name).toLowerCase() ===
          String(newCategory.name).toLowerCase(),
      );
      if (created && (created.id || created._id)) {
        setProductForm((prev) => ({
          ...prev,
          category: created.id || created._id,
        }));
      }
      setNewCategory({ name: "", description: "" });
      setShowCategoryModal(false);
    } catch (err) {
      console.error("Error creating category:", err);
      alert("Failed to create category");
    } finally {
      setLoadingConfig(false);
    }
  };

  const saveProduct = async () => {
    if (!newProduct.name.trim()) {
      alert("Please enter product name");
      return;
    }
    const catId = newProduct.category_id || productForm.category;
    if (!catId) {
      alert("Please select or add a category first");
      return;
    }
    try {
      setLoadingConfig(true);
      await operationApi.createProduct({
        name: newProduct.name,
        category_id: catId,
        description: newProduct.description,
      });
      const master = await operationApi.getIndentMasterData();
      const newProducts = master.data.data.products || [];
      setProducts(newProducts);
      const created = newProducts.find(
        (p) =>
          String(p.name).toLowerCase() ===
          String(newProduct.name).toLowerCase(),
      );
      if (created && (created.id || created._id)) {
        setProductForm((prev) => ({
          ...prev,
          product: created.id || created._id,
        }));
      }
      setNewProduct({ name: "", category_id: "", description: "" });
      setShowProductModal(false);
    } catch (err) {
      console.error("Error creating product:", err);
      alert("Failed to create product");
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleSupplierSelect = (e) => {
    const supplierId = e.target.value;
    if (!supplierId) {
      setSupplier({ id: "", name: "", contact: "", gst: "" });
      return;
    }
    const selected = suppliers.find((s) => String(s.id) === String(supplierId));
    if (selected) {
      setSupplier({
        id: selected.id,
        name: selected.name,
        contact: selected.phone || selected.contact || "",
        gst: selected.gst_number || selected.gst || "",
      });
    }
  };

  const filteredProducts = productForm.category
    ? products.filter(
        (product) =>
          String(product.category_id) === String(productForm.category) ||
          String(product.categoryId) === String(productForm.category),
      )
    : products;

  const handleProductFormChange = (e) => {
    const { name, value } = e.target;

    setProductForm((prev) => {
      if (name === "category") {
        return {
          ...prev,
          category: value,
          product: "",
        };
      }
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const addProductToList = () => {
    if (!productForm.product || !productForm.quantity) {
      alert("Please select a product and enter quantity");
      return;
    }

    const selectedProduct = products.find(
      (p) => String(p.id) === String(productForm.product),
    );
    const selectedCategory = categories.find(
      (c) => String(c.id) === String(productForm.category),
    );

    const newProduct = {
      id: Date.now(),
      productId: selectedProduct?.id || productForm.product,
      product: selectedProduct?.name || "Unknown Product",
      categoryId: selectedCategory?.id || productForm.category,
      category: selectedCategory?.name || "Unknown Category",
      quantity: productForm.quantity,
      units: productForm.units,
      description: productForm.description,
    };

    setProductList((prev) => [...prev, newProduct]);

    setProductForm({
      category: "",
      product: "",
      quantity: "",
      units: "Pieces",
      description: "",
    });
  };

  const removeProduct = (id) => {
    setProductList((prev) => prev.filter((product) => product.id !== id));
  };

  const saveIndent = async () => {
    if (!supplier.id) {
      alert("Please select a supplier");
      return;
    }

    if (productList.length === 0) {
      alert("Please add at least one product");
      return;
    }

    try {
      setLoadingConfig(true);
      const indentData = {
        supplierId: supplier.id,
        products: productList.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          units: item.units,
          description: item.description || "",
        })),
      };

      const response = await operationApi.saveIndentEntry(indentData);

      if (response.data.success) {
        alert(
          `Indent saved successfully!\nIndent Number: ${response.data.indent_number}`,
        );

        setSupplier({
          id: "",
          name: "",
          contact: "",
          gst: "",
        });
        setProductList([]);
      } else {
        alert(`Error: ${response.data.message || "Failed to save indent"}`);
      }
    } catch (error) {
      console.error("Error saving indent:", error);
      alert("Failed to save indent. Please try again.");
    } finally {
      setLoadingConfig(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-2">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Indent Entry</h1>
      </div>

      <div className="flex justify-center mb-8">
        <div className="flex border-b border-gray-200 w-full max-w-md bg-white rounded-t-lg">
          <button
            onClick={() => setActiveTab("entry")}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === "entry"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            New Indent
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === "history"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            History Of Indent
          </button>
        </div>
      </div>

      {activeTab === "entry" ? (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Supplier Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Supplier <span className="text-red-500">*</span>
                </label>
                <select
                  name="supplierId"
                  value={supplier.id}
                  onChange={handleSupplierSelect}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact No
                </label>
                <input
                  type="tel"
                  name="contact"
                  value={supplier.contact}
                  readOnly
                  className="w-full p-3 border border-gray-200 bg-gray-50 rounded-lg text-gray-500"
                  placeholder="Contact number"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier GST
              </label>
              <input
                type="text"
                name="gst"
                value={supplier.gst}
                readOnly
                className="w-full p-3 border border-gray-200 bg-gray-50 rounded-lg text-gray-500"
                placeholder="GST number"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 my-8"></div>

          <div className="mb-8">
            <div className="flex gap-2">
              <h2 className="text-xl font-semibold text-gray-700 ">
                Product List
              </h2>
              <p className="text-red-800 ">
                (Enter product details and press "Add Product To List" to add
                product)
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCategoryModal(!showCategoryModal);
                        setNewCategory({ name: "", description: "" });
                      }}
                      className="text-green-600 p-1 rounded hover:bg-gray-100"
                      title={
                        showCategoryModal
                          ? "Cancel Add Category"
                          : "Add Category"
                      }
                    >
                      {showCategoryModal ? (
                        <svg
                          className="w-5 h-5 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {showCategoryModal ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="name"
                        value={newCategory.name}
                        onChange={handleCategoryModalChange}
                        className="flex-1 p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="New Category Name"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={saveCategory}
                        disabled={loadingConfig}
                        className="px-4 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 font-semibold"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <select
                      name="category"
                      value={productForm.category}
                      onChange={handleProductFormChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Product <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProductModal(!showProductModal);
                        setNewProduct({
                          name: "",
                          category_id: "",
                          description: "",
                        });
                      }}
                      className="text-green-600 p-1 rounded hover:bg-gray-100"
                      title={
                        showProductModal ? "Cancel Add Product" : "Add Product"
                      }
                      disabled={!productForm.category}
                    >
                      {showProductModal ? (
                        <svg
                          className="w-5 h-5 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {showProductModal ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="name"
                        value={newProduct.name}
                        onChange={handleProductModalChange}
                        className="flex-1 p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="New Product Name"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={saveProduct}
                        disabled={loadingConfig}
                        className="px-4 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 font-semibold"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <select
                      name="product"
                      value={productForm.product}
                      onChange={handleProductFormChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={!productForm.category}
                      required
                    >
                      <option value="">Select Product</option>
                      {filteredProducts.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {!productForm.category && !showProductModal && (
                    <p className="text-xs text-gray-500 mt-1">
                      Please select a category first
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={productForm.quantity}
                    onChange={handleProductFormChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter quantity"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Units
                  </label>
                  <select
                    name="units"
                    value={productForm.units}
                    onChange={handleProductFormChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Pieces">Pieces</option>
                    <option value="Kg">Kilograms</option>
                    <option value="Liters">Liters</option>
                    <option value="Meters">Meters</option>
                    <option value="Box">Box</option>
                    <option value="Pack">Pack</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description / Remarks
                </label>
                <textarea
                  name="description"
                  value={productForm.description}
                  onChange={handleProductFormChange}
                  rows="2"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product description or remarks (optional)"
                />
              </div>

              <button
                onClick={addProductToList}
                className="mt-6 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:scale-101 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
              >
                Add Product To List
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Units
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {productList.length > 0 ? (
                    productList.map((product, index) => (
                      <tr
                        key={product.id}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.product}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.units}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.description || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => removeProduct(product.id)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-8 text-center text-sm text-gray-500"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <svg
                            className="w-12 h-12 text-gray-300 mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1M9 7h6"
                            />
                          </svg>
                          No products added yet. Add products using the form
                          above.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setSupplier({ id: "", name: "", contact: "", gst: "" });
                setProductList([]);
                setProductForm({
                  category: "",
                  product: "",
                  quantity: "",
                  units: "Pieces",
                  description: "",
                });
              }}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200"
            >
              Clear Form
            </button>

            <button
              onClick={saveIndent}
              disabled={loadingConfig}
              className={`px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 ${
                loadingConfig ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loadingConfig ? "Saving..." : "Save Indent"}
            </button>
          </div>
        </>
      ) : (
        <IndentHistory />
      )}
    </div>
  );
};

const IndentHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await operationApi.getIndentHistory();
      setHistory(response.data.data.indents || []);
    } catch (error) {
      console.error("Error fetching indent history:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(
    (item) =>
      item.indent_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-gray-700">Indent History</h2>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search by ID or Supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <button
            onClick={fetchHistory}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-600"
            title="Refresh History"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Indent No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Supplier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center">
                  <div className="flex justify-center items-center gap-2 text-blue-600">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Loading history...</span>
                  </div>
                </td>
              </tr>
            ) : filteredHistory.length > 0 ? (
              filteredHistory.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                    {item.indent_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(item.indent_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {item.supplier_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {item.total_items}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : item.status === "draft"
                            ? "bg-gray-100 text-gray-800"
                            : item.status === "completed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-10 text-center text-gray-500"
                >
                  {searchTerm
                    ? "No indents matching your search found."
                    : "No indent history found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IndentEntryO;
