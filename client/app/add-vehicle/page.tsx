import AddVehicleForm from "@/components/forms/AddVehicle/AddVehicleForm";
import { Part, PartCategory, SelectedPart, YearOption } from "@/interfaces/app_interfaces";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Vehicle",
  description: "Add a new vehicle to your inventory on JunkYardPro.",
};

const initializeSelectedParts = (parts: Part[]): SelectedPart[] => {
  return parts.map((part) => ({ ...part, available: true }));
};

export default async function AddVehicle() {
  try {
    const years: YearOption[] = await (
      await fetch("http://localhost:3333/years")
    ).json();
    const partCategories: PartCategory[] = await (
      await fetch("http://localhost:3333/part-categories")
    ).json();
    const parts: SelectedPart[] = initializeSelectedParts(
      await (await fetch("http://localhost:3333/parts")).json()
    );

    return (
      <AddVehicleForm
        years={years}
        partCategories={partCategories}
        parts={parts}
      />
    );
  } catch (err) {
    if (err instanceof Error) {
      return <h1>{err.message}</h1>;
    }
  }
}
