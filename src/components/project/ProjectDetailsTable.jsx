import React from "react";
import {
  FaHome,
  FaBed,
  FaBath,
  FaCar,
  FaBuilding,
  FaList,
} from "react-icons/fa";
import { BROKER_LIST } from "../project/shared/Constants";
import { formatCurrency, hasData } from "../project/shared/utils";

const ProjectPlotRow = ({ plot, project, onEdit }) => {
  const brokerName =
    BROKER_LIST.find((b) => b.id == plot.broker)?.name || "N/A";
  const hasPlotData = hasData(plot);

  return (
    <tr
      className={`transition duration-200 cursor-pointer ${
        hasPlotData ? "hover:bg-blue-50" : "hover:bg-gray-50"
      } ${!hasPlotData ? "opacity-60" : ""}`}
      onClick={onEdit}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="shrink-0 h-10 w-10">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center ${
                hasPlotData ? "bg-indigo-100" : "bg-gray-200"
              }`}
            >
              <FaHome
                className={`h-5 w-5 ${
                  hasPlotData ? "text-indigo-600" : "text-gray-400"
                }`}
              />
            </div>
          </div>
          <div className="ml-4">
            <div
              className={`text-sm font-medium ${
                hasPlotData ? "text-gray-900" : "text-gray-900 font-bold"
              }`}
            >
              {plot.name}
            </div>
            {plot.kissama && (
              <div
                className={`text-xs ${
                  hasPlotData ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {plot.kissama}
              </div>
            )}
            {!hasPlotData && (
              <div className="text-xs text-gray-400 mt-1">
                Click to add details
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div
          className={`text-sm ${
            hasPlotData ? "text-gray-900" : "text-gray-500 italic"
          }`}
        >
          {plot.areaDetails?.plotArea
            ? `${plot.areaDetails.plotArea} sq-yd`
            : "N/A"}
        </div>
        {plot.areaDetails?.plotLength && plot.areaDetails?.plotBreadth && (
          <div
            className={`text-xs ${
              hasPlotData ? "text-gray-500" : "text-gray-400"
            }`}
          >
            {plot.areaDetails.plotLength} × {plot.areaDetails.plotBreadth} yd
          </div>
        )}
        {!hasPlotData && (
          <div className="text-xs text-gray-400 mt-1">Add area details</div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        {hasPlotData ? (
          <>
            <div className="text-gray-900">
              {formatCurrency(plot.priceDetails?.expectedPrice)}
            </div>
            {plot.priceDetails?.tokenAmount && (
              <div className="text-xs text-gray-500">
                Token: {formatCurrency(plot.priceDetails.tokenAmount)}
              </div>
            )}
            {plot.priceDetails?.priceNegotiable && (
              <div className="text-xs text-green-600">Negotiable</div>
            )}
          </>
        ) : (
          <div className="text-gray-500 italic text-sm">Add price details</div>
        )}
      </td>
      <td className="px-6 py-4">
        {hasPlotData ? (
          <div className="flex flex-wrap gap-1">
            {/* New Property Status Badge */}
            {plot.propertyFeatures?.propertyStatus && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 capitalize">
                {plot.propertyFeatures.propertyStatus}
              </span>
            )}

            {/* New Land Area Badge */}
            {plot.propertyFeatures?.landArea && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                Land: {plot.propertyFeatures.landArea} sqft
              </span>
            )}

            {/* New Outhouse Badge */}
            {plot.propertyFeatures?.hasOuthouse === "Yes" && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                {plot.propertyFeatures.outhouseArea
                  ? `Outhouse: ${plot.propertyFeatures.outhouseArea} sqft`
                  : "Outhouse"}
              </span>
            )}

            {/* Existing Features */}
            {plot.propertyFeatures?.openSides && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                {plot.propertyFeatures.openSides}s
              </span>
            )}
            {plot.propertyFeatures?.roadWidth && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-teal-100 text-teal-800">
                Road: {plot.propertyFeatures.roadWidth}m
              </span>
            )}
            {plot.propertyFeatures?.boundaryWall === "yes" && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800">
                Boundary
              </span>
            )}
            {plot.propertyFeatures?.gatedColony === "yes" && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                Gated
              </span>
            )}
            {plot.propertyFeatures?.parking && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800">
                <FaCar className="mr-1" /> Parking
              </span>
            )}
          </div>
        ) : (
          <div className="text-gray-500 italic text-sm">Add features</div>
        )}
      </td>
      <td className="px-6 py-4 text-sm">
        <div
          className={`font-medium ${
            hasPlotData ? "text-gray-900" : "text-gray-500"
          }`}
        >
          {brokerName}
        </div>
      </td>
      <td className="px-6 py-4 text-sm">
        <div
          className={`font-medium ${
            hasPlotData ? "text-gray-900" : "text-gray-500"
          }`}
        >
          {plot.purchaser || "N/A"}
        </div>
      </td>
      <td className="px-6 py-4 text-sm">
        <div
          className={`font-medium ${
            hasPlotData ? "text-gray-900" : "text-gray-500"
          }`}
        >
          {plot.constructor || "N/A"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        {hasPlotData && plot.transactionType?.possessionStatus ? (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
            {plot.transactionType.possessionStatus}
          </span>
        ) : (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-500">
            {hasPlotData ? "N/A" : "Pending"}
          </span>
        )}
      </td>
      {plot.isCornerPlot ? (
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
            ⭐ Corner
          </span>
        </td>
      ) : (
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="text-xs text-gray-400">—</span>
        </td>
      )}
    </tr>
  );
};

