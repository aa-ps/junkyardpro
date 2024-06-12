"use client";

import { useState } from "react";
import PartsInput from "../AddVehicle/PartsInput";
import { PartCategory, SelectedPart, Vehicle } from "@/interfaces/app_interfaces";

interface ViewVehicleFormProps {
  vehicle: Vehicle;
  partCategories: PartCategory[];
  parts: SelectedPart[];
}

const ViewVehicleForm = ({ vehicle, partCategories, parts }: ViewVehicleFormProps) => {
  const [selectedParts, setSelectedParts] = useState(parts);

  const renderReadOnlyInput = (label: string, value: string, name: string) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input
        className="w-full p-2 border border-gray-300 rounded"
        name={name}
        value={value}
        readOnly
        disabled
      />
    </div>
  );

  return (
    <form className="form-container" onSubmit={() => console.log("Submit")}>
      <h2 className="text-center text-2xl p-2">Vehicle Specifications</h2>
      {renderReadOnlyInput("Year", `${vehicle.year}`, "year")}
      {renderReadOnlyInput("Make", vehicle.make, "make")}
      {renderReadOnlyInput("Model", vehicle.model, "model")}
      {renderReadOnlyInput("Trim", vehicle.trim, "trim")}
      <PartsInput
        partCategories={partCategories}
        selectedParts={selectedParts}
        setSelectedParts={setSelectedParts}
      />
      <button className="form-button" type="submit">
        Save Changes
      </button>
    </form>
  );
};

export default ViewVehicleForm;
