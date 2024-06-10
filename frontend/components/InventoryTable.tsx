"use client";

import { Vehicle } from "@/interfaces/app_interfaces";

interface InventoryTableProps {
  inventory: Vehicle[];
}

const InventoryTable = ({ inventory }: InventoryTableProps) => {
  // Could hardcode headers if you don't plan on changing them.
  // TODO: Handle when inventory is length of 0, only show the headers.
  const renderHeader = () => {
    return (
      <thead className="bg-gray-200">
        <tr>
          {Object.keys(inventory[0]).map((key) => (
            <th
              key={key}
              className="uppercase px-4 py-2 border-b border-gray-300 text-left"
            >
              {key}
            </th>
          ))}
        </tr>
      </thead>
    );
  };

  const renderBody = () => {
    // Instead of looping, you can you get the object values directly if you don't plan on changing them.
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
