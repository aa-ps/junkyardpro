"use client";

import { Vehicle } from "@/interfaces/app_interfaces";

interface InventoryTableProps {
  inventory: Vehicle[];
}

const InventoryTable = ({ inventory }: InventoryTableProps) => {
  // Could hardcode headers if you don't plan on changing them.
  const headers = inventory.length > 0 ? Object.keys(inventory[0]) : ["id", "type", "brand", "model"];
  const renderHeader = () => {
    return (
      <thead className="bg-gray-200">
        <tr>
          {headers.map((header) => (
            <th
              key={header}
              className="uppercase px-4 py-2 border-b border-gray-300 text-left"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
    );
  };

  const renderBody = () => {
    if (inventory.length === 0) {
      return (
        <tbody>
          <tr>
            <td colSpan={Object.keys(inventory[0] || headers).length} className="text-center p-4">
              No vehicles in inventory.
            </td>
          </tr>
        </tbody>
      );
    }
    return (
      <tbody>
        {inventory.map((vehicle) => (
          <tr key={vehicle.id} className="odd:bg-white even:bg-gray-100">
            {Object.values(vehicle).map((val, index) => (
              <td key={index} className="px-4 py-2 border-b border-gray-300">
                {val}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        {renderHeader()}
        {renderBody()}
      </table>
    </div>
  );
};

export default InventoryTable;
