import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useSWR from 'swr';
import useAuth from '../../hooks/useAuth';
import { getAuthToken } from '../../store/authSession';
import { CheckCircle, AlertCircle, X } from 'lucide-react';


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
  }
);


const fetcher = (url) => api.get(url).then(res => res.data);

const StockTransferEntry = () => {
  const { user } = useAuth();

  const [fromStore, setFromStore] = useState('');
  const [toStore, setToStore] = useState('');
  const [category, setCategory] = useState('');
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [units, setUnits] = useState('Pieces');
  const [notes, setNotes] = useState('');
  const [requestedBy, setRequestedBy] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableUnits, setAvailableUnits] = useState(['Pieces', 'Boxes', 'Packets', 'Units', 'Kg', 'Liters']);


  const [notification, setNotification] = useState({
    show: false,
    type: '',
    title: '',
    message: ''
  });


  const showNotification = (type, title, message) => {
    setNotification({
      show: true,
      type,
      title,
      message
    });
    

    setTimeout(() => {
      setNotification({ show: false, type: '', title: '', message: '' });
    }, 5000);
  };


  const closeNotification = () => {
    setNotification({ show: false, type: '', title: '', message: '' });
  };


  const { data: masterData, isLoading: masterLoading } = useSWR(
    '/api/tenant/stock/master-data',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );


  const master = masterData?.success ? masterData.data : {};
  const stores = master.stores || [];
  const categories = master.categories || [];
  const products = master.products || [];
  const unitsFromApi = master.units || ['Pieces', 'Boxes', 'Packets', 'Units', 'Kg', 'Liters'];


  useEffect(() => {
    if (unitsFromApi.length > 0) {
      setAvailableUnits(unitsFromApi);
    }
  }, [unitsFromApi]);


  useEffect(() => {
    if (user) {
      const userInfo = user.name || user.email || 'System User';
      setRequestedBy(userInfo);
    }
  }, [user]);


  const getProductsForCategory = () => {
    if (!category) return [];
    return products.filter(product => product.category_id == category);
  };


  const { data: stockEntriesData, isLoading: stockEntriesLoading } = useSWR(
    fromStore && product ? `/api/tenant/stock/entry?store_id=${fromStore}&product_id=${product}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const stockEntries = stockEntriesData?.success ? stockEntriesData.data || [] : [];


  const getAvailableQuantity = () => {
    if (!product || !fromStore) return 0;
    

    return stockEntries.reduce((total, entry) => total + parseFloat(entry.quantity || 0), 0);
  };

  const handleTransfer = async () => {
    if (!fromStore || !toStore || !product || !quantity) {
      showNotification('error', 'Validation Error', 'Please fill all required fields: From Store, To Store, Product, and Quantity');
      return;
    }

    if (fromStore === toStore) {
      showNotification('error', 'Validation Error', 'From Store and To Store cannot be the same');
      return;
    }

    const availableQty = getAvailableQuantity();
    const requestedQty = parseFloat(quantity);
    
    if (requestedQty <= 0) {
      showNotification('error', 'Validation Error', 'Quantity must be greater than 0');
      return;
    }

    if (requestedQty > availableQty) {
      showNotification('error', 'Insufficient Stock', `Available: ${availableQty}, Requested: ${requestedQty}`);
      return;
    }

    if (!requestedBy) {
      showNotification('error', 'Authentication Error', 'Unable to identify user. Please ensure you are logged in.');
      return;
    }

    setIsSubmitting(true);

    try {
      const transferData = {
        from_store_id: parseInt(fromStore),
        to_store_id: parseInt(toStore),
        product_id: parseInt(product),
        quantity: parseFloat(quantity).toFixed(2),
        notes: notes.trim(),
        requested_by: requestedBy
      };




      const response = await api.post('/api/tenant/stock/transfer/request', transferData);

      if (response.data.success) {
        showNotification('success', 'Success!', 'Stock transfer request created successfully!');
        

        setFromStore('');
        setToStore('');
        setCategory('');
        setProduct('');
        setQuantity('');
        setUnits('Pieces');
        setNotes('');
        
      } else {
        throw new Error(response.data.message || 'Failed to create transfer request');
      }
    } catch (error) {
      console.error('Error creating transfer request:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create transfer request. Please try again.';
      showNotification('error', 'Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };


  if (masterLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">

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
              onClick={closeNotification}
              className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 text-gray-400 hover:text-gray-900"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6 text-center">Stock Transfer Request</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            From Store *
            {fromStore && product && (
              <span className="ml-2 text-xs text-blue-600">
                Available: {getAvailableQuantity()} {products.find(p => p.id == product)?.units || 'units'}
              </span>
            )}
          </label>
          <select
            value={fromStore}
            onChange={(e) => {
              setFromStore(e.target.value);
              setProduct('');
            }}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="">Select Store</option>
            {stores.map(store => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">To Store *</label>
          <select
            value={toStore}
            onChange={(e) => setToStore(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="">Select Store</option>
            {stores.filter(store => store.id != fromStore).map(store => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setProduct('');
            }}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Product *</label>
          <select
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            disabled={!category || !fromStore}
            required
          >
            <option value="">{!category ? 'Select category first' : !fromStore ? 'Select from store first' : 'Select Product'}</option>
            {getProductsForCategory().map(prod => (
              <option key={prod.id} value={prod.id}>{prod.name}</option>
            ))}
          </select>
          {!category && (
            <p className="text-xs text-gray-500 mt-1">Please select a category first</p>
          )}
          {category && !fromStore && (
            <p className="text-xs text-gray-500 mt-1">Please select from store to check availability</p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Quantity *</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter quantity"
            min="0.01"
            step="0.01"
            max={getAvailableQuantity()}
            disabled={!product || !fromStore}
            required
          />
          {!product && (
            <p className="text-xs text-gray-500 mt-1">Please select a product first</p>
          )}
          {product && quantity && parseFloat(quantity) > getAvailableQuantity() && (
            <p className="text-xs text-red-600 mt-1">
              Quantity exceeds available stock ({getAvailableQuantity()})
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Units</label>
          <select
            value={units}
            onChange={(e) => setUnits(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            disabled={!product}
          >
            {availableUnits.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>
      </div>
      

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Add any notes or comments about this transfer..."
          rows="3"
        />
        <p className="text-xs text-gray-500 mt-1">
          Optional: Add any special instructions or comments for this stock transfer.
        </p>
      </div>


      <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center text-sm text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>
            Request will be submitted under your account: <span className="font-medium">{requestedBy || 'Loading user...'}</span>
          </span>
        </div>
      </div>
      
      <div className="flex justify-end mt-8 space-x-4">
        <button
          onClick={() => {
            setFromStore('');
            setToStore('');
            setCategory('');
            setProduct('');
            setQuantity('');
            setUnits('Pieces');
            setNotes('');
            showNotification('info', 'Form Reset', 'Form has been reset to default values');
          }}
          className="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          disabled={isSubmitting}
        >
          Reset Form
        </button>
        <button
          onClick={handleTransfer}
          className="px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          disabled={isSubmitting || !fromStore || !toStore || !product || !quantity || parseFloat(quantity) > getAvailableQuantity() || parseFloat(quantity) <= 0 || !requestedBy}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating Request...
            </>
          ) : (
            'Create Transfer Request'
          )}
        </button>
      </div>


      {(fromStore || toStore || product || quantity) && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Request Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {fromStore && (
              <div>
                <p className="text-sm text-blue-600">From Store:</p>
                <p className="font-medium">{stores.find(s => s.id == fromStore)?.name || 'Not selected'}</p>
              </div>
            )}
            {toStore && (
              <div>
                <p className="text-sm text-blue-600">To Store:</p>
                <p className="font-medium">{stores.find(s => s.id == toStore)?.name || 'Not selected'}</p>
              </div>
            )}
            {product && (
              <div>
                <p className="text-sm text-blue-600">Product:</p>
                <p className="font-medium">{products.find(p => p.id == product)?.name || 'Not selected'}</p>
              </div>
            )}
            {quantity && (
              <div>
                <p className="text-sm text-blue-600">Quantity:</p>
                <p className="font-medium">{quantity} {units}</p>
              </div>
            )}
          </div>
          {notes && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-sm text-blue-600 mb-1">Notes:</p>
              <p className="text-sm">{notes}</p>
            </div>
          )}
        </div>
      )}


     
    </div>
  );
};

export default StockTransferEntry;

