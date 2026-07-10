import React from "react";

const AddressTab = ({
  formData,
  handleInputChange,
  sameAsPermanent,
  handleSameAsPermanent,
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {["Permanent", "Present"].map((type) => (
        <div key={type} className="app-panel p-6">
          <h2 className="app-heading text-lg font-bold text-(--text-strong) mb-6 border-b border-(--border-soft) pb-3">
            {type} Address
          </h2>
          <div className="space-y-6">
            <div>
              <label className="app-label block mb-1.5">Address Line 1</label>
              <input
                type="text"
                name={`${type.toLowerCase()}Address1`}
                value={formData[`${type.toLowerCase()}Address1`]}
                onChange={handleInputChange}
                placeholder="e.g. Flat 101, Shivam Apartments"
                className="app-input w-full"
              />
            </div>
            <div>
              <label className="app-label block mb-1.5">Address Line 2</label>
              <input
                type="text"
                name={`${type.toLowerCase()}Address2`}
                value={formData[`${type.toLowerCase()}Address2`]}
                onChange={handleInputChange}
                placeholder="e.g. MG Road, Andheri East"
                className="app-input w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="app-label block mb-1.5">Country</label>
                <input
                  type="text"
                  name={`${type.toLowerCase()}Country`}
                  value={formData[`${type.toLowerCase()}Country`]}
                  onChange={handleInputChange}
                  placeholder="e.g. India"
                  className="app-input w-full"
                />
              </div>
              <div>
                <label className="app-label block mb-1.5">District</label>
                <input
                  type="text"
                  name={`${type.toLowerCase()}District`}
                  value={formData[`${type.toLowerCase()}District`]}
                  onChange={handleInputChange}
                  placeholder="e.g. Mumbai"
                  className="app-input w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="app-label block mb-1.5">State</label>
                <input
                  type="text"
                  name={`${type.toLowerCase()}State`}
                  value={formData[`${type.toLowerCase()}State`]}
                  onChange={handleInputChange}
                  placeholder="e.g. Maharashtra"
                  className="app-input w-full"
                />
              </div>
              <div>
                <label className="app-label block mb-1.5">Zip Code</label>
                <input
                  type="text"
                  name={`${type.toLowerCase()}ZipCode`}
                  value={formData[`${type.toLowerCase()}ZipCode`]}
                  onChange={handleInputChange}
                  placeholder="e.g. 400001"
                  className="app-input w-full"
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>

    <label className="inline-flex items-center gap-3 cursor-pointer select-none bg-white rounded-xl border border-(--border-soft) px-5 py-4 hover:shadow-sm transition-all duration-200">
      <input
        type="checkbox"
        checked={sameAsPermanent}
        onChange={(e) => handleSameAsPermanent(e.target.checked)}
        className="w-4 h-4 rounded border-(--border-soft) text-(--brand) focus:ring-(--brand-ring) accent-(--brand)"
      />
      <span className="text-sm font-semibold text-(--text-soft)">
        Present address is the same as Permanent address
      </span>
    </label>
  </div>
);

export default AddressTab;
