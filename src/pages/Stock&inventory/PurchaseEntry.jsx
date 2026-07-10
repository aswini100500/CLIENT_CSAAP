import React, { useState, useEffect } from "react";
import axios from "axios";
import useSWR, { mutate } from "swr";
import { getAuthToken } from "../../store/authSession";
import { CheckCircle, AlertCircle, X } from "lucide-react";

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

const PurchaseEntry = () => {
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
    title: "",
  });

  const showNotification = (type, title, message) => {
    setNotification({
      show: true,
      type,
      title,
      message,
    });

    setTimeout(() => {
      setNotification({ show: false, type: "", message: "", title: "" });
    }, 3000);
  };

  const { data: storesData, isLoading: storesLoading } = useSWR(
    "/api/tenant/stores",
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  const { data: suppliersData, isLoading: suppliersLoading } = useSWR(
    "/api/tenant/supplier",
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  const { data: categoriesData, isLoading: categoriesLoading } = useSWR(
    "/api/tenant/categories",
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  const { data: productsData, isLoading: productsLoading } = useSWR(
    "/api/tenant/products",
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  const stores = storesData?.success ? storesData.data : [];
  const suppliers = suppliersData?.success ? suppliersData.data : [];
  const categories = categoriesData?.success ? categoriesData.data : [];
  const products = productsData?.success ? productsData.data : [];

  const [formData, setFormData] = useState({
    billNo: "",
    toStore: "",
    supplierName: "",
    contactNo: "",
    supplierGST: "",
    storeGST: "",
    gstType: "NoGST",
    purchaseDate: new Date().toISOString().split("T")[0],
    discount: 0,
    netPrice: 0,
    paidAmount: 0,
    toAccount: "",
    pendingAmount: 0,
    notes: "",
  });

  const [selectedIds, setSelectedIds] = useState({
    store_id: "",
    supplier_id: "",
  });

  const [showAddStoreForm, setShowAddStoreForm] = useState(false);
  const [newStore, setNewStore] = useState({
    name: "",
    address: "",
    gst_number: "",
    location: "",
    mobile: "",
    alternate_mobile: "",
  });

  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
  });

  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category_id: "",
    description: "",
  });

  const [product, setProduct] = useState({
    category: "",
    product: "",
    batch: "",
    quantity: 0,
    units: "",
    pieces: 0,
    rack: "",
    mrp: 0,
    purchaseUnitPrice: 0,
    saleUnitPrice: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    totalPrice: 0,
  });

  const [productList, setProductList] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "paidAmount") {
      const paidAmount = parseFloat(value) || 0;
      const netPrice = parseFloat(totals.netPrice) || 0;
      const pendingAmount = netPrice - paidAmount;

      setFormData({
        ...formData,
        [name]: value,
        pendingAmount: pendingAmount > 0 ? pendingAmount : 0,
      });
    } else if (name === "discount") {
      const discount = parseFloat(value) || 0;
      setFormData({
        ...formData,
        [name]: value,
        pendingAmount:
          parseFloat(totals.netPrice) -
          parseFloat(formData.paidAmount || 0) -
          discount,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleStoreChange = (e) => {
    const { name, value } = e.target;
    setNewStore({
      ...newStore,
      [name]: value,
    });
  };

  const handleCategoryChange = (e) => {
    const { name, value } = e.target;
    setNewCategory({
      ...newCategory,
      [name]: value,
    });
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;

    const numericFields = [
      "quantity",
      "pieces",
      "mrp",
      "purchaseUnitPrice",
      "saleUnitPrice",
      "cgst",
      "sgst",
      "igst",
      "totalPrice",
    ];

    const processedValue = numericFields.includes(name)
      ? parseFloat(value) || 0
      : value;

    setProduct({
      ...product,
      [name]: processedValue,
    });
  };

  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: value,
    });
  };

  const handleAddStore = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/api/tenant/stores", newStore);
      if (response.data.success) {
        mutate("/api/tenant/stores");
        const store = response.data.data;
        setFormData({
          ...formData,
          toStore: store.name,
          storeGST: store.gst_number || "",
        });
        setSelectedIds({
          ...selectedIds,
          store_id: store.id,
        });
        setNewStore({
          name: "",
          address: "",
          gst_number: "",
          location: "",
          mobile: "",
          alternate_mobile: "",
        });
        setShowAddStoreForm(false);
        showNotification("success", "Success!", "Store created successfully!");
      }
    } catch (error) {
      console.error("Error adding store:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to add store. Please try again.";
      showNotification("error", "Error", errorMessage);
    }
  };

  const handleCancelAddStore = () => {
    setNewStore({
      name: "",
      address: "",
      gst_number: "",
      location: "",
      mobile: "",
      alternate_mobile: "",
    });
    setShowAddStoreForm(false);
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/api/tenant/categories", newCategory);
      if (response.data.success) {
        mutate("/api/tenant/categories");
        setProduct({
          ...product,
          category: response.data.data.name,
        });
        setNewCategory({
          name: "",
          description: "",
        });
        setShowAddCategoryForm(false);
        showNotification(
          "success",
          "Success!",
          "Category created successfully!",
        );
      }
    } catch (error) {
      console.error("Error adding category:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to add category. Please try again.";
      showNotification("error", "Error", errorMessage);
    }
  };

  const handleCancelAddCategory = () => {
    setNewCategory({
      name: "",
      description: "",
    });
    setShowAddCategoryForm(false);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/api/tenant/products", newProduct);
      if (response.data.success) {
        mutate("/api/tenant/products");
        const productData = response.data.data;
        setProduct({
          ...product,
          product: productData.name,
        });
        setNewProduct({
          name: "",
          category_id: "",
          description: "",
        });
        setShowAddProductForm(false);
        showNotification(
          "success",
          "Success!",
          "Product created successfully!",
        );
      }
    } catch (error) {
      console.error("Error adding product:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to add product. Please try again.";
      showNotification("error", "Error", errorMessage);
    }
  };

  const handleCancelAddProduct = () => {
    setNewProduct({
      name: "",
      category_id: "",
      description: "",
    });
    setShowAddProductForm(false);
  };

  const handleStoreSelect = (e) => {
    const selectedStore = stores.find((store) => store.name === e.target.value);
    setFormData({
      ...formData,
      toStore: e.target.value,
      storeGST: selectedStore ? selectedStore.gst_number : "",
    });
    setSelectedIds({
      ...selectedIds,
      store_id: selectedStore ? selectedStore.id : "",
    });
  };

  const handleSupplierSelect = (e) => {
    const selectedSupplier = suppliers.find(
      (supplier) => supplier.name === e.target.value,
    );
    setFormData({
      ...formData,
      supplierName: e.target.value,
      contactNo: selectedSupplier ? selectedSupplier.phone : "",
      supplierGST: selectedSupplier ? selectedSupplier.gst_number : "",
    });
    setSelectedIds({
      ...selectedIds,
      supplier_id: selectedSupplier ? selectedSupplier.id : "",
    });
  };

  const handleCategorySelect = (e) => {
    const value = e.target.value;
    setProduct({
      ...product,
      category: value,
    });
  };

  const handleProductSelect = (e) => {
    const selectedProduct = products.find((p) => p.name === e.target.value);
    setProduct({
      ...product,
      product: e.target.value,
      product_id: selectedProduct ? selectedProduct.id : "",
    });
  };

  const addProductToList = () => {
    if (!product.product) {
      showNotification(
        "error",
        "Validation Error",
        "Please select a product first.",
      );
      return;
    }

    if (product.quantity <= 0 || product.purchaseUnitPrice <= 0) {
      showNotification(
        "error",
        "Validation Error",
        "Please enter valid quantity and purchase price.",
      );
      return;
    }

    const selectedProduct = products.find((p) => p.name === product.product);
    if (!selectedProduct) {
      showNotification(
        "error",
        "Validation Error",
        "Selected product not found.",
      );
      return;
    }

    const totalPrice = product.quantity * product.purchaseUnitPrice;

    let cgst = 0,
      sgst = 0,
      igst = 0;
    if (formData.gstType === "IntraState") {
      cgst = product.cgst || 0;
      sgst = product.sgst || 0;
    } else if (formData.gstType === "Unregistered") {
      igst = product.igst || 0;
    }

    const productWithTotal = {
      ...product,
      product_id: selectedProduct.id,
      totalPrice: totalPrice,
      cgst,
      sgst,
      igst,
      id: Date.now(),
    };

    setProductList([...productList, productWithTotal]);

    setProduct({
      category: "",
      product: "",
      batch: "",
      quantity: 0,
      units: "",
      pieces: 0,
      rack: "",
      mrp: 0,
      purchaseUnitPrice: 0,
      saleUnitPrice: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      totalPrice: 0,
    });

    showNotification(
      "success",
      "Product Added",
      "Product added to list successfully!",
    );
  };

  const removeProduct = (index) => {
    const newList = [...productList];
    newList.splice(index, 1);
    setProductList(newList);
    showNotification(
      "success",
      "Product Removed",
      "Product removed from list successfully!",
    );
  };

  const calculateTotals = () => {
    let totalNetPrice = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;

    productList.forEach((item) => {
      totalNetPrice += item.totalPrice || 0;
      totalCGST += item.cgst || 0;
      totalSGST += item.sgst || 0;
      totalIGST += item.igst || 0;
    });

    const discount = parseFloat(formData.discount) || 0;
    totalNetPrice -= discount;

    return {
      netPrice: totalNetPrice,
      cgst: totalCGST,
      sgst: totalSGST,
      igst: totalIGST,
    };
  };

  const totals = calculateTotals();

  const calculatePendingAmount = () => {
    const netPrice = totals.netPrice || 0;
    const paidAmount = parseFloat(formData.paidAmount) || 0;
    return netPrice - paidAmount;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (
      !formData.billNo ||
      !formData.toStore ||
      !formData.supplierName ||
      !formData.purchaseDate
    ) {
      showNotification(
        "error",
        "Validation Error",
        "Please fill all required fields.",
      );
      setIsSubmitting(false);
      return;
    }

    if (!selectedIds.store_id || !selectedIds.supplier_id) {
      showNotification(
        "error",
        "Validation Error",
        "Please select a valid store and supplier.",
      );
      setIsSubmitting(false);
      return;
    }

    if (productList.length === 0) {
      showNotification(
        "error",
        "Validation Error",
        "Please add at least one product to the list.",
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const purchaseData = {
        bill_no: formData.billNo,
        store_id: selectedIds.store_id,
        supplier_id: selectedIds.supplier_id,
        contact_no: formData.contactNo,
        supplier_gst: formData.supplierGST || "",
        store_gst: formData.storeGST || "",
        gst_type: formData.gstType,
        purchase_date: formData.purchaseDate,
        discount: parseFloat(formData.discount) || 0,
        net_price: totals.netPrice,
        paid_amount: parseFloat(formData.paidAmount) || 0,
        pending_amount: calculatePendingAmount(),
        to_account: formData.toAccount || "",
        notes: formData.notes || "",
        products: productList.map((item) => ({
          product_id: item.product_id,
          batch: item.batch || "",
          quantity: parseFloat(item.quantity) || 0,
          units: item.units || "",
          pieces: parseFloat(item.pieces) || 0,
          rack: item.rack || "",
          mrp: parseFloat(item.mrp) || 0,
          purchase_unit_price: parseFloat(item.purchaseUnitPrice) || 0,
          sale_unit_price: parseFloat(item.saleUnitPrice) || 0,
          cgst: parseFloat(item.cgst) || 0,
          sgst: parseFloat(item.sgst) || 0,
          igst: parseFloat(item.igst) || 0,
          total_price: parseFloat(item.totalPrice) || 0,
        })),
      };

      const response = await api.post("/api/tenant/purchases", purchaseData);

      if (response.data.success) {
        showNotification(
          "success",
          "Success!",
          "Purchase entry saved successfully!",
        );

        setFormData({
          billNo: "",
          toStore: "",
          supplierName: "",
          contactNo: "",
          supplierGST: "",
          storeGST: "",
          gstType: "NoGST",
          purchaseDate: new Date().toISOString().split("T")[0],
          discount: 0,
          netPrice: 0,
          paidAmount: 0,
          toAccount: "",
          pendingAmount: 0,
          notes: "",
        });
        setSelectedIds({
          store_id: "",
          supplier_id: "",
        });
        setProductList([]);

        mutate("/api/tenant/purchases/history");
      } else {
        throw new Error(
          response.data.message || "Failed to save purchase entry",
        );
      }
    } catch (error) {
      console.error("Error saving purchase entry:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to save purchase entry. Please try again.";
      showNotification("error", "Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatNumber = (value, decimals = 2) => {
    const num = parseFloat(value);
    return isNaN(num) ? "0.00" : num.toFixed(decimals);
  };

  const renderGSTFields = () => {
    switch (formData.gstType) {
      case "NoGST":
        return null;

      case "IntraState":
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                CGST (%)
              </label>
              <input
                type="number"
                step="0.1"
                name="cgst"
                value={product.cgst}
                onChange={handleProductChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                min="0"
                max="100"
                placeholder="Enter CGST"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                SGST (%)
              </label>
              <input
                type="number"
                step="0.1"
                name="sgst"
                value={product.sgst}
                onChange={handleProductChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                min="0"
                max="100"
                placeholder="Enter SGST"
              />
            </div>
          </>
        );

      case "Unregistered":
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              IGST (%)
            </label>
            <input
              type="number"
              step="0.1"
              name="igst"
              value={product.igst}
              onChange={handleProductChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              min="0"
              max="100"
              placeholder="Enter IGST"
            />
          </div>
        );

      default:
        return null;
    }
  };

  useEffect(() => {
    const netPrice = totals.netPrice;
    const pendingAmount = netPrice - parseFloat(formData.paidAmount || 0);
    setFormData((prev) => ({
      ...prev,
      netPrice: netPrice,
      pendingAmount: pendingAmount > 0 ? pendingAmount : 0,
    }));
  }, [productList, formData.paidAmount]);

  if (
    storesLoading ||
    suppliersLoading ||
    categoriesLoading ||
    productsLoading
  ) {
    return (
      <div className="container mx-auto p-4 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 max-w-sm w-full ${
            notification.type === "success"
              ? "bg-green-50 border-l-4 border-green-500"
              : notification.type === "error"
                ? "bg-red-50 border-l-4 border-red-500"
                : "bg-blue-50 border-l-4 border-blue-500"
          } p-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out`}
        >
          <div className="flex items-start">
            <div
              className={`shrink-0 ${
                notification.type === "success"
                  ? "text-green-600"
                  : notification.type === "error"
                    ? "text-red-600"
                    : "text-blue-600"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircle size={24} />
              ) : notification.type === "error" ? (
                <AlertCircle size={24} />
              ) : (
                <CheckCircle size={24} />
              )}
            </div>
            <div className="ml-3">
              <p
                className={`text-sm font-medium ${
                  notification.type === "success"
                    ? "text-green-800"
                    : notification.type === "error"
                      ? "text-red-800"
                      : "text-blue-800"
                }`}
              >
                {notification.title}
              </p>
              <p
                className={`mt-1 text-sm ${
                  notification.type === "success"
                    ? "text-green-700"
                    : notification.type === "error"
                      ? "text-red-700"
                      : "text-blue-700"
                }`}
              >
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => setNotification({ ...notification, show: false })}
              className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 text-gray-400 hover:text-gray-900"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6 text-center text-blue-800">
        Purchase Entry
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bill No *
            </label>
            <input
              type="text"
              name="billNo"
              value={formData.billNo}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
              placeholder="Enter bill number (e.g., BILL/2026/001)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              To Store *
            </label>

            {showAddStoreForm ? (
              <div className="bg-gray-100 p-4 rounded-md border border-gray-300">
                <h3 className="font-medium mb-3">Add New Store</h3>
                <div className="grid grid-cols-1 gap-2 mb-3">
                  <input
                    type="text"
                    name="name"
                    value={newStore.name}
                    onChange={handleStoreChange}
                    className="border border-gray-300 rounded-md p-2 text-sm"
                    placeholder="Store Name *"
                    autoFocus
                    required
                  />
                  <input
                    type="text"
                    name="address"
                    value={newStore.address}
                    onChange={handleStoreChange}
                    className="border border-gray-300 rounded-md p-2 text-sm"
                    placeholder="Address *"
                    required
                  />
                  <input
                    type="text"
                    name="gst_number"
                    value={newStore.gst_number}
                    onChange={handleStoreChange}
                    className="border border-gray-300 rounded-md p-2 text-sm"
                    placeholder="GST Number"
                  />
                  <input
                    type="text"
                    name="location"
                    value={newStore.location}
                    onChange={handleStoreChange}
                    className="border border-gray-300 rounded-md p-2 text-sm"
                    placeholder="Location"
                  />
                  <input
                    type="text"
                    name="mobile"
                    value={newStore.mobile}
                    onChange={handleStoreChange}
                    className="border border-gray-300 rounded-md p-2 text-sm"
                    placeholder="Mobile Number *"
                    required
                  />
                  <input
                    type="text"
                    name="alternate_mobile"
                    value={newStore.alternate_mobile}
                    onChange={handleStoreChange}
                    className="border border-gray-300 rounded-md p-2 text-sm"
                    placeholder="Alternate Mobile"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleAddStore}
                    className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 text-sm"
                  >
                    Add Store
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelAddStore}
                    className="bg-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-400 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-2">
                <select
                  name="toStore"
                  value={formData.toStore}
                  onChange={handleStoreSelect}
                  className="flex-1 border border-gray-300 rounded-md p-2"
                  required
                >
                  <option value="">Select a store</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.name}>
                      {store.name} - {store.location}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowAddStoreForm(true)}
                  className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 flex items-center"
                  title="Add new store"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Supplier Name *
            </label>
            <div className="flex space-x-2">
              <select
                name="supplierName"
                value={formData.supplierName}
                onChange={handleSupplierSelect}
                className="flex-1 border border-gray-300 rounded-md p-2"
                required
              >
                <option value="">Select a supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.name}>
                    {supplier.name} - {supplier.phone}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contact No *
            </label>
            <input
              type="text"
              name="contactNo"
              value={formData.contactNo}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
              placeholder="Supplier contact number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Supplier GST
            </label>
            <input
              type="text"
              name="supplierGST"
              value={formData.supplierGST}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder="Supplier GST number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Store GST
            </label>
            <input
              type="text"
              name="storeGST"
              value={formData.storeGST}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder="Store GST number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              GST Type
            </label>
            <select
              name="gstType"
              value={formData.gstType}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            >
              <option value="NoGST">No GST</option>
              <option value="IntraState">Intra State (CGST/SGST)</option>
              <option value="Unregistered">Inter State (IGST)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Purchase Date *
            </label>
            <input
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="2"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder="Add any additional notes here..."
            />
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">
            Product List
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Enter Product details and press "Add Product To List" to add product
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              {showAddCategoryForm ? (
                <div className="flex space-x-2 items-center">
                  <input
                    type="text"
                    name="name"
                    value={newCategory.name}
                    onChange={handleCategoryChange}
                    className="flex-1 border border-gray-300 rounded-md p-2"
                    placeholder="New category name *"
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="bg-green-500 text-white px-2 py-2 rounded-md hover:bg-green-600"
                    title="Save category"
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelAddCategory}
                    className="bg-gray-300 text-gray-700 px-2 py-2 rounded-md hover:bg-gray-400"
                    title="Cancel"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <select
                    name="category"
                    value={product.category}
                    onChange={handleCategorySelect}
                    className="flex-1 border border-gray-300 rounded-md p-2"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowAddCategoryForm(true)}
                    className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 flex items-center"
                    title="Add new category"
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Product *
              </label>
              {showAddProductForm ? (
                <div className="bg-gray-100 p-4 rounded-md border border-gray-300">
                  <h3 className="font-medium mb-2 text-sm">Add New Product</h3>
                  <div className="grid grid-cols-1 gap-2 mb-3">
                    <input
                      type="text"
                      name="name"
                      value={newProduct.name}
                      onChange={handleNewProductChange}
                      className="border border-gray-300 rounded-md p-2 text-sm"
                      placeholder="Product Name *"
                      autoFocus
                      required
                    />
                    <select
                      name="category_id"
                      value={newProduct.category_id}
                      onChange={handleNewProductChange}
                      className="border border-gray-300 rounded-md p-2 text-sm"
                      required
                    >
                      <option value="">Select Category *</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <textarea
                      name="description"
                      value={newProduct.description}
                      onChange={handleNewProductChange}
                      className="border border-gray-300 rounded-md p-2 text-sm"
                      placeholder="Description"
                      rows="2"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={handleAddProduct}
                      className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 text-sm"
                    >
                      Add Product
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelAddProduct}
                      className="bg-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-400 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <select
                    name="product"
                    value={product.product}
                    onChange={handleProductSelect}
                    className="flex-1 border border-gray-300 rounded-md p-2"
                    required
                  >
                    <option value="">Select product</option>
                    {products
                      .filter(
                        (prod) =>
                          !product.category ||
                          categories.find((cat) => cat.id === prod.category_id)
                            ?.name === product.category,
                      )
                      .map((prod) => (
                        <option key={prod.id} value={prod.name}>
                          {prod.name}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowAddProductForm(true)}
                    className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 flex items-center"
                    title="Add new product"
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Batch
              </label>
              <input
                type="text"
                name="batch"
                value={product.batch}
                onChange={handleProductChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                placeholder="Batch number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                value={product.quantity}
                onChange={handleProductChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                min="0.01"
                step="0.01"
                required
                placeholder="Enter quantity"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Units
              </label>
              <select
                name="units"
                value={product.units}
                onChange={handleProductChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              >
                <option value="">Select Unit</option>
                <option value="Piece">Piece</option>
                <option value="Pack">Pack</option>
                <option value="Kilogram">Kilogram</option>
                <option value="Box">Box</option>
                <option value="Meters">Meters</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pieces
              </label>
              <input
                type="number"
                name="pieces"
                value={product.pieces}
                onChange={handleProductChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                min="0"
                placeholder="Number of pieces"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rack
              </label>
              <input
                type="text"
                name="rack"
                value={product.rack}
                onChange={handleProductChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                placeholder="Rack location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                MRP
              </label>
              <input
                type="number"
                step="0.01"
                name="mrp"
                value={product.mrp}
                onChange={handleProductChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                min="0"
                placeholder="Maximum Retail Price"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Purchase Unit Price *
              </label>
              <input
                type="number"
                step="0.01"
                name="purchaseUnitPrice"
                value={product.purchaseUnitPrice}
                onChange={handleProductChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                min="0.01"
                required
                placeholder="Price per unit"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Sale Unit Price
              </label>
              <input
                type="number"
                step="0.01"
                name="saleUnitPrice"
                value={product.saleUnitPrice}
                onChange={handleProductChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                min="0"
                placeholder="Selling price per unit"
              />
            </div>

            {renderGSTFields()}
          </div>

          <button
            type="button"
            onClick={addProductToList}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Add Product To List
          </button>
        </div>

        {productList.length > 0 && (
          <div className="mb-6 overflow-x-auto">
            <table className="min-w-full table-auto border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Batch
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Rack
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Units
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    MRP
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Purchase Price
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Sale Price
                  </th>
                  {formData.gstType === "IntraState" && (
                    <>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        CGST
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        SGST
                      </th>
                    </>
                  )}
                  {formData.gstType === "Unregistered" && (
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      IGST
                    </th>
                  )}
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Total Price
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {productList.map((item, index) => (
                  <tr
                    key={item.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="border px-4 py-2">{item.product}</td>
                    <td className="border px-4 py-2">{item.batch || "—"}</td>
                    <td className="border px-4 py-2">{item.rack || "—"}</td>
                    <td className="border px-4 py-2 text-right">
                      {formatNumber(item.quantity)}
                    </td>
                    <td className="border px-4 py-2">{item.units || "—"}</td>
                    <td className="border px-4 py-2 text-right">
                      {formatNumber(item.mrp)}
                    </td>
                    <td className="border px-4 py-2 text-right">
                      {formatNumber(item.purchaseUnitPrice)}
                    </td>
                    <td className="border px-4 py-2 text-right">
                      {formatNumber(item.saleUnitPrice)}
                    </td>
                    {formData.gstType === "IntraState" && (
                      <>
                        <td className="border px-4 py-2 text-right">
                          {formatNumber(item.cgst, 1)}%
                        </td>
                        <td className="border px-4 py-2 text-right">
                          {formatNumber(item.sgst, 1)}%
                        </td>
                      </>
                    )}
                    {formData.gstType === "Unregistered" && (
                      <td className="border px-4 py-2 text-right">
                        {formatNumber(item.igst, 1)}%
                      </td>
                    )}
                    <td className="border px-4 py-2 text-right font-bold">
                      {formatNumber(item.totalPrice)}
                    </td>
                    <td className="border px-4 py-2">
                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                        className="text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 text-sm"
                        title="Remove product"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {formData.gstType === "IntraState" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Total CGST
                </label>
                <input
                  type="number"
                  value={totals.cgst}
                  readOnly
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Total SGST
                </label>
                <input
                  type="number"
                  value={totals.sgst}
                  readOnly
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100"
                />
              </div>
            </>
          )}

          {formData.gstType === "Unregistered" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Total IGST
              </label>
              <input
                type="number"
                value={totals.igst}
                readOnly
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Discount
            </label>
            <input
              type="number"
              name="discount"
              value={formData.discount}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              min="0"
              step="0.01"
              placeholder="Enter discount amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Net Price
            </label>
            <div className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100 font-bold text-lg">
              ₹{formatNumber(totals.netPrice)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Paid Amount
            </label>
            <input
              type="number"
              name="paidAmount"
              value={formData.paidAmount}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              min="0"
              step="0.01"
              placeholder="Amount paid"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              To Account
            </label>
            <input
              type="text"
              name="toAccount"
              value={formData.toAccount}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder="Account name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Pending Amount
            </label>
            <div
              className={`mt-1 block w-full border rounded-md p-2 font-bold text-lg ${
                calculatePendingAmount() > 0
                  ? "bg-red-50 border-red-300 text-red-600"
                  : "bg-green-50 border-green-300 text-green-600"
              }`}
            >
              ₹{formatNumber(calculatePendingAmount())}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => {
              setFormData({
                billNo: "",
                toStore: "",
                supplierName: "",
                contactNo: "",
                supplierGST: "",
                storeGST: "",
                gstType: "NoGST",
                purchaseDate: new Date().toISOString().split("T")[0],
                discount: 0,
                netPrice: 0,
                paidAmount: 0,
                toAccount: "",
                pendingAmount: 0,
                notes: "",
              });
              setSelectedIds({
                store_id: "",
                supplier_id: "",
              });
              setProductList([]);
              showNotification("info", "Form Reset", "Form has been reset.");
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
          >
            Reset Form
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              "Save Purchase Entry"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PurchaseEntry;
