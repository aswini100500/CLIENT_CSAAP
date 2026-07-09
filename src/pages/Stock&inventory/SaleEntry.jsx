import React, { useState,useEffect } from 'react';
import axios from 'axios';
import useSWR, { mutate } from 'swr';
import { getAuthToken } from '../../store/authSession';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SaleHistory from './SaleHistory';

const API_BASE_URL = import.meta.env.VITE_CSAAP_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL
});

// Add request interceptor to include token
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
  }
);

// SWR fetcher function
const fetcher = (url) => api.get(url).then(res => res.data);

const SaleEntry = () => {

  // State for active tab
  const [activeTab, setActiveTab] = useState('saleEntry');

  // Main form state
  const [formData, setFormData] = useState({
    store_id: '',
    customer_name: '',
    contact_no: '',
    gst_type: 'nogst',
    gst_no: '',
    address: '',
    shipping_address: '',
    sale_date: new Date().toISOString().split('T')[0],
    discount: 0,
    gross_price: 0,
    net_price: 0,
    paid_amount: 0,
    to_account: '',
    percentageType: 'Percentage',
  });

  // Single product entry state (removed product list)
  const [productEntry, setProductEntry] = useState({
    category: '',
    product_id: '',
    batch: '',
    rack: '',
    quantity: '',
    units: '',
    discount_value: 0,
    discount_type: 'Percentage',
    cgst: 0,
    sgst: 0,
    igst: 0,
    sale_price: '',
  });

  // Master data state
  const [masterData, setMasterData] = useState({
    stores: [],
    categories: [],
    products: [],
    filteredProducts: [], // Products filtered by category
    gstTypes: [
      { value: 'nogst', label: 'Cash Sell/Retails' },
      { value: 'intrastate', label: 'Intrastate (CGST/SGST)' },
      { value: 'interstate', label: 'Interstate (IGST)' }
    ],
    accounts: ['Cash Account', 'Bank Account', 'Credit Card', 'Digital Wallet'],
    units: ['Pieces', 'Liter', 'Kg', 'Meter', 'Ton', 'Metric Ton', 'Bucket', 'Barrel', 'Jar', 'Bag', 'Sqft'],
    discountTypes: [
      { value: 'Percentage', label: 'Discount in %' },
      { value: 'Cash', label: 'Discount in Cash' }
    ]
  });

  const [loading, setLoading] = useState(false);

  // Fetch master data using SWR
  const { data: storesData, error: storesError, isLoading: storesLoading } = useSWR('/api/tenant/stores', fetcher);
  const { data: categoriesData, error: categoriesError, isLoading: categoriesLoading } = useSWR('/api/tenant/categories', fetcher);
  const { data: productsData, error: productsError, isLoading: productsLoading } = useSWR('/api/tenant/products', fetcher);

  // Update master data when SWR data is available
  useEffect(() => {
    if (storesData?.success) {
      setMasterData(prev => ({ ...prev, stores: storesData.data || [] }));
    }
    if (categoriesData?.success) {
      setMasterData(prev => ({ ...prev, categories: categoriesData.data || [] }));
    }
    if (productsData?.success) {
      setMasterData(prev => ({ 
        ...prev, 
        products: productsData.data || [],
        filteredProducts: productsData.data || [] // Initially show all products
      }));
    }
  }, [storesData, categoriesData, productsData]);

  // Filter products when category changes
  useEffect(() => {
    if (productEntry.category && masterData.products.length > 0) {
      const filtered = masterData.products.filter(product => 
        product.category_id == productEntry.category || 
        product.category === productEntry.category
      );
      setMasterData(prev => ({ ...prev, filteredProducts: filtered }));
      
      // Reset product selection when category changes
      setProductEntry(prev => ({ ...prev, product_id: '' }));
    } else {
      // If no category selected, show all products
      setMasterData(prev => ({ ...prev, filteredProducts: masterData.products }));
    }
  }, [productEntry.category, masterData.products]);

  // Calculate product totals
  const calculateProductTotals = () => {
    const salePrice = parseFloat(productEntry.sale_price) || 0;
    const quantity = parseFloat(productEntry.quantity) || 0;
    const discountValue = parseFloat(productEntry.discount_value) || 0;
    const discountType = productEntry.discount_type;
    const cgstRate = parseFloat(productEntry.cgst) || 0;
    const sgstRate = parseFloat(productEntry.sgst) || 0;
    const igstRate = parseFloat(productEntry.igst) || 0;
    
    // Calculate sale amount
    const saleAmount = salePrice * quantity;
    
    // Calculate discount
    let discountAmount = 0;
    if (discountType === 'Percentage') {
      discountAmount = saleAmount * (discountValue / 100);
    } else {
      discountAmount = Math.min(discountValue, saleAmount);
    }
    
    // Calculate taxable amount
    const taxableAmount = saleAmount - discountAmount;
    
    // Calculate GST amounts
    const cgstAmount = taxableAmount * (cgstRate / 100);
    const sgstAmount = taxableAmount * (sgstRate / 100);
    const igstAmount = taxableAmount * (igstRate / 100);
    
    // Calculate net amount
    const netAmount = taxableAmount + cgstAmount + sgstAmount + igstAmount;

    return {
      saleAmount,
      discountAmount,
      taxableAmount,
      cgstAmount,
      sgstAmount,
      igstAmount,
      netAmount
    };
  };

  // Update form totals when product details change
  useEffect(() => {
    const totals = calculateProductTotals();
    
    setFormData(prev => ({
      ...prev,
      gross_price: totals.saleAmount,
      net_price: totals.netAmount,
      cgstTotal: totals.cgstAmount,
      sgstTotal: totals.sgstAmount,
      igstTotal: totals.igstAmount,
      totalDiscount: totals.discountAmount
    }));
  }, [productEntry]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle product entry changes
  const handleProductChange = (e) => {
    const { name, value } = e.target;
    
    setProductEntry(prev => {
      const updatedEntry = { ...prev, [name]: value };
      
      // If product is selected, fetch its details
      if (name === 'product_id' && value) {
        const selectedProduct = masterData.filteredProducts.find(p => p.id == value);
        if (selectedProduct) {
          // Auto-populate sale price if available
          if (selectedProduct.sale_price) {
            updatedEntry.sale_price = selectedProduct.sale_price;
          }
          // Auto-populate GST rates if available
          if (selectedProduct.cgst) {
            updatedEntry.cgst = selectedProduct.cgst;
          }
          if (selectedProduct.sgst) {
            updatedEntry.sgst = selectedProduct.sgst;
          }
          if (selectedProduct.igst) {
            updatedEntry.igst = selectedProduct.igst;
          }
          // Auto-populate unit if available
          if (selectedProduct.unit) {
            updatedEntry.units = selectedProduct.unit;
          }
        }
      }
      
      return updatedEntry;
    });
  };

  // Handle discount type radio button change
  const handleDiscountTypeChange = (e) => {
    const { value } = e.target;
    setProductEntry(prev => ({
      ...prev,
      discount_type: value,
      discount_value: 0 // Reset discount value when type changes
    }));
  };

  // Validate sale form before submission
  const validateSaleForm = () => {
    const errors = [];
    
    // Validate customer details
    if (!formData.store_id) errors.push('From Store is required');
    if (!formData.customer_name) errors.push('Customer Name is required');
    if (!formData.contact_no) errors.push('Contact No is required');
    if (!formData.to_account) errors.push('To Account is required');
    
    // Validate product details
    if (!productEntry.product_id) errors.push('Product is required');
    if (!productEntry.quantity || parseFloat(productEntry.quantity) <= 0) errors.push('Valid quantity is required');
    if (!productEntry.sale_price || parseFloat(productEntry.sale_price) <= 0) errors.push('Valid sale price is required');

    return errors;
  };

  // Handle sale submission
  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate the entire form
    const validationErrors = validateSaleForm();
    
    if (validationErrors.length > 0) {
      toast.error(`Please fix the following errors:\n${validationErrors.join('\n')}`, {
        autoClose: 5000,
      });
      return;
    }

    // Validate paid amount
    const paidAmount = parseFloat(formData.paid_amount) || 0;
    if (paidAmount < 0) {
      toast.error('Paid amount cannot be negative');
      return;
    }

    setLoading(true);
    try {
      // Calculate product totals
      const totals = calculateProductTotals();
      
      // Get selected product details
      const selectedProduct = masterData.filteredProducts.find(p => p.id == productEntry.product_id);
      const selectedCategory = masterData.categories.find(c => c.id == productEntry.category);

      // Prepare API request data
      const saleData = {
        store_id: parseInt(formData.store_id),
        customer_name: formData.customer_name.trim(),
        contact_no: formData.contact_no.trim(),
        gst_type: formData.gst_type,
        gst_no: formData.gst_type !== 'nogst' ? formData.gst_no.trim() : '',
        address: formData.address.trim(),
        shipping_address: formData.shipping_address.trim(),
        sale_date: formData.sale_date,
        discount: parseFloat(formData.discount) || 0,
        gross_price: parseFloat(totals.saleAmount.toFixed(2)),
        net_price: parseFloat(totals.netAmount.toFixed(2)),
        paid_amount: paidAmount,
        to_account: formData.to_account,
        products: [{
          product_id: parseInt(productEntry.product_id),
          product_name: selectedProduct?.name || 'Unknown Product',
          category: selectedCategory?.name || productEntry.category,
          category_id: productEntry.category,
          batch: productEntry.batch || '',
          rack: productEntry.rack || '',
          quantity: parseFloat(productEntry.quantity),
          units: productEntry.units || 'Pieces',
          sale_price: parseFloat(productEntry.sale_price),
          discount_value: parseFloat(productEntry.discount_value || 0),
          discount_type: productEntry.discount_type,
          cgst: parseFloat(productEntry.cgst || 0),
          sgst: parseFloat(productEntry.sgst || 0),
          igst: parseFloat(productEntry.igst || 0),
          sale_amount: parseFloat(totals.saleAmount.toFixed(2)),
          discount_amount: parseFloat(totals.discountAmount.toFixed(2)),
          taxable_amount: parseFloat(totals.taxableAmount.toFixed(2)),
          cgst_amount: parseFloat(totals.cgstAmount.toFixed(2)),
          sgst_amount: parseFloat(totals.sgstAmount.toFixed(2)),
          igst_amount: parseFloat(totals.igstAmount.toFixed(2)),
          total_amount: parseFloat(totals.netAmount.toFixed(2))
        }]
      };

      console.log('Sending sale data:', saleData);

      const response = await api.post('/api/tenant/sales', saleData);

      if (response.data.success) {
        toast.success('Sale created successfully! 🎉', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        
        console.log('Sale created:', response.data.data);

        // Reset form
        setFormData({
          store_id: '',
          customer_name: '',
          contact_no: '',
          gst_type: 'nogst',
          gst_no: '',
          address: '',
          shipping_address: '',
          sale_date: new Date().toISOString().split('T')[0],
          discount: 0,
          gross_price: 0,
          net_price: 0,
          paid_amount: 0,
          to_account: '',
          percentageType: 'Percentage',
        });
        
        // Reset product entry
        setProductEntry({
          category: '',
          product_id: '',
          batch: '',
          rack: '',
          quantity: '',
          units: '',
          discount_value: 0,
          discount_type: 'Percentage',
          cgst: 0,
          sgst: 0,
          igst: 0,
          sale_price: '',
        });
        
        // Invalidate SWR cache for sale history
        mutate('/sales/history');
        
      } else {
        throw new Error(response.data.message || 'Failed to create sale');
      }

    } catch (error) {
      console.error('Sale submission error:', error);
      
      // Show detailed error message
      if (error.response?.data?.errors) {
        // Handle validation errors from API
        const errorMessages = Object.values(error.response.data.errors).flat().join(', ');
        toast.error(`Validation error: ${errorMessages}`, {
          autoClose: 6000,
        });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message, {
          autoClose: 5000,
        });
      } else {
        toast.error(error.message || 'Failed to create sale. Please check all fields and try again.', {
          autoClose: 5000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Safe array access helper
  const safeArray = (array) => Array.isArray(array) ? array : [];

  // Check if master data is loading
  const masterDataLoading = storesLoading || categoriesLoading || productsLoading;

  // Render Sale Entry Tab
  const renderSaleEntry = () => {
    if (masterDataLoading) {
      return (
        <div className="bg-white rounded-2xl shadow-xl p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading master data...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Form Header */}
        <div className="bg-linear-to-r from-blue-600 to-indigo-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">New Sale Transaction</h2>
              <p className="text-blue-100 mt-1">Fill in the details below to create a new sale</p>
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <span className="text-white font-semibold">#{Date.now().toString().slice(-6)}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaleSubmit} className="p-8">
          {/* Customer Details Section */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-3 h-8 bg-blue-600 rounded-full mr-4"></div>
              <h3 className="text-xl font-bold text-gray-800">Customer Information</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form Fields */}
              {[
                { label: 'From Store *', name: 'store_id', type: 'select', options: safeArray(masterData.stores), optionValue: 'id', optionLabel: 'name' },
                { label: 'Customer Name *', name: 'customer_name', type: 'text' },
                { label: 'Contact No *', name: 'contact_no', type: 'tel' },
                { label: 'Sale Date *', name: 'sale_date', type: 'date' },
              ].map((field) => (
                <div key={field.name} className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    {field.label}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleInputChange}
                      required
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    >
                      <option value="">Select {field.label.replace(' *', '')}</option>
                      {field.options.map(option => (
                        <option key={option[field.optionValue]} value={option[field.optionValue]}>
                          {option[field.optionLabel]}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleInputChange}
                      required
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    />
                  )}
                </div>
              ))}

              {/* GST Type */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  GST Type *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {safeArray(masterData.gstTypes).map(type => (
                    <label
                      key={type.value}
                      className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        formData.gst_type === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="gst_type"
                        value={type.value}
                        checked={formData.gst_type === type.value}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        required
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700">
                        {type.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* GST Number */}
              {formData.gst_type !== 'nogst' && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    GST Number *
                  </label>
                  <input
                    type="text"
                    name="gst_no"
                    value={formData.gst_no}
                    onChange={handleInputChange}
                    required
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  />
                </div>
              )}

              {/* Address Fields */}
              {[
                { label: 'Address', name: 'address', rows: 2 },
                { label: 'Shipping Address', name: 'shipping_address', rows: 2 },
              ].map((field) => (
                <div key={field.name} className="lg:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    {field.label}
                  </label>
                  <textarea
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    rows={field.rows}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details Section */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-3 h-8 bg-green-600 rounded-full mr-4"></div>
              <h3 className="text-xl font-bold text-gray-800">Product Details</h3>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {[
                  { label: 'Category', name: 'category', type: 'select', options: safeArray(masterData.categories), optionValue: 'id', optionLabel: 'name' },
                  { label: 'Product *', name: 'product_id', type: 'select', options: safeArray(masterData.filteredProducts), optionValue: 'id', optionLabel: 'name' },
                  { label: 'Batch', name: 'batch', type: 'text' },
                  { label: 'Rack', name: 'rack', type: 'text' },
                ].map((field) => (
                  <div key={field.name} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {field.label}
                    </label>
                    {field.type === 'select' ? (
                      <select
                        name={field.name}
                        value={productEntry[field.name]}
                        onChange={handleProductChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        required={field.label.includes('*')}
                      >
                        <option value="">Select {field.label}</option>
                        {field.options.map(option => (
                          <option key={option[field.optionValue]} value={option[field.optionValue]}>
                            {option[field.optionLabel]}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name={field.name}
                        value={productEntry[field.name]}
                        onChange={handleProductChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {[
                  { label: 'Quantity *', name: 'quantity', type: 'number' },
                  { label: 'Units', name: 'units', type: 'select', options: safeArray(masterData.units) },
                  { label: 'Sale Price *', name: 'sale_price', type: 'number', step: '0.01' },
                ].map((field) => (
                  <div key={field.name} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {field.label}
                    </label>
                    {field.type === 'select' ? (
                      <select
                        name={field.name}
                        value={productEntry[field.name]}
                        onChange={handleProductChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Select</option>
                        {field.options.map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        value={productEntry[field.name]}
                        onChange={handleProductChange}
                        step={field.step}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        required={field.label.includes('*')}
                      />
                    )}
                  </div>
                ))}

                {/* Discount Value Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Discount {productEntry.discount_type === 'Percentage' ? '(%)' : '($)'}
                  </label>
                  <input
                    type="number"
                    name="discount_value"
                    value={productEntry.discount_value}
                    onChange={handleProductChange}
                    step="0.01"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Discount Type Radio Buttons */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Discount Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
                  {safeArray(masterData.discountTypes).map(type => (
                    <label
                      key={type.value}
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        productEntry.discount_type === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="discount_type"
                        value={type.value}
                        checked={productEntry.discount_type === type.value}
                        onChange={handleDiscountTypeChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700">
                        {type.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'CGST (%)', name: 'cgst', type: 'number', step: '0.01' },
                  { label: 'SGST (%)', name: 'sgst', type: 'number', step: '0.01' },
                  { label: 'IGST (%)', name: 'igst', type: 'number', step: '0.01' },
                ].map((field) => (
                  <div key={field.name} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={productEntry[field.name]}
                      onChange={handleProductChange}
                      step={field.step}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sale Summary Section */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-3 h-8 bg-purple-600 rounded-full mr-4"></div>
              <h3 className="text-xl font-bold text-gray-800">Sale Summary</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Gross Price', value: formData.gross_price, color: 'blue' },
                { label: 'Total Discount', value: formData.totalDiscount, color: 'orange' },
                ...(formData.gst_type === 'intrastate' ? [
                  { label: 'Total CGST', value: formData.cgstTotal, color: 'green' },
                  { label: 'Total SGST', value: formData.sgstTotal, color: 'green' },
                ] : formData.gst_type === 'interstate' ? [
                  { label: 'Total IGST', value: formData.igstTotal, color: 'green' },
                ] : []),
                { label: 'Net Price', value: formData.net_price, color: 'purple' },
              ].map((item) => (
                <div key={item.label} className="bg-linear-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">{item.label}</span>
                    <div className={`w-2 h-2 rounded-full bg-${item.color}-500`}></div>
                  </div>
                  <div className="text-2xl font-bold text-gray-800">
                    ${(item.value || 0).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Details Section */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-3 h-8 bg-yellow-600 rounded-full mr-4"></div>
              <h3 className="text-xl font-bold text-gray-800">Payment Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Paid Amount *
                </label>
                <input
                  type="number"
                  name="paid_amount"
                  value={formData.paid_amount}
                  onChange={handleInputChange}
                  required
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  To Account *
                </label>
                <select
                  name="to_account"
                  value={formData.to_account}
                  onChange={handleInputChange}
                  required
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                >
                  <option value="">Select Account</option>
                  {safeArray(masterData.accounts).map(account => (
                    <option key={account} value={account}>{account}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-8 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="bg-linear-to-r from-green-600 to-emerald-600 text-white px-12 py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Complete Sale
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8 px-4">
      {/* Toast Notification Container */}
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
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Sales Management</h1>
          <p className="text-gray-600 text-lg">Create and manage sales transactions efficiently</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('saleEntry')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'saleEntry'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Sale Entry
                </div>
              </button>
              <button
                onClick={() => setActiveTab('saleHistory')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'saleHistory'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Sale History
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'saleEntry' && renderSaleEntry()}
        {activeTab === 'saleHistory' && <SaleHistory />}
      </div>
    </div>
  );
};

export default SaleEntry;

