import PartsInput from "@/components/forms/AddVehicle/PartsInput";
import ViewVehicleForm from "@/components/forms/ViewVehicle/ViewVehicleForm";
import {
  PartCategory,
  SelectedPart,
  Vehicle,
} from "@/interfaces/app_interfaces";
import { notFound, redirect } from "next/navigation";

const fetchVehicleData = async (id: number) => {
  const endPoint = `http://localhost:3333/view-vehicle/${id}`;

  try {
    const response = await fetch(endPoint);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Failed to fetch vehicle data:", error);
    return null;
  }
};

const processIdAndGetData = async (slugId: string) => {
  const id = parseInt(slugId, 10);
  if (isNaN(id)) {
    redirect("/inventory");
    return null;
  }

  const data = await fetchVehicleData(id);

  if (!data) {
    notFound();
  }

  return data;
};

const ViewVehicle = async ({ params }: { params: { id: string } }) => {
  const data = await processIdAndGetData(params.id);
  const partCategories: PartCategory[] = await (
    await fetch("http://localhost:3333/part-categories")
  ).json();
  if (!data) {
    return <p>Error: Vehicle data not found</p>;
  }

  const { vehicle, parts }: { vehicle: Vehicle; parts: SelectedPart[] } = data;

  return (
    <div>
      <ViewVehicleForm
        vehicle={vehicle}
        partCategories={partCategories}
        parts={parts}
      />
    </div>
  );
};

export default ViewVehicle;
