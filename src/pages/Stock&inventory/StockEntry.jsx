import React, { useState } from 'react';
import axios from 'axios';
import useSWR, { mutate } from 'swr';
import { getAuthToken } from '../../store/authSession';
import { CheckCircle, AlertCircle, X, Download, Upload, Plus, Search, Filter } from 'lucide-react';
import StockTransferEntry from './StockTransferEntry';
import StockList from './StockList';

// API base URL
const API_BASE_URL = import.meta.env.VITE_CSAAP_URL;

// Create axios instance with authorization
const api = axios.create({
  baseURL: API_BASE_URL,
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

const StockEntry = () => {

  // State for active tab
  const [activeTab, setActiveTab] = useState('stockEntry');

  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: '',
    title: ''
  });

  // Show notification function
  const showNotification = (type, title, message) => {
    setNotification({
      show: true,
      type,
      title,
      message
    });
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '', title: '' });
    }, 3000);
  };

  // Fetch stores from API
  const { data: storesData, isLoading: storesLoading } = useSWR(
    '/api/tenant/stores',
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  // Fetch categories from API
  const { data: categoriesData, isLoading: categoriesLoading } = useSWR(
    '/api/tenant/categories',
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  // Fetch products from API
  const { data: productsData, isLoading: productsLoading } = useSWR(
    '/api/tenant/products',
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  // Fetch stock entries
  // const { data: stockEntriesData, isLoading: stockEntriesLoading, mutate: mutateStockEntries } = useSWR(
  //   '/api/tenant/stock/entry',
  //   fetcher,
  //   {
  //     revalidateOnFocus: true,
  //     revalidateOnReconnect: true,
  //   }
  // );

  // Extract data from SWR responses
  const stores = storesData?.success ? storesData.data : [];
  const categories = categoriesData?.success ? categoriesData.data : [];
  const products = productsData?.success ? productsData.data : [];

  // State for form
  const [formData, setFormData] = useState({
    store_id: '',
    category_id: '',
    product_id: '',
    batch: '',
    rack: '',
    mrp: '',
    sale_price: '',
    quantity: '',
    units: '',
    hsn_code: '',
    purchase_amount: ''
  });

  // State for transfer form
  const [transferForm, setTransferForm] = useState({
    fromStore: '',
    toStore: '',
    product: '',
    quantity: '',
    notes: ''
  });

  // State for adding new items
  const [showAddStore, setShowAddStore] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddRack, setShowAddRack] = useState(false);
  const [newStore, setNewStore] = useState({
    name: '',
    address: '',
    gst_number: '',
    location: '',
    mobile: '',
    alternate_mobile: ''
  });
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: ''
  });
  const [newProduct, setNewProduct] = useState({
    name: '',
    category_id: '',
    description: ''
  });
  const [newRack, setNewRack] = useState('');

  // State for CSV upload
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [csvFile, setCsvFile] = useState(null);

  // State for search and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  const units = ['Pieces', 'Boxes', 'Packets', 'Units', 'Bags', 'Kg', 'Liters'];

  // State for racks (initially empty, will be populated from API or user input)
  const [racks, setRacks] = useState([]);

  // State for submission loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter products based on selected category
  const filteredProducts = formData.category_id 
    ? products.filter(product => product.category_id == formData.category_id)
    : products;

  // API Functions
  const createStore = async () => {
    try {
      const response = await api.post('/api/tenant/stores', newStore);
      if (response.data.success) {
        // Revalidate stores cache
        mutate('/api/tenant/stores');
        setFormData({
          ...formData,
          store_id: response.data.data.id
        });
        setNewStore({
          name: '',
          address: '',
          gst_number: '',
          location: '',
          mobile: '',
          alternate_mobile: ''
        });
        setShowAddStore(false);
        showNotification('success', 'Success!', 'Store created successfully!');
      }
    } catch (error) {
      console.error('Error creating store:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create store. Please try again.';
      showNotification('error', 'Error', errorMessage);
    }
  };

  const createCategory = async () => {
    try {
      const response = await api.post('/api/tenant/categories', newCategory);
      if (response.data.success) {
        // Revalidate categories cache
        mutate('/api/tenant/categories');
        setFormData({
          ...formData,
          category_id: response.data.data.id
        });
        setNewCategory({ name: '', description: '' });
        setShowAddCategory(false);
        showNotification('success', 'Success!', 'Category created successfully!');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create category. Please try again.';
      showNotification('error', 'Error', errorMessage);
    }
  };

  const createProduct = async () => {
    try {
      const response = await api.post('/api/tenant/products', newProduct);
      if (response.data.success) {
        // Revalidate products cache
        mutate('/api/tenant/products');
        setFormData({
          ...formData,
          product_id: response.data.data.id
        });
        setNewProduct({ name: '', category_id: '', description: '' });
        setShowAddProduct(false);
        showNotification('success', 'Success!', 'Product created successfully!');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create product. Please try again.';
      showNotification('error', 'Error', errorMessage);
    }
  };

  // Create stock entry using new API
  const createStockEntry = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    if (!formData.store_id || !formData.category_id || !formData.product_id || !formData.quantity || !formData.units) {
      showNotification('error', 'Validation Error', 'Please fill all required fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare API request data
      const stockEntryData = {
        store_id: formData.store_id,
        product_id: formData.product_id,
        batch: formData.batch || '',
        rack: formData.rack || '',
        mrp: parseFloat(formData.mrp) || 0,
        sale_price: parseFloat(formData.sale_price) || 0,
        quantity: parseFloat(formData.quantity) || 0,
        units: formData.units,
        hsn_code: formData.hsn_code || '',
        purchase_amount: parseFloat(formData.purchase_amount) || 0
      };

      console.log('Submitting stock entry data:', stockEntryData);

      // Call the stock entry API
      const response = await api.post('/api/tenant/stock/entry', stockEntryData);
      
      if (response.data.success) {
        showNotification('success', 'Success!', 'Stock entry created successfully!');
        
        // Reset form
        setFormData({
          store_id: '',
          category_id: '',
          product_id: '',
          batch: '',
          rack: '',
          mrp: '',
          sale_price: '',
          quantity: '',
          units: '',
          hsn_code: '',
          purchase_amount: ''
        });
        
        // Revalidate stock entries cache
        mutateStockEntries();
        
        // Add new rack to racks list if not already present
        if (formData.rack && !racks.includes(formData.rack)) {
          setRacks([...racks, formData.rack]);
        }
      } else {
        throw new Error(response.data.message || 'Failed to create stock entry');
      }
      
    } catch (error) {
      console.error('Error creating stock entry:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create stock entry. Please try again.';
      showNotification('error', 'Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // For numeric fields, keep as string but allow only numbers
    if (['mrp', 'sale_price', 'quantity', 'purchase_amount'].includes(name)) {
      // Allow only numbers and decimal points
      const numericValue = value.replace(/[^0-9.]/g, '');
      setFormData({
        ...formData,
        [name]: numericValue
      });
    } else {
      // If category changes, reset product_id
      if (name === 'category_id') {
        setFormData({
          ...formData,
          [name]: value,
          product_id: '' // Reset product when category changes
        });
      } else {
        setFormData({
          ...formData,
          [name]: value
        });
      }
    }
  };

  // Handle transfer form input changes
  const handleTransferInputChange = (e) => {
    const { name, value } = e.target;
    setTransferForm({
      ...transferForm,
      [name]: value
    });
  };

  // Handle new store input changes
  const handleNewStoreChange = (e) => {
    const { name, value } = e.target;
    setNewStore({
      ...newStore,
      [name]: value
    });
  };

  // Handle new category input changes
  const handleNewCategoryChange = (e) => {
    const { name, value } = e.target;
    setNewCategory({
      ...newCategory,
      [name]: value
    });
  };

  // Handle new product input changes
  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: value
    });
  };

  // Add new rack
  const handleAddRack = () => {
    if (newRack.trim() && !racks.includes(newRack.trim())) {
      setRacks([...racks, newRack.trim()]);
      setFormData({ ...formData, rack: newRack.trim() });
      setNewRack('');
      setShowAddRack(false);
      showNotification('success', 'Rack Added', 'New rack added successfully!');
    }
  };

  // Handle transfer form submission
  const handleTransferSubmit = (e) => {
    e.preventDefault();
    // Implementation for stock transfer
    console.log('Transfer submitted:', transferForm);
    showNotification('success', 'Success!', 'Stock transfer request submitted successfully!');
    setTransferForm({
      fromStore: '',
      toStore: '',
      product: '',
      quantity: '',
      notes: ''
    });
  };

  // Handle transfer acceptance
  const handleAcceptTransfer = (transferId) => {
    showNotification('success', 'Transfer Accepted', `Transfer #${transferId} accepted successfully!`);
  };

  // Handle transfer rejection
  const handleRejectTransfer = (transferId) => {
    showNotification('info', 'Transfer Rejected', `Transfer #${transferId} rejected!`);
  };

  // Download CSV template
  const downloadCSVTemplate = () => {
    const headers = ['Store ID', 'Category ID', 'Product ID', 'Batch', 'Rack', 'MRP', 'Sale Price', 'Quantity', 'Units', 'HSN Code', 'Purchase Amount'];
    const exampleData = [
      ['1', '1', '1', 'BT-INITIAL-001', 'R-01', '450.00', '400.00', '3', 'Bags', '2523', '350.00'],
      ['2', '2', '2', 'BT-INITIAL-002', 'R-02', '500.00', '450.00', '5', 'Boxes', '2524', '400.00']
    ];
    
    const csvContent = [
      headers.join(','),
      ...exampleData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'stock_entry_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification('success', 'Template Downloaded', 'CSV template downloaded successfully!');
  };

  // Handle CSV file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCsvFile(file);
    }
  };

  // Process uploaded CSV
  const processCSVUpload = async () => {
    if (!csvFile) {
      showNotification('error', 'Error', 'Please select a CSV file first.');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const csvText = e.target.result;
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');
        
        // Skip header row and process each line
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim() === '') continue;
          
          const values = lines[i].split(',');
          const stockEntry = {
            store_id: values[0],
            category_id: values[1],
            product_id: values[2],
            batch: values[3],
            rack: values[4],
            mrp: parseFloat(values[5]) || 0,
            sale_price: parseFloat(values[6]) || 0,
            quantity: parseFloat(values[7]) || 0,
            units: values[8],
            hsn_code: values[9],
            purchase_amount: parseFloat(values[10]) || 0
          };
          
          // Create stock entry for each row
          try {
            await api.post('/api/tenant/stock/entry', stockEntry);
          } catch (error) {
            console.error(`Error creating stock entry for row ${i}:`, error);
          }
        }
        
        showNotification('success', 'Success!', 'CSV file processed successfully!');
        setShowUploadForm(false);
        setCsvFile(null);
        
        // Revalidate stock entries cache
        mutateStockEntries();
      };
      reader.readAsText(csvFile);
    } catch (error) {
      console.error('Error processing CSV:', error);
      showNotification('error', 'Error', 'Failed to process CSV file. Please check the format.');
    }
  };

  // Render Stock Entry Tab
  const renderStockEntry = () => (
    <div>
      {/* Notification Component */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${
          notification.type === 'success' 
            ? 'bg-green-50 border-l-4 border-green-500' 
            : notification.type === 'error'
            ? 'bg-red-50 border-l-4 border-red-500'
            : 'bg-blue-50 border-l-4 border-blue-500'
        } p-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out`}>
          <div className="flex items-start">
            <div className={`shrink-0 ${
              notification.type === 'success' 
                ? 'text-green-600' 
                : notification.type === 'error'
                ? 'text-red-600'
                : 'text-blue-600'
            }`}>
              {notification.type === 'success' ? (
                <CheckCircle size={24} />
              ) : notification.type === 'error' ? (
                <AlertCircle size={24} />
              ) : (
                <CheckCircle size={24} />
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                notification.type === 'success' 
                  ? 'text-green-800' 
                  : notification.type === 'error'
                  ? 'text-red-800'
                  : 'text-blue-800'
              }`}>
                {notification.title}
              </p>
              <p className={`mt-1 text-sm ${
                notification.type === 'success' 
                  ? 'text-green-700' 
                  : notification.type === 'error'
                  ? 'text-red-700'
                  : 'text-blue-700'
              }`}>
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

      {/* CSV Actions Buttons */}
      <div className="mb-6 flex flex-wrap gap-4">
        <button 
          onClick={downloadCSVTemplate}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <Download size={18} className="mr-2" />
          Download CSV Template
        </button>
        <button 
          onClick={() => setShowUploadForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Upload size={18} className="mr-2" />
          Upload CSV File
        </button>
      </div>

      {/* CSV Upload Form */}
      {showUploadForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Upload CSV File</h3>
          <div className="mb-4">
            <input 
              type="file"
              id="csv-upload"
              accept=".csv"
              onChange={handleFileUpload}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <p className="text-sm text-gray-600 mt-2">
              Upload a CSV file with the correct format. Download the template for reference.
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <button 
              onClick={() => {
                setShowUploadForm(false);
                setCsvFile(null);
              }}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button 
              onClick={processCSVUpload}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Upload & Process
            </button>
          </div>
        </div>
      )}
      
      {/* Stock Entry Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Stock Entry</h2>
        <form onSubmit={createStockEntry} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Store Field with Add Button */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store *</label>
            {!showAddStore ? (
              <div className="flex">
                <select 
                  name="store_id"
                  value={formData.store_id}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={storesLoading}
                >
                  <option value="">Select Store</option>
                  {stores.map(store => (
                    <option key={store.id} value={store.id}>{store.name}</option>
                  ))}
                </select>
                <button 
                  type="button"
                  onClick={() => setShowAddStore(true)}
                  className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Add New Store"
                >
                  <Plus size={20} />
                </button>
              </div>
            ) : (
              <div className="space-y-2 p-4 border border-gray-300 rounded-md bg-gray-50">
                <input 
                  type="text"
                  name="name"
                  value={newStore.name}
                  onChange={handleNewStoreChange}
                  placeholder="Store Name *"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  autoFocus
                  required
                />
                <input 
                  type="text"
                  name="address"
                  value={newStore.address}
                  onChange={handleNewStoreChange}
                  placeholder="Address *"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
                <input 
                  type="text"
                  name="gst_number"
                  value={newStore.gst_number}
                  onChange={handleNewStoreChange}
                  placeholder="GST Number"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <input 
                  type="text"
                  name="location"
                  value={newStore.location}
                  onChange={handleNewStoreChange}
                  placeholder="Location"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <input 
                  type="text"
                  name="mobile"
                  value={newStore.mobile}
                  onChange={handleNewStoreChange}
                  placeholder="Mobile *"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
                <div className="flex space-x-2">
                  <button 
                    type="button"
                    onClick={createStore}
                    className="flex-1 bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
                  >
                    Save Store
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowAddStore(false);
                      setNewStore({
                        name: '',
                        address: '',
                        gst_number: '',
                        location: '',
                        mobile: '',
                        alternate_mobile: ''
                      });
                    }}
                    className="flex-1 bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Category Field with Add Button */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            {!showAddCategory ? (
              <div className="flex">
                <select 
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={categoriesLoading}
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                <button 
                  type="button"
                  onClick={() => setShowAddCategory(true)}
                  className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Add New Category"
                >
                  <Plus size={20} />
                </button>
              </div>
            ) : (
              <div className="space-y-2 p-4 border border-gray-300 rounded-md bg-gray-50">
                <input 
                  type="text"
                  name="name"
                  value={newCategory.name}
                  onChange={handleNewCategoryChange}
                  placeholder="Category Name *"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  autoFocus
                  required
                />
                <textarea 
                  name="description"
                  value={newCategory.description}
                  onChange={handleNewCategoryChange}
                  placeholder="Description"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="2"
                />
                <div className="flex space-x-2">
                  <button 
                    type="button"
                    onClick={createCategory}
                    className="flex-1 bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
                  >
                    Save Category
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowAddCategory(false);
                      setNewCategory({ name: '', description: '' });
                    }}
                    className="flex-1 bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Product Field with Add Button */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
            {!showAddProduct ? (
              <div className="flex">
                <select 
                  name="product_id"
                  value={formData.product_id}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={productsLoading || !formData.category_id}
                >
                  <option value="">Select Product</option>
                  {filteredProducts.map(product => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
                <button 
                  type="button"
                  onClick={() => setShowAddProduct(true)}
                  className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Add New Product"
                  disabled={!formData.category_id}
                >
                  <Plus size={20} />
                </button>
              </div>
            ) : (
              <div className="space-y-2 p-4 border border-gray-300 rounded-md bg-gray-50">
                <input 
                  type="text"
                  name="name"
                  value={newProduct.name}
                  onChange={handleNewProductChange}
                  placeholder="Product Name *"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  autoFocus
                  required
                />
                <select 
                  name="category_id"
                  value={newProduct.category_id}
                  onChange={handleNewProductChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Category *</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                <textarea 
                  name="description"
                  value={newProduct.description}
                  onChange={handleNewProductChange}
                  placeholder="Description"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="2"
                />
                <div className="flex space-x-2">
                  <button 
                    type="button"
                    onClick={createProduct}
                    className="flex-1 bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
                  >
                    Save Product
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowAddProduct(false);
                      setNewProduct({ name: '', category_id: '', description: '' });
                    }}
                    className="flex-1 bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {!formData.category_id && (
              <p className="text-xs text-amber-600 mt-1">Please select a category first</p>
            )}
          </div>
          
          {/* Batch Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch *</label>
            <input 
              type="text"
              name="batch"
              value={formData.batch}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="e.g., BT-INITIAL-001"
            />
          </div>

          {/* HSN Code Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">HSN Code</label>
            <input 
              type="text"
              name="hsn_code"
              value={formData.hsn_code}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 2523"
            />
          </div>
          
          {/* Rack Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rack</label>
            {!showAddRack ? (
              <div className="flex">
                <select 
                  name="rack"
                  value={formData.rack}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Rack</option>
                  {racks.map(rack => (
                    <option key={rack} value={rack}>{rack}</option>
                  ))}
                </select>
                <button 
                  type="button"
                  onClick={() => setShowAddRack(true)}
                  className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Add New Rack"
                >
                  <Plus size={20} />
                </button>
              </div>
            ) : (
              <div className="flex">
                <input 
                  type="text"
                  value={newRack}
                  onChange={(e) => setNewRack(e.target.value)}
                  placeholder="Enter new rack"
                  className="w-full p-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
                <button 
                  type="button"
                  onClick={handleAddRack}
                  className="bg-green-500 text-white p-2 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                  title="Save Rack"
                >
                  <CheckCircle size={20} />
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setShowAddRack(false);
                    setNewRack('');
                  }}
                  className="bg-red-500 text-white p-2 rounded-r-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                  title="Cancel"
                >
                  <X size={20} />
                </button>
              </div>
            )}
          </div>
          
          {/* MRP Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">MRP (₹)</label>
            <input 
              type="number"
              name="mrp"
              value={formData.mrp}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              step="0.01"
              min="0"
              placeholder="e.g., 450.00"
            />
          </div>
          
          {/* Sale Price Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price (₹)</label>
            <input 
              type="number"
              name="sale_price"
              value={formData.sale_price}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              step="0.01"
              min="0"
              placeholder="e.g., 400.00"
            />
          </div>

          {/* Purchase Amount Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Amount (₹)</label>
            <input 
              type="number"
              name="purchase_amount"
              value={formData.purchase_amount}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              step="0.01"
              min="0"
              placeholder="e.g., 350.00"
            />
          </div>
          
          {/* Quantity Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
            <input 
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
              min="0"
              step="0.01"
              placeholder="e.g., 3"
            />
          </div>
          
          {/* Units Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Units *</label>
            <select 
              name="units"
              value={formData.units}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Units</option>
              {units.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>
          
          {/* Submit Button */}
          <div className="md:col-span-2 lg:col-span-3 flex justify-end mt-4">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding Stock...
                </>
              ) : (
                'Add Stock Entry'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Render Stock Transfer Accept Tab
  const renderStockTransferAccept = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Request Stock Transfer</h2>
      <form onSubmit={handleTransferSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">From Store</label>
          <select 
            name="fromStore"
            value={transferForm.fromStore}
            onChange={handleTransferInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select From Store</option>
            {stores.map(store => (
              <option key={store.id} value={store.name}>{store.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">To Store</label>
          <select 
            name="toStore"
            value={transferForm.toStore}
            onChange={handleTransferInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select To Store</option>
            {stores.map(store => (
              <option key={store.id} value={store.name}>{store.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
          <select 
            name="product"
            value={transferForm.product}
            onChange={handleTransferInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Product</option>
            {products.map(product => (
              <option key={product.id} value={product.name}>{product.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
          <input 
            type="number"
            name="quantity"
            value={transferForm.quantity}
            onChange={handleTransferInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
            min="1"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea 
            name="notes"
            value={transferForm.notes}
            onChange={handleTransferInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows="3"
          />
        </div>
        
        <div className="md:col-span-2 flex justify-end">
          <button 
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Request Transfer
          </button>
        </div>
      </form>
    </div>
  );

  // Show loading state if any data is loading
  if (storesLoading || categoriesLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Stock Management</h1>
        
        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('stockEntry')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stockEntry'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Stock Entry
            </button>
            <button
              onClick={() => setActiveTab('stockList')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stockList'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Stock List
            </button>
            <button
              onClick={() => setActiveTab('stockTransferHistory')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stockTransferHistory'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Stock Transfer History
            </button>
            <button
              onClick={() => setActiveTab('stockTransferAccept')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stockTransferAccept'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Stock Transfer Accept
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'stockEntry' && renderStockEntry()}
        {activeTab === 'stockList' && <StockList />}
        {activeTab === 'stockTransferHistory' && <StockTransferEntry />}
        {activeTab === 'stockTransferAccept' && renderStockTransferAccept()}
      </div>
    </div>
  );
};

export default StockEntry;

