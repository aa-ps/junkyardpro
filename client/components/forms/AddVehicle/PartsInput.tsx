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
    <div className="w-full p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-center text-2xl p-4 text-gray-800">Parts Availability</h2>
      {partCategories.map(category => (
        <fieldset key={category.id} className="border-t border-b border-gray-300 py-4 mb-6">
          <legend className="sr-only">{category.name}</legend>
          <button
            type="button"
            onClick={() => toggleCategory(category.id)}
            className="w-full text-left py-3 px-5 bg-blue-100 hover:bg-blue-200 rounded-lg mb-4 font-semibold text-blue-800"
          >
            {category.name}
          </button>
          {openCategories[category.id] && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {renderCategoryParts(selectedParts.filter(part => part.category_id === category.id))}
            </div>
          )}
        </fieldset>
      ))}
    </div>
  );
};

export default PartsInput;
