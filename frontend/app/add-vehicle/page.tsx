import AddVehicleForm, {
  Part,
  PartCategory,
  YearOption,
} from "@/components/forms/AddVehicle/AddVehicleForm";

export default async function AddVehicle() {
  try {
    const years: YearOption[] = await (
      await fetch("http://localhost:3333/years")
    ).json();
    const partCategories: PartCategory[] = await (
      await fetch("http://localhost:3333/part-categories")
    ).json();
    const parts: Part[] = await (
      await fetch("http://localhost:3333/parts")
    ).json();

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
