import React, { useState } from 'react';

const BarcodeSale = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    fromStore: '',
    customerName: '',
    contactNo: '',
    address: '',
    barcode: '',
    product: '',
    batch: '',
    rack: '',
    quantity: '',
    salePrice: '',
    cgst: '0',
    sgst: '0',
    igst: '0',
    discount: '',
    gstType: 'noGst',
    taxType: 'cgstSgst',
    gstNumber: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addProduct = () => {
    if (formData.product && formData.quantity && formData.salePrice) {
      const quantity = parseFloat(formData.quantity);
      const salePrice = parseFloat(formData.salePrice);
      const cgst = parseFloat(formData.cgst) || 0;
      const sgst = parseFloat(formData.sgst) || 0;
      const igst = parseFloat(formData.igst) || 0;
      
      const totalPrice = (quantity * salePrice) + cgst + sgst + igst;

      const newProduct = {
        id: Date.now(),
        product: formData.product,
        batch: formData.batch,
        rack: formData.rack,
        quantity: quantity,
        salePrice: salePrice,
        cgst: cgst,
        sgst: sgst,
        igst: igst,
        totalPrice: totalPrice
      };

      setProducts([...products, newProduct]);
      
      // Clear product fields only
      setFormData(prev => ({
        ...prev,
        product: '',
        batch: '',
        rack: '',
        quantity: '',
        salePrice: '',
        cgst: '0',
        sgst: '0',
        igst: '0',
        barcode: ''
      }));
    }
  };

  const removeProduct = (id) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const calculateTotals = () => {
    const grossPrice = products.reduce((sum, product) => 
      sum + (product.quantity * product.salePrice), 0);
    
    const totalCgst = products.reduce((sum, product) => sum + product.cgst, 0);
    const totalSgst = products.reduce((sum, product) => sum + product.sgst, 0);
    const totalIgst = products.reduce((sum, product) => sum + product.igst, 0);
    
    const discount = parseFloat(formData.discount) || 0;
    const netPrice = grossPrice + totalCgst + totalSgst + totalIgst - discount;

    return { grossPrice, totalCgst, totalSgst, totalIgst, discount, netPrice };
  };

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Barcode Sale</h1>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg border border-gray-300">
          {/* From Store Section */}
          <div className="p-4 border-b border-gray-300">
            <div className="flex items-center gap-2">
              <span className="text-gray-700 font-medium">From Store</span>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="fromStore"
                  checked={formData.fromStore}
                  onChange={(e) => setFormData(prev => ({...prev, fromStore: e.target.checked}))}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-1">✔</span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="p-4 border-b border-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Contact No</label>
                <input
                  type="text"
                  name="contactNo"
                  value={formData.contactNo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Contact number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Customer Name</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Customer name"
                />
              </div>
            </div>
          </div>

          {/* Barcode Input */}
          <div className="p-4 border-b border-gray-300">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Barcode</h3>
            <div className="max-w-xs">
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Scan or enter barcode"
              />
            </div>
          </div>

          {/* Product Input Section */}
          <div className="p-4 border-b border-gray-300">
            <h3 className="text-sm font-medium text-gray-600 mb-3">
              Product List (Enter Product details and press "Add Product To List" to add product)
            </h3>
            
            {/* Product Input Row */}
            <div className="grid grid-cols-6 gap-2 mb-3 text-xs font-medium text-gray-600">
              <div>Product</div>
              <div>Batch</div>
              <div>Rack</div>
              <div>Quantity</div>
              <div>Sale Price</div>
              <div>Action</div>
            </div>

            <div className="grid grid-cols-6 gap-2 mb-4">
              <input
                type="text"
                name="product"
                value={formData.product}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="Product"
              />
              <input
                type="text"
                name="batch"
                value={formData.batch}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="Batch"
              />
              <input
                type="text"
                name="rack"
                value={formData.rack}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="Rack"
              />
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="Qty"
              />
              <input
                type="number"
                name="salePrice"
                value={formData.salePrice}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="Price"
              />
              <button
                onClick={addProduct}
                className="bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
              >
                Add Product
              </button>
            </div>

            {/* Tax Inputs */}
            <div className="grid grid-cols-4 gap-3 max-w-md">
              <div>
                <label className="block text-xs text-gray-600 mb-1">CGST</label>
                <input
                  type="number"
                  name="cgst"
                  value={formData.cgst}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">SGST</label>
                <input
                  type="number"
                  name="sgst"
                  value={formData.sgst}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">IGST</label>
                <input
                  type="number"
                  name="igst"
                  value={formData.igst}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Total Price</label>
                <div className="px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50">
                  {products.length > 0 ? products[products.length - 1]?.totalPrice.toFixed(2) : '0.00'}
                </div>
              </div>
            </div>
          </div>

          {/* Products List Table */}
          {products.length > 0 && (
            <div className="p-4 border-b border-gray-300">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-3 py-2 text-left border">Product</th>
                      <th className="px-3 py-2 text-left border">Batch</th>
                      <th className="px-3 py-2 text-left border">Rack</th>
                      <th className="px-3 py-2 text-left border">Quantity</th>
                      <th className="px-3 py-2 text-left border">Sale Price</th>
                      <th className="px-3 py-2 text-left border">CGST</th>
                      <th className="px-3 py-2 text-left border">SGST</th>
                      <th className="px-3 py-2 text-left border">IGST</th>
                      <th className="px-3 py-2 text-left border">Total Price</th>
                      <th className="px-3 py-2 text-left border">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b">
                        <td className="px-3 py-2 border">{product.product}</td>
                        <td className="px-3 py-2 border">{product.batch}</td>
                        <td className="px-3 py-2 border">{product.rack}</td>
                        <td className="px-3 py-2 border">{product.quantity}</td>
                        <td className="px-3 py-2 border">{product.salePrice.toFixed(2)}</td>
                        <td className="px-3 py-2 border">{product.cgst.toFixed(2)}</td>
                        <td className="px-3 py-2 border">{product.sgst.toFixed(2)}</td>
                        <td className="px-3 py-2 border">{product.igst.toFixed(2)}</td>
                        <td className="px-3 py-2 border">{product.totalPrice.toFixed(2)}</td>
                        <td className="px-3 py-2 border">
                          <button
                            onClick={() => removeProduct(product.id)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Totals Section */}
          <div className="p-4 border-b border-gray-300">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Gross Price</label>
                <div className="px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50">
                  {totals.grossPrice.toFixed(2)}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">CGST</label>
                <div className="px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50">
                  {totals.totalCgst.toFixed(2)}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">SGST</label>
                <div className="px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50">
                  {totals.totalSgst.toFixed(2)}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">IGST</label>
                <div className="px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50">
                  {totals.totalIgst.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Discount and Net Price */}
          <div className="p-4 border-b border-gray-300">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Discount</label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Net Price</label>
                <div className="px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50 font-medium">
                  {totals.netPrice.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* GST Options */}
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">GST Options</h4>
                <div className="space-y-2">
                  {[
                    { value: 'noGst', label: 'No GST' },
                    { value: 'gstWithoutNumber', label: 'GST Without Number' },
                    { value: 'gstWithNumber', label: 'GST With Number' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="gstType"
                        value={option.value}
                        checked={formData.gstType === option.value}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
                {formData.gstType === 'gstWithNumber' && (
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleInputChange}
                    placeholder="GST Number"
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                )}
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-3">Tax Type</h4>
                <div className="space-y-2">
                  {[
                    { value: 'cgstSgst', label: 'CGST/SGST' },
                    { value: 'igst', label: 'IGST' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="taxType"
                        value={option.value}
                        checked={formData.taxType === option.value}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Sale Button */}
            <div className="text-center mt-6">
              <button className="bg-green-500 text-white px-8 py-2 rounded-md hover:bg-green-600 font-medium">
                Sale
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeSale;