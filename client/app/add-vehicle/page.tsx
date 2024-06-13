// app/add-vehicle/page.tsx
import AddVehicleForm from "@/components/forms/AddVehicle/AddVehicleForm";
import {
  Part,
  PartCategory,
  SelectedPart,
  YearOption,
} from "@/interfaces/app_interfaces";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Vehicle",
  description: "Add a new vehicle to your inventory on JunkYardPro.",
};

const initializeSelectedParts = ({ parts }: { parts: Part[] }): SelectedPart[] => {
  return parts.map((part) => ({ ...part, available: true }));
};

export default async function AddVehicle() {
  try {
    const yearsResponse = await fetch("http://localhost:3333/years");
    const partCategoriesResponse = await fetch("http://localhost:3333/part-categories");
    const partsResponse = await fetch("http://localhost:3333/parts");

    if (!yearsResponse.ok || !partCategoriesResponse.ok || !partsResponse.ok) {
      throw new Error('Failed to fetch data from the server');
    }

    const { years }: { years: YearOption[] } = await yearsResponse.json();
    const { partCategories }: { partCategories: PartCategory[] } = await partCategoriesResponse.json();
    const parts: SelectedPart[] = initializeSelectedParts(await partsResponse.json());

    return (
      <AddVehicleForm
        years={years}
        partCategories={partCategories}
        parts={parts}
      />
    );
  } catch (err) {
    return <h1>{err instanceof Error ? err.message : "An unexpected error occurred"}</h1>;
  }
}
