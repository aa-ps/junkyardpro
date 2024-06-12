"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import VehicleInput from "./VehicleInput";
import PartsInput from "./PartsInput";
import { PartCategory, SelectedPart, YearOption } from "@/interfaces/app_interfaces";

interface AddVehicleFormProps{
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
  const router = useRouter();

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
      router.push('/inventory');
      router.refresh();
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
