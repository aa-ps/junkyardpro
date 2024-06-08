"use client";

import { Part, PartCategory, SelectedPart } from "./AddVehicleForm";

interface PartsInputProps {
  parts: Part[];
  partCategories: PartCategory[];
  selectedParts: SelectedPart[];
  setSelectedParts: (selectedParts: SelectedPart[]) => void;
}

const PartsInput = ({
  selectedParts,
  parts,
  partCategories,
  setSelectedParts,
}: PartsInputProps) => {
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSelectedParts({
      ...selectedParts,
      [name]: checked,
    });
    console.log(selectedParts);
  };

  return (
    <div className="w-full p-4">
      <h2 className="text-center text-2xl font-semibold mb-4">
        Parts Availability
      </h2>
      <fieldset className="border-t border-b border-gray-300 py-2">
        <legend className="sr-only">Available Parts</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {parts.map((part, i) => (
            <div
              key={i}
              className="flex items-center bg-white p-3 rounded-lg shadow hover:shadow-md transition-shadow duration-300 ease-in-out"
            >
              <input
                type="checkbox"
                id={`part-${i}`}
                name={part.name}
                onChange={onChange}
                className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`part-${i}`} className="text-sm text-gray-700">
                {part.name}
              </label>
            </div>
          ))}
        </div>
      </fieldset>
    </div>
  );
};

export default PartsInput;
