"use client";

import React, { ChangeEvent, FormEvent, useState } from "react";
import { MakeOption, ModelOption, TrimOption, YearOption } from "./AddVehicleForm";

interface VehicleInputProps {
  years: YearOption[];
  errors: Error[];
  setErrors: (err: Array<Error>) => void;
  selectedYear: number | null;
  setSelectedYear: (year: number) => void;
  selectedMake: string | null;
  setSelectedMake: (make: string) => void;
  selectedModel: string | null;
  setSelectedModel: (model: string) => void;
  selectedTrim: string | null;
  setSelectedTrim: (trim: string) => void;
}

const VehicleInput = ({
  years,
  errors,
  setErrors,
  selectedYear,
  setSelectedYear,
  selectedMake,
  setSelectedMake,
  selectedModel,
  setSelectedModel,
  selectedTrim,
  setSelectedTrim,
}: VehicleInputProps) => {
  const [makes, setMakes] = useState<MakeOption[]>([]);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [trims, setTrims] = useState<TrimOption[]>([]);
  const [isLoadingMakes, setIsLoadingMakes] = useState<boolean>(false);
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(false);
  const [isLoadingTrims, setIsLoadingTrims] = useState<boolean>(false);

  const apiEndpoint = "http://localhost:3333";


  async function fetchData(endpoint: string, params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await fetch(`${apiEndpoint}/${endpoint}?${query}`);
      if (!response.ok) throw new Error("Failed to fetch data");
      return response.json();
    } catch (err) {
      if (err instanceof Error) {
        setErrors([...errors, err]);
      }
      return [];
    }
  }

  const handleYearChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const year = event.target.value;
    setSelectedYear(parseInt(year));
    setSelectedMake("");
    setSelectedModel("");
    setSelectedTrim("");
    setMakes([]);
    setModels([]);
    setTrims([]);

    setIsLoadingMakes(true);
    const makesData = await fetchData("makes", { year });
    setIsLoadingMakes(false);
    setMakes(makesData);
  };

  const handleMakeChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const make = event.target.value;
    setSelectedMake(make);
    setSelectedModel("");
    setSelectedTrim("");
    setModels([]);
    setTrims([]);

    setIsLoadingModels(true);
    const modelsData = await fetchData("models", { year: selectedYear, make });
    setIsLoadingModels(false);
    setModels(modelsData);
  };

  const handleModelChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const model = event.target.value;
    setSelectedModel(model);
    setSelectedTrim("");
    setTrims([]);

    setIsLoadingTrims(true);
    const trimsData = await fetchData("trims", {
      year: selectedYear,
      make: selectedMake,
      model,
    });
    setIsLoadingTrims(false);
    setTrims(trimsData);
  };

  return (
    <div>
      <h2 className="text-center text-2xl p-2">Vehicle Specifications</h2>
      <div className="form-group">
        <label className="form-label">Year</label>
        <select
          className="form-select"
          name="year"
          value={selectedYear || ""}
          onChange={handleYearChange}
        >
          <option value="" disabled>
            Select Vehicle Year
          </option>
          {years.map(({ year }: YearOption) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Make</label>
        <select
          className="form-select"
          name="make"
          value={selectedMake || ""}
          onChange={handleMakeChange}
          disabled={!selectedYear || isLoadingMakes}
        >
          <option value="" disabled>
            {isLoadingMakes ? "Loading makes..." : "Select Vehicle Make"}
          </option>
          {makes.map(({ make }: MakeOption) => (
            <option key={make} value={make}>
              {make}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Model</label>
        <select
          className="form-select"
          name="model"
          value={selectedModel || ""}
          onChange={handleModelChange}
          disabled={!selectedMake || isLoadingModels}
        >
          <option value="" disabled>
            {isLoadingModels ? "Loading models..." : "Select Vehicle Model"}
          </option>
          {models.map(({ model }: ModelOption) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Trim</label>
        <select
          className="form-select"
          name="trim"
          value={selectedTrim || ""}
          onChange={(event) => setSelectedTrim(event.target.value)}
          disabled={!selectedModel || isLoadingTrims}
        >
          <option value="" disabled>
            {isLoadingTrims ? "Loading trims..." : "Select Vehicle Trim"}
          </option>
          {trims.map(({ trim }: TrimOption) => (
            <option key={trim} value={trim}>
              {trim}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default VehicleInput;
