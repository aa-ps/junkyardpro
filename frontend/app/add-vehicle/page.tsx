import AddVehicleForm, {
  Part,
  PartCategory,
  SelectedPart,
  YearOption,
} from "@/components/forms/AddVehicle/AddVehicleForm";

const initializeSelectedParts = (parts: Part[]) => {
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
