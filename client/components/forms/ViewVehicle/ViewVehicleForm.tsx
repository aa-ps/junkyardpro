"use client";

import { useState } from "react";
import PartsInput from "../AddVehicle/PartsInput";
import {
  PartCategory,
  SelectedPart,
  Vehicle,
} from "@/interfaces/app_interfaces";
import { useRouter } from "next/navigation";

interface ViewVehicleFormProps {
  slug: number;
  vehicle: Vehicle;
  partCategories: PartCategory[];
  parts: SelectedPart[];
}

const ViewVehicleForm = ({
  slug,
  vehicle,
  partCategories,
  parts,
}: ViewVehicleFormProps) => {
  const router = useRouter();
  const [selectedParts, setSelectedParts] = useState(parts);
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const renderReadOnlyInput = (label: string, value: string, name: string) => (
    <div className="form-group mb-4">
      <label className="form-label block mb-2 text-gray-700 font-semibold">
        {label}
      </label>
      <input
        className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        name={name}
        value={value}
        readOnly
        disabled
      />
    </div>
  );

  const handleDelete = async () => {
    setIsPopupVisible(true);
  };

  const confirmDelete = async () => {
    setIsPopupVisible(false);
    try {
      const response = await fetch(`http://localhost:3333/vehicle/${slug}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete vehicle");
      }

      console.log("Vehicle deleted successfully");
      router.push("/inventory");
      router.refresh();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:3333/vehicle/${slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ parts: selectedParts }),
      });

      if (!response.ok) {
        throw new Error("Failed to update vehicle");
      }

      console.log("Vehicle updated successfully");
      router.push("/inventory");
      router.refresh();
    } catch (error) {
      console.error("Error updating vehicle:", error);
      // TODO: Append to errors to show on screen.
    }
  };

  return (
    <div className="relative p-6 bg-gray-100 rounded-lg shadow-md">
      <form className="form-container">
        <h2 className="text-center text-2xl p-4 text-gray-800">
          Vehicle Specifications
        </h2>
        {renderReadOnlyInput("Year", `${vehicle.year}`, "year")}
        {renderReadOnlyInput("Make", vehicle.make, "make")}
        {renderReadOnlyInput("Model", vehicle.model, "model")}
        {renderReadOnlyInput("Trim", vehicle.trim, "trim")}
        <PartsInput
          partCategories={partCategories}
          selectedParts={selectedParts}
          setSelectedParts={setSelectedParts}
        />
        <div className="flex gap-3 mt-4">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
            type="button"
            onClick={handleSave}
          >
            Save Changes
          </button>
          <button
            type="button"
            className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-700"
            onClick={handleDelete}
          >
            Delete Vehicle
          </button>
        </div>
      </form>
      {isPopupVisible && (
        <div className="flex items-center justify-center fixed inset-0 bg-gray-800 bg-opacity-75 z-50">
          <div className="bg-white p-6 rounded shadow-md text-center">
            <p>Are you sure you want to delete this vehicle?</p>
            <div className="flex justify-around mt-4">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={confirmDelete}
              >
                Yes
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700"
                onClick={() => setIsPopupVisible(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewVehicleForm;
