"use client";

import { PartCategory, SelectedPart } from '@/interfaces/app_interfaces';
import { useState, ChangeEvent } from 'react';

interface PartsInputProps {
  partCategories: PartCategory[];
  selectedParts: SelectedPart[];
  setSelectedParts: (selectedParts: SelectedPart[]) => void;
}

const PartsInput = ({ partCategories, selectedParts, setSelectedParts }: PartsInputProps) => {
  const [openCategories, setOpenCategories] = useState<Record<number, boolean>>({});

  const toggleCategory = (categoryId: number) => {
    setOpenCategories(prevState => ({
      ...prevState,
      [categoryId]: !prevState[categoryId],
    }));
  };

  // TODO: Possibly reduce to O(1) and directly get the part where the index of it is equal to the id.
  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>, id: number): void => {
    const { checked } = e.target;
    const updatedParts: SelectedPart[] = selectedParts.map((part: SelectedPart): SelectedPart => {
        return part.id === id ? {...part, available: checked} : part;
    });
    setSelectedParts(updatedParts);
};


  const renderCategoryParts = (parts: SelectedPart[]) => {
    return parts.map(part => (
      <div
        key={part.id}
        className="flex items-center bg-white p-3 rounded-lg shadow hover:shadow-md transition-shadow duration-300 ease-in-out"
      >
        <input
          type="checkbox"
          id={`part-${part.name}`}
          name={part.name}
          checked={part.available}
          onChange={(e) => handleCheckboxChange(e, part.id)}
          className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor={`part-${part.name}`} className="text-sm text-gray-700">
          {part.name}
        </label>
      </div>
    ));
  };

  return (
    <div className="w-full p-4">
      <h2 className="text-center text-2xl p-2">Parts Availability</h2>
      {partCategories.map(category => (
        <fieldset key={category.id} className="border-t border-b border-gray-300 py-2 mb-4">
          <legend className="sr-only">{category.name}</legend>
          <button
            type="button"
            onClick={() => toggleCategory(category.id)}
            className="w-full text-left py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-lg mb-2"
          >
            {category.name}
          </button>
          {openCategories[category.id] && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {renderCategoryParts(selectedParts.filter(part => part.category_id === category.id))}
            </div>
          )}
        </fieldset>
      ))}
    </div>
  );
};

export default PartsInput;
