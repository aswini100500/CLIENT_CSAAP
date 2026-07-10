import React, { useState, useEffect } from "react";
import axios from "axios";
import useSWR, { mutate } from "swr";
import { getAuthToken } from "../../store/authSession";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import IndentHistory from "./IndentHistory";

const API_BASE_URL = import.meta.env.VITE_CSAAP_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const fetcher = (url) => api.get(url).then((res) => res.data);

const IndentEntry = () => {
  const [activeTab, setActiveTab] = useState("entry");
  const [supplier, setSupplier] = useState({
    name: "",
    contact: "",
    gst: "",
  });

  const [productForm, setProductForm] = useState({
    category: "",
    product: "",
    quantity: "",
    units: "Pieces",
  });

  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");

  const [masterData, setMasterData] = useState({
    suppliers: [],
    categories: [],
    products: [],
    filteredProducts: [],
    units: ["Pieces", "Kg", "Liters", "Meters", "Box", "Pack"],
  });

  const {
    data: suppliersData,
    error: suppliersError,
    isLoading: suppliersLoading,
  } = useSWR("/api/tenant/supplier", fetcher);
  const {
    data: categoriesData,
    error: categoriesError,
    isLoading: categoriesLoading,
  } = useSWR("/api/tenant/categories", fetcher);
  const {
    data: productsData,
    error: productsError,
    isLoading: productsLoading,
  } = useSWR("/api/tenant/products", fetcher);

  useEffect(() => {
    if (suppliersData?.success) {
      setMasterData((prev) => ({
        ...prev,
        suppliers: suppliersData.data || [],
      }));
    }
    if (categoriesData?.success) {
      setMasterData((prev) => ({
        ...prev,
        categories: categoriesData.data || [],
      }));
    }
    if (productsData?.success) {
      setMasterData((prev) => ({
        ...prev,
        products: productsData.data || [],
        filteredProducts: productsData.data || [],
      }));
    }
  }, [suppliersData, categoriesData, productsData]);

  useEffect(() => {
    if (productForm.category && masterData.products.length > 0) {
      const filtered = masterData.products.filter(
        (product) =>
          product.category_id == productForm.category ||
          product.category === productForm.category,
      );
      setMasterData((prev) => ({ ...prev, filteredProducts: filtered }));

      setProductForm((prev) => ({ ...prev, product: "" }));
    } else {
      setMasterData((prev) => ({
        ...prev,
        filteredProducts: masterData.products,
      }));
    }
  }, [productForm.category, masterData.products]);

  const handleSupplierSelect = (e) => {
    const supplierId = e.target.value;
    setSelectedSupplierId(supplierId);

    if (supplierId) {
      const selectedSupplier = masterData.suppliers.find(
        (s) => s.id === parseInt(supplierId),
      );
      if (selectedSupplier) {
        setSupplier({
          name: selectedSupplier.name,
          contact: selectedSupplier.phone || selectedSupplier.contact || "",
          gst: selectedSupplier.gst_number || selectedSupplier.gst || "",
        });
      }
    } else {
      setSupplier({
        name: "",
        contact: "",
        gst: "",
      });
    }
  };

  const handleSupplierChange = (e) => {
    const { name, value } = e.target;
    setSupplier((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "name" && value !== "") {
      setSelectedSupplierId("");
    }
  };

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
      toast.error("Please select a product and enter quantity");
      return;
    }

    const selectedProduct = masterData.filteredProducts.find(
      (p) => p.id === parseInt(productForm.product),
    );
    const selectedCategory = masterData.categories.find(
      (c) => c.id === parseInt(productForm.category),
    );

    if (!selectedProduct) {
      toast.error("Invalid product selection");
      return;
    }

    const categoryName =
      selectedProduct.category_name ||
      (selectedCategory ? selectedCategory.name : "Unknown Category");

    const newProduct = {
      id: Date.now(),
      product_id: selectedProduct.id,
      product: selectedProduct.name,
      category_id: selectedProduct.category_id || productForm.category,
      category: categoryName,
      quantity: productForm.quantity,
      units: productForm.units,
      description: selectedProduct.description || "",
    };

    setProductList((prev) => [...prev, newProduct]);

    toast.success("Product added to list!", {
      position: "top-right",
      autoClose: 3000,
    });

    setProductForm({
      category: "",
      product: "",
      quantity: "",
      units: "Pieces",
    });
  };

  const removeProduct = (id) => {
    setProductList((prev) => prev.filter((product) => product.id !== id));
    toast.info("Product removed from list", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const saveIndent = async () => {
    if (!selectedSupplierId && !supplier.name) {
      toast.error("Please select or enter supplier name");
      return;
    }

    if (productList.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    try {
      setLoading(true);

      const apiProducts = productList.map((product) => ({
        productId: parseInt(product.product_id),
        quantity: parseFloat(product.quantity),
        units: product.units,
        description: product.description || "",
      }));

      const indentData = {
        supplierId: selectedSupplierId ? parseInt(selectedSupplierId) : null,
        supplierName: !selectedSupplierId ? supplier.name : null,
        supplierContact: !selectedSupplierId ? supplier.contact : null,
        supplierGst: !selectedSupplierId ? supplier.gst : null,
        products: apiProducts,
      };

      const response = await api.post("/api/tenant/indents/save", indentData);

      if (response.data.success) {
        toast.success(
          `Indent saved successfully!\nIndent Number: ${response.data.indent_number}`,
          {
            position: "top-right",
            autoClose: 5000,
          },
        );

        setSupplier({
          name: "",
          contact: "",
          gst: "",
        });
        setProductList([]);
        setSelectedSupplierId("");
        setProductForm({
          category: "",
          product: "",
          quantity: "",
          units: "Pieces",
        });

        mutate("/indents/history");

        setActiveTab("list");
      } else {
        throw new Error(response.data.message || "Failed to save indent");
      }
    } catch (error) {
      console.error("Error saving indent:", error);

      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors)
          .flat()
          .join(", ");
        toast.error(`Validation error: ${errorMessages}`, {
          autoClose: 6000,
        });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message, {
          autoClose: 5000,
        });
      } else {
        toast.error(
          error.message ||
            "Failed to save indent. Please check all fields and try again.",
          {
            autoClose: 5000,
          },
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const safeArray = (array) => (Array.isArray(array) ? array : []);

  const masterDataLoading =
    suppliersLoading || categoriesLoading || productsLoading;

  const refreshData = () => {
    mutate("/api/tenant/suppliers");
    mutate("/api/tenant/categories");
    mutate("/api/tenant/products");
    toast.info("Refreshing data...", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Indent Management
          </h1>
          <p className="text-lg text-gray-600">
            Create and manage purchase indents
          </p>
        </div>

        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("entry")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "entry"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Create Indent
              </button>
              <button
                onClick={() => setActiveTab("list")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "list"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Indent List
              </button>
            </nav>
          </div>
        </div>

        {activeTab === "entry" && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-6">
                Supplier Information
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Existing Supplier
                </label>
                <select
                  value={selectedSupplierId}
                  onChange={handleSupplierSelect}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  disabled={masterDataLoading}
                >
                  <option value="">Select Supplier</option>
                  {safeArray(masterData.suppliers).map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}{" "}
                      {supplier.gst_number ? `(${supplier.gst_number})` : ""}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Select a supplier to auto-fill details, or enter manually
                  below
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={supplier.name}
                    onChange={handleSupplierChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    placeholder="Enter supplier name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact No
                  </label>
                  <input
                    type="tel"
                    name="contact"
                    value={supplier.contact}
                    onChange={handleSupplierChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    placeholder="Enter contact number"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier GST
                </label>
                <input
                  type="text"
                  name="gst"
                  value={supplier.gst}
                  onChange={handleSupplierChange}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  placeholder="Enter GST number"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-6">
                Product Details
              </h2>

              {masterDataLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading product data...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="category"
                        value={productForm.category}
                        onChange={handleProductFormChange}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        required
                      >
                        <option value="">Select Category</option>
                        {safeArray(masterData.categories).map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {safeArray(masterData.categories).length === 0 && (
                        <p className="text-xs text-red-500 mt-1">
                          No categories available
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="product"
                        value={productForm.product}
                        onChange={handleProductFormChange}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        disabled={!productForm.category}
                        required
                      >
                        <option value="">Select Product</option>
                        {safeArray(masterData.filteredProducts).map(
                          (product) => (
                            <option key={product.id} value={product.id}>
                              {product.name}{" "}
                              {product.description
                                ? `- ${product.description}`
                                : ""}
                            </option>
                          ),
                        )}
                      </select>
                      {!productForm.category && (
                        <p className="text-xs text-gray-500 mt-1">
                          Please select a category first
                        </p>
                      )}
                      {productForm.category &&
                        safeArray(masterData.filteredProducts).length === 0 && (
                          <p className="text-xs text-red-500 mt-1">
                            No products available in this category
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
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        placeholder="Enter quantity"
                        min="1"
                        step="0.01"
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
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      >
                        {safeArray(masterData.units).map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={addProductToList}
                    disabled={
                      loading || !productForm.product || !productForm.quantity
                    }
                    className="mt-8 px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Product To List
                  </button>
                </>
              )}
            </div>

            {productList.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Product List ({productList.length} items)
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Product
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Category
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Units
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {productList.map((product, index) => (
                        <tr
                          key={product.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {product.product}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {product.category}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {product.quantity}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {product.units}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => removeProduct(product.id)}
                              className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-6">
              <button
                onClick={() => {
                  setSupplier({ name: "", contact: "", gst: "" });
                  setProductList([]);
                  setProductForm({
                    category: "",
                    product: "",
                    quantity: "",
                    units: "Pieces",
                  });
                  setSelectedSupplierId("");
                  toast.info("Form cleared", {
                    position: "top-right",
                    autoClose: 2000,
                  });
                }}
                disabled={loading}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
              >
                Clear Form
              </button>

              <button
                onClick={saveIndent}
                disabled={
                  loading ||
                  productList.length === 0 ||
                  (!selectedSupplierId && !supplier.name)
                }
                className="px-8 py-3 bg-linear-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Save Indent
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === "list" && <IndentHistory />}
      </div>
    </div>
  );
};

export default IndentEntry;