const ProjectUnitRow = ({ unit, project, onEdit }) => {
  const brokerName =
    BROKER_LIST.find((b) => b.id == unit.broker)?.name || "N/A";
  const hasUnitData = hasData(unit);

  return (
    <tr
      className={`transition duration-200 cursor-pointer ${
        hasUnitData ? "hover:bg-blue-50" : "hover:bg-gray-50"
      } ${!hasUnitData ? "opacity-60" : ""}`}
      onClick={onEdit}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="shrink-0 h-10 w-10">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center ${
                hasUnitData ? "bg-pink-100" : "bg-gray-200"
              }`}
            >
              <FaBed
                className={`h-5 w-5 ${
                  hasUnitData ? "text-pink-600" : "text-gray-400"
                }`}
              />
            </div>
          </div>
          <div className="ml-4">
            <div
              className={`text-sm font-medium ${
                hasUnitData ? "text-gray-900" : "text-gray-900"
              }`}
            >
              {unit.name}
            </div>
            {unit.floor && (
              <div className="text-xs text-gray-500">
                Floor {unit.floor} •{" "}
                {unit.roomType
                  ? unit.roomType === "Duplex" || unit.roomType === "Triplex"
                    ? "Apartment"
                    : unit.roomType
                  : "N/A"}
              </div>
            )}
            {unit.propertyFeatures?.floorNo && !unit.floor && (
              <div
                className={`text-xs ${
                  hasUnitData ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Floor {unit.propertyFeatures.floorNo}
              </div>
            )}
            {!hasUnitData && (
              <div className="text-xs text-gray-400 mt-1">
                Click to add details
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div
          className={`text-sm ${
            hasUnitData ? "text-gray-900" : "text-gray-500"
          }`}
        >
          {unit.areaDetails?.carpetArea
            ? `${unit.areaDetails.carpetArea} sq-ft`
            : "N/A"}
        </div>
        {unit.areaDetails?.builtUpArea && (
          <div
            className={`text-xs ${
              hasUnitData ? "text-gray-500" : "text-gray-400"
            }`}
          >
            Built-up: {unit.areaDetails.builtUpArea} sq-ft
          </div>
        )}
        {!hasUnitData && (
          <div className="text-xs text-gray-400 mt-1">Add area details</div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        {hasUnitData ? (
          <>
            <div className="text-gray-900">
              {formatCurrency(unit.priceDetails?.expectedPrice)}
            </div>
            {unit.priceDetails?.tokenAmount && (
              <div className="text-xs text-gray-500">
                Token: {formatCurrency(unit.priceDetails.tokenAmount)}
              </div>
            )}
            {unit.priceDetails?.priceNegotiable && (
              <div className="text-xs text-green-600">Negotiable</div>
            )}
          </>
        ) : (
          <div className="text-gray-500 italic text-sm">Add price details</div>
        )}
      </td>
      <td className="px-6 py-4">
        {hasUnitData ? (
          <div className="flex flex-wrap gap-1">
            {(unit.propertyFeatures?.bedrooms || 0) > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                <FaBed className="mr-1" /> {unit.propertyFeatures.bedrooms}BHK
              </span>
            )}
            {(unit.propertyFeatures?.bathrooms || 0) > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-cyan-100 text-cyan-800">
                <FaBath className="mr-1" /> {unit.propertyFeatures.bathrooms}
              </span>
            )}
            {unit.propertyFeatures?.furnishedStatus !== "Unfurnished" && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                {unit.propertyFeatures.furnishedStatus}
              </span>
            )}
            {unit.propertyFeatures?.parking > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800">
                <FaCar className="mr-1" /> {unit.propertyFeatures.parking}
              </span>
            )}
          </div>
        ) : (
          <div className="text-gray-500 italic text-sm">Add features</div>
        )}
      </td>
      <td className="px-6 py-4 text-sm">
        <div
          className={`font-medium ${
            hasUnitData ? "text-gray-900" : "text-gray-500"
          }`}
        >
          {brokerName}
        </div>
      </td>
      <td className="px-6 py-4 text-sm">
        <div
          className={`font-medium ${
            hasUnitData ? "text-gray-900" : "text-gray-500"
          }`}
        >
          {unit.purchaser || "N/A"}
        </div>
      </td>
      <td className="px-6 py-4 text-sm">
        <div
          className={`font-medium ${
            hasUnitData ? "text-gray-900" : "text-gray-500"
          }`}
        >
          {unit.constructor || "N/A"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        {hasUnitData && unit.transactionType?.possessionStatus ? (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            {unit.transactionType.possessionStatus}
          </span>
        ) : (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-500">
            {hasUnitData ? "N/A" : "Pending"}
          </span>
        )}
      </td>
    </tr>
  );
};

