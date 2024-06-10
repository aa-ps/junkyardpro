"use client";

import { useState } from "react";
import VehicleInput from "./VehicleInput";
import PartsInput from "./PartsInput";

export type YearOption = {
  year: number;
};
export type MakeOption = {
  make: string;
};
export type ModelOption = {
  model: string;
};
export type TrimOption = {
  trim: string;
};

export type PartCategory = {
  id: number;
  name: string;
};

export type Part = {
  id: number;
  name: string;
  category_id: number;
};

export type SelectedPart = {
  id: number;
  name: string;
  category_id: number;
  available: boolean;
};

type AddVehicleFormProps = {
  years: YearOption[];
  partCategories: PartCategory[];
  parts: SelectedPart[];
};

const AddVehicleForm = ({
  years,
  partCategories,
  parts,
}: AddVehicleFormProps) => {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMake, setSelectedMake] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedTrim, setSelectedTrim] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Array<Error>>([]);
  const [selectedParts, setSelectedParts] = useState(parts);

  const apiEndpoint = "http://localhost:3333";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedYear || !selectedMake || !selectedModel || !selectedTrim)
      return;

    setIsLoading(true);
    setErrors([]);

    try {
      const res = await fetch(`${apiEndpoint}/add-vehicle`, {
        method: "POST",
        body: JSON.stringify({
          year: selectedYear,
          make: selectedMake,
          model: selectedModel,
          trim: selectedTrim,
          parts: selectedParts,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to add vehicle");

      const data = await res.json();
      console.log("Vehicle added:", data);
    } catch (err) {
      if (err instanceof Error) {
        setErrors([...errors, err]);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="form-container" onSubmit={onSubmit}>
      <VehicleInput
        years={years}
        errors={errors}
        setErrors={setErrors}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedMake={selectedMake}
        setSelectedMake={setSelectedMake}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        selectedTrim={selectedTrim}
        setSelectedTrim={setSelectedTrim}
      />
      {selectedYear && selectedMake && selectedModel && selectedTrim && (
        <PartsInput
          partCategories={partCategories}
          selectedParts={selectedParts}
          setSelectedParts={setSelectedParts}
        />
      )}
      {errors && (
        <p className="error-message">
          {errors.map((err: Error, index: number) => (
            <span key={index}>{err.message}</span>
          ))}
        </p>
      )}
      <button
        className="form-button"
        type="submit"
        disabled={
          isLoading ||
          !selectedYear ||
          !selectedMake ||
          !selectedModel ||
          !selectedTrim
        }
      >
        {isLoading ? "Adding..." : "Add Vehicle"}
      </button>
    </form>
  );
};

export default AddVehicleForm;
