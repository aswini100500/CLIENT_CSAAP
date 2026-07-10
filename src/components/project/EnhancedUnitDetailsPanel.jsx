import React, { useState } from "react";
import {
  FaBed,
  FaBath,
  FaRulerCombined,
  FaDollarSign,
  FaInfoCircle,
  FaHome,
  FaCheckCircle,
  FaCalculator,
  FaMagic,
  FaChartLine,
} from "react-icons/fa";

const EnhancedUnitDetailsPanel = ({
  selectedUnit,
  propertyFeatures,
  setPropertyFeatures,
  areaDetails,
  setAreaDetails,
  priceDetails,
  setPriceDetails,
  bedroomAreas,
  setBedroomAreas,
  bathroomAreas,
  setBathroomAreas,
  balconyAreas,
  setBalconyAreas,
  activeTab,
  setActiveTab,
  onSave,
}) => {
  const [showCalculator, setShowCalculator] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!selectedUnit) {
    return (
      <div className="bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 p-12 rounded-2xl border-2 border-dashed border-indigo-300 h-full flex items-center justify-center animate-pulse">
        <div className="text-center">
          <div className="relative inline-block">
            <FaHome className="mx-auto h-20 w-20 text-indigo-300 mb-4" />
            <div className="absolute -top-2 -right-2 bg-indigo-500 rounded-full p-2">
              <FaInfoCircle className="h-4 w-4 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            No Unit Selected
          </h3>
          <p className="text-gray-600 max-w-md">
            Select a unit from the list to view and edit its details with our
            enhanced interface
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "rooms", label: "Room Details", icon: FaBed, color: "indigo" },
    {
      id: "areas",
      label: "Area Details",
      icon: FaRulerCombined,
      color: "blue",
    },
    { id: "price", label: "Price Details", icon: FaDollarSign, color: "green" },
  ];

  const handleBedroomAreaChange = (index, value) => {
    const newAreas = [...bedroomAreas];
    newAreas[index] = parseFloat(value) || 0;
    setBedroomAreas(newAreas);
  };

  const handleBathroomAreaChange = (index, value) => {
    const newAreas = [...bathroomAreas];
    newAreas[index] = parseFloat(value) || 0;
    setBathroomAreas(newAreas);
  };

  const handleBalconyAreaChange = (index, value) => {
    const newAreas = [...balconyAreas];
    newAreas[index] = parseFloat(value) || 0;
    setBalconyAreas(newAreas);
  };

  const calculateTotalBedroomArea = () =>
    bedroomAreas.reduce((sum, area) => sum + (parseFloat(area) || 0), 0);
  const calculateTotalBathroomArea = () =>
    bathroomAreas.reduce((sum, area) => sum + (parseFloat(area) || 0), 0);
  const calculateTotalBalconyArea = () =>
    balconyAreas.reduce((sum, area) => sum + (parseFloat(area) || 0), 0);
  const calculateGrandTotalArea = () =>
    calculateTotalBedroomArea() +
    calculateTotalBathroomArea() +
    calculateTotalBalconyArea();

  const quickFillAreas = (type, value) => {
    const val = parseFloat(value) || 0;
    if (type === "bedroom") {
      setBedroomAreas(new Array(bedroomAreas.length).fill(val));
    } else if (type === "bathroom") {
      setBathroomAreas(new Array(bathroomAreas.length).fill(val));
    } else if (type === "balcony") {
      setBalconyAreas(new Array(balconyAreas.length).fill(val));
    }
  };

  const autoCalculateCarpetArea = () => {
    const total = calculateGrandTotalArea();
    setAreaDetails({ ...areaDetails, carpetArea: total });
  };

  const autoCalculateBuiltUpArea = () => {
    const carpetArea = areaDetails.carpetArea || calculateGrandTotalArea();
    const builtUp = carpetArea * 1.2;
    setAreaDetails({ ...areaDetails, builtUpArea: Math.round(builtUp) });
  };

  const autoCalculateSuperBuiltUpArea = () => {
    const builtUp = areaDetails.builtUpArea || areaDetails.carpetArea * 1.2;
    const superBuiltUp = builtUp * 1.25;
    setAreaDetails({
      ...areaDetails,
      superBuiltUpArea: Math.round(superBuiltUp),
    });
  };

  const handleSave = () => {
    onSave();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
      <div className="bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center">
                <FaHome className="mr-3 animate-bounce" />
                {selectedUnit.name}
              </h2>
              <p className="text-indigo-100 text-sm mt-1 flex items-center gap-2">
                <span className="bg-white/20 px-2 py-0.5 rounded">
                  {selectedUnit.blockName}
                </span>
                <span>•</span>
                <span className="bg-white/20 px-2 py-0.5 rounded">
                  {selectedUnit.floor}
                </span>
                <span>•</span>
                <span className="bg-white/20 px-2 py-0.5 rounded font-semibold">
                  {selectedUnit.roomType}
                </span>
              </p>
            </div>
            {saveSuccess && (
              <div className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg animate-bounce">
                <FaCheckCircle />
                <span className="font-semibold">Saved!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex border-b border-gray-200 bg-linear-to-r from-gray-50 to-slate-50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 relative ${
                isActive
                  ? "text-indigo-700 bg-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform duration-300 ${isActive ? "scale-110" : ""}`}
              />
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-indigo-500 to-purple-500 rounded-t-full"></div>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-6 min-h-125">
        {activeTab === "rooms" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-linear-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
              <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center">
                <FaBed className="mr-2" />
                Room Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                    <FaBed className="inline mr-2 text-indigo-600" />
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={propertyFeatures.bedrooms || 0}
                    onChange={(e) =>
                      setPropertyFeatures({
                        ...propertyFeatures,
                        bedrooms: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full border-2 border-indigo-300 rounded-xl px-4 py-3 text-lg font-semibold focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all transform group-hover:scale-105"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                    <FaBath className="inline mr-2 text-blue-600" />
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={propertyFeatures.bathrooms || 0}
                    onChange={(e) =>
                      setPropertyFeatures({
                        ...propertyFeatures,
                        bathrooms: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full border-2 border-blue-300 rounded-xl px-4 py-3 text-lg font-semibold focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all transform group-hover:scale-105"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                    <FaHome className="inline mr-2 text-green-600" />
                    Balconies
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={propertyFeatures.balconies || 0}
                    onChange={(e) =>
                      setPropertyFeatures({
                        ...propertyFeatures,
                        balconies: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full border-2 border-green-300 rounded-xl px-4 py-3 text-lg font-semibold focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all transform group-hover:scale-105"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Furnished Status
              </label>
              <select
                value={propertyFeatures.furnishedStatus || "Unfurnished"}
                onChange={(e) =>
                  setPropertyFeatures({
                    ...propertyFeatures,
                    furnishedStatus: e.target.value,
                  })
                }
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-lg focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all"
              >
                <option value="Unfurnished">🏠 Unfurnished</option>
                <option value="Semi-Furnished">🛋️ Semi-Furnished</option>
                <option value="Fully-Furnished">✨ Fully-Furnished</option>
              </select>
            </div>

            <div className="bg-linear-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-xl">
              <h4 className="font-bold text-lg mb-3">Quick Summary</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white/20 rounded-lg p-3 backdrop-blur">
                  <div className="text-3xl font-bold">
                    {propertyFeatures.bedrooms || 0}
                  </div>
                  <div className="text-sm opacity-90">Bedrooms</div>
                </div>
                <div className="bg-white/20 rounded-lg p-3 backdrop-blur">
                  <div className="text-3xl font-bold">
                    {propertyFeatures.bathrooms || 0}
                  </div>
                  <div className="text-sm opacity-90">Bathrooms</div>
                </div>
                <div className="bg-white/20 rounded-lg p-3 backdrop-blur">
                  <div className="text-3xl font-bold">
                    {propertyFeatures.balconies || 0}
                  </div>
                  <div className="text-sm opacity-90">Balconies</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "areas" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-linear-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <FaMagic className="text-xl" />
                  <span className="font-bold">Smart Area Calculator</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={autoCalculateCarpetArea}
                    className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-all transform hover:scale-105 text-sm"
                  >
                    Auto Carpet
                  </button>
                  <button
                    onClick={autoCalculateBuiltUpArea}
                    className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-all transform hover:scale-105 text-sm"
                  >
                    Auto Built-up
                  </button>
                  <button
                    onClick={autoCalculateSuperBuiltUpArea}
                    className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-all transform hover:scale-105 text-sm"
                  >
                    Auto Super Built-up
                  </button>
                </div>
              </div>
            </div>

            {bedroomAreas.length > 0 && (
              <div className="bg-linear-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200 shadow-md">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-bold text-indigo-900 flex items-center">
                    <FaBed className="mr-3 text-2xl" />
                    Bedroom Areas
                  </h3>
                  <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow">
                    <input
                      type="number"
                      placeholder="Quick fill"
                      className="w-24 border-2 border-indigo-300 rounded-lg px-3 py-1 text-sm font-semibold focus:ring-2 focus:ring-indigo-400"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          quickFillAreas("bedroom", e.target.value);
                          e.target.value = "";
                        }
                      }}
                    />
                    <span className="text-xs text-indigo-700 font-semibold">
                      Press ↵
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bedroomAreas.map((area, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl p-4 shadow-md border-2 border-indigo-100 hover:border-indigo-300 transition-all transform hover:scale-105"
                    >
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                        <span className="bg-indigo-100 text-indigo-700 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-xs font-bold">
                          {index + 1}
                        </span>
                        Bedroom {index + 1} (sq ft)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={area || ""}
                        onChange={(e) =>
                          handleBedroomAreaChange(index, e.target.value)
                        }
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 text-lg font-semibold focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-5 p-4 bg-linear-to-r from-indigo-500 to-purple-500 rounded-xl text-white shadow-lg">
                  <p className="text-sm font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FaCalculator />
                      Total Bedroom Area:
                    </span>
                    <span className="text-2xl font-bold">
                      {calculateTotalBedroomArea().toFixed(2)} sq ft
                    </span>
                  </p>
                </div>
              </div>
            )}

            {bathroomAreas.length > 0 && (
              <div className="bg-linear-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200 shadow-md">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-bold text-blue-900 flex items-center">
                    <FaBath className="mr-3 text-2xl" />
                    Bathroom Areas
                  </h3>
                  <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow">
                    <input
                      type="number"
                      placeholder="Quick fill"
                      className="w-24 border-2 border-blue-300 rounded-lg px-3 py-1 text-sm font-semibold focus:ring-2 focus:ring-blue-400"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          quickFillAreas("bathroom", e.target.value);
                          e.target.value = "";
                        }
                      }}
                    />
                    <span className="text-xs text-blue-700 font-semibold">
                      Press ↵
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bathroomAreas.map((area, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl p-4 shadow-md border-2 border-blue-100 hover:border-blue-300 transition-all transform hover:scale-105"
                    >
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                        <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-xs font-bold">
                          {index + 1}
                        </span>
                        Bathroom {index + 1} (sq ft)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={area || ""}
                        onChange={(e) =>
                          handleBathroomAreaChange(index, e.target.value)
                        }
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 text-lg font-semibold focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-5 p-4 bg-linear-to-r from-blue-500 to-cyan-500 rounded-xl text-white shadow-lg">
                  <p className="text-sm font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FaCalculator />
                      Total Bathroom Area:
                    </span>
                    <span className="text-2xl font-bold">
                      {calculateTotalBathroomArea().toFixed(2)} sq ft
                    </span>
                  </p>
                </div>
              </div>
            )}

            {balconyAreas.length > 0 && (
              <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 shadow-md">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-bold text-green-900 flex items-center">
                    <FaHome className="mr-3 text-2xl" />
                    Balcony Areas
                  </h3>
                  <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow">
                    <input
                      type="number"
                      placeholder="Quick fill"
                      className="w-24 border-2 border-green-300 rounded-lg px-3 py-1 text-sm font-semibold focus:ring-2 focus:ring-green-400"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          quickFillAreas("balcony", e.target.value);
                          e.target.value = "";
                        }
                      }}
                    />
                    <span className="text-xs text-green-700 font-semibold">
                      Press ↵
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {balconyAreas.map((area, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl p-4 shadow-md border-2 border-green-100 hover:border-green-300 transition-all transform hover:scale-105"
                    >
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                        <span className="bg-green-100 text-green-700 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-xs font-bold">
                          {index + 1}
                        </span>
                        Balcony {index + 1} (sq ft)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={area || ""}
                        onChange={(e) =>
                          handleBalconyAreaChange(index, e.target.value)
                        }
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 text-lg font-semibold focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-5 p-4 bg-linear-to-r from-green-500 to-emerald-500 rounded-xl text-white shadow-lg">
                  <p className="text-sm font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FaCalculator />
                      Total Balcony Area:
                    </span>
                    <span className="text-2xl font-bold">
                      {calculateTotalBalconyArea().toFixed(2)} sq ft
                    </span>
                  </p>
                </div>
              </div>
            )}

            {(bedroomAreas.length > 0 ||
              bathroomAreas.length > 0 ||
              balconyAreas.length > 0) && (
              <div className="bg-linear-to-r from-amber-400 via-orange-500 to-red-500 rounded-xl p-6 text-white shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaChartLine className="text-3xl" />
                    <div>
                      <div className="text-sm opacity-90">Grand Total Area</div>
                      <div className="text-4xl font-bold">
                        {calculateGrandTotalArea().toFixed(2)} sq ft
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm opacity-90">All Rooms Combined</div>
                    <div className="text-lg font-semibold">
                      {bedroomAreas.length +
                        bathroomAreas.length +
                        balconyAreas.length}{" "}
                      Areas
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center">
                <FaRulerCombined className="mr-3 text-indigo-600" />
                Total Area Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Carpet Area (sq ft)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={areaDetails.carpetArea || ""}
                    onChange={(e) =>
                      setAreaDetails({
                        ...areaDetails,
                        carpetArea: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-lg font-semibold focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all transform group-hover:scale-105"
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Built-up Area (sq ft)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={areaDetails.builtUpArea || ""}
                    onChange={(e) =>
                      setAreaDetails({
                        ...areaDetails,
                        builtUpArea: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-lg font-semibold focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all transform group-hover:scale-105"
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Super Built-up Area (sq ft)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={areaDetails.superBuiltUpArea || ""}
                    onChange={(e) =>
                      setAreaDetails({
                        ...areaDetails,
                        superBuiltUpArea: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-lg font-semibold focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all transform group-hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "price" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 shadow-md">
              <h3 className="text-xl font-bold text-green-900 mb-5 flex items-center">
                <FaDollarSign className="mr-3 text-2xl" />
                Pricing Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Expected Price (₹)
                  </label>
                  <input
                    type="text"
                    value={priceDetails.expectedPrice || ""}
                    onChange={(e) =>
                      setPriceDetails({
                        ...priceDetails,
                        expectedPrice: e.target.value,
                      })
                    }
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-lg font-semibold focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all transform group-hover:scale-105"
                    placeholder="Enter expected price"
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Token Amount (₹)
                  </label>
                  <input
                    type="text"
                    value={priceDetails.tokenAmount || ""}
                    onChange={(e) =>
                      setPriceDetails({
                        ...priceDetails,
                        tokenAmount: e.target.value,
                      })
                    }
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-lg font-semibold focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all transform group-hover:scale-105"
                    placeholder="Enter token amount"
                  />
                </div>
              </div>
              <div className="mt-6 flex items-center bg-white rounded-xl p-4 border-2 border-gray-200">
                <input
                  type="checkbox"
                  id="priceNegotiable"
                  checked={priceDetails.priceNegotiable || false}
                  onChange={(e) =>
                    setPriceDetails({
                      ...priceDetails,
                      priceNegotiable: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label
                  htmlFor="priceNegotiable"
                  className="ml-3 text-base font-semibold text-gray-700"
                >
                  💰 Price Negotiable
                </label>
              </div>
            </div>

            {(priceDetails.expectedPrice || priceDetails.tokenAmount) && (
              <div className="bg-linear-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-xl">
                <h4 className="font-bold text-lg mb-4">Price Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                  {priceDetails.expectedPrice && (
                    <div className="bg-white/20 rounded-lg p-4 backdrop-blur">
                      <div className="text-sm opacity-90">Expected Price</div>
                      <div className="text-2xl font-bold">
                        ₹{priceDetails.expectedPrice}
                      </div>
                    </div>
                  )}
                  {priceDetails.tokenAmount && (
                    <div className="bg-white/20 rounded-lg p-4 backdrop-blur">
                      <div className="text-sm opacity-90">Token Amount</div>
                      <div className="text-2xl font-bold">
                        ₹{priceDetails.tokenAmount}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-linear-to-r from-gray-50 to-slate-100 px-6 py-5 border-t-2 border-gray-200 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          <span className="font-semibold">Last Updated:</span>{" "}
          {new Date().toLocaleTimeString()}
        </div>
        <button
          onClick={handleSave}
          className="px-8 py-3 bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-xl transition-all duration-300 transform hover:scale-110 hover:shadow-2xl flex items-center gap-2"
        >
          <FaCheckCircle className="text-xl" />
          Save Unit Details
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default EnhancedUnitDetailsPanel;