const ProjectDetailsTable = ({ project, onEditPlot, onEditUnit }) => {
  const allPlots = project.plots || [];
  const allUnits = project.units || [];

  const incompletePlots = allPlots.filter((plot) => !plot.isComplete);
  const incompleteUnits = allUnits.filter((unit) => !unit.isComplete);

  const completedPlots = allPlots.filter((plot) => plot.isComplete);
  const completedUnits = allUnits.filter((unit) => unit.isComplete);

  return (
    <div className="space-y-6">
      {/* Project Summary */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
          <FaBuilding className="mr-2" />
          Project Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Location:</span>
            <p className="font-medium">
              {project.city}, {project.locality}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Type:</span>
            <p className="font-medium capitalize">
              {project.type}{" "}
              {project.commercialSubType
                ? `(${project.commercialSubType})`
                : ""}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Total:</span>
            <p className="font-medium">
              {allPlots.length || allUnits.length || 0}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Zone:</span>
            <p className="font-medium">{project.landZone || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Detailed Plots/Units Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h4 className="text-lg font-semibold text-gray-800 flex items-center">
            <FaList className="mr-2" />
            {incompletePlots.length > 0
              ? "Pending Plots Details"
              : "Pending Units Details"}{" "}
            ({incompletePlots.length || incompleteUnits.length} pending)
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {incompletePlots.length > 0 ? "Plot" : "Unit"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Area Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Features
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Broker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purchaser
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contractor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {incompletePlots.length > 0 && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Corner Plot
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {incompletePlots.length > 0
                ? incompletePlots.map((plot, index) => (
                    <ProjectPlotRow
                      key={plot.id || index}
                      plot={plot}
                      project={project}
                      onEdit={() => onEditPlot(project, plot)}
                    />
                  ))
                : incompleteUnits.map((unit, index) => (
                    <ProjectUnitRow
                      key={unit.id || index}
                      unit={unit}
                      project={project}
                      onEdit={() => onEditUnit(project, unit)}
                    />
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary of completion status */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-800 mb-2">
          Completion Summary
        </h4>
        {allPlots.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-blue-600">
                {completedPlots.length}
              </div>
              <div className="text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-600">
                {incompletePlots.length}
              </div>
              <div className="text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">
                {Math.round((completedPlots.length / allPlots.length) * 100) ||
                  0}
                %
              </div>
              <div className="text-gray-600">Completion Rate</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-indigo-600">
                {allPlots.length}
              </div>
              <div className="text-gray-600">Total</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-blue-600">
                {completedUnits.length}
              </div>
              <div className="text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-600">
                {incompleteUnits.length}
              </div>
              <div className="text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">
                {Math.round((completedUnits.length / allUnits.length) * 100) ||
                  0}
                %
              </div>
              <div className="text-gray-600">Completion Rate</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-indigo-600">
                {allUnits.length}
              </div>
              <div className="text-gray-600">Total</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailsTable;