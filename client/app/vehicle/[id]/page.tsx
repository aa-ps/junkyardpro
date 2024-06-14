import ViewVehicleForm from "@/components/forms/ViewVehicle/ViewVehicleForm";
import {
  PartCategory,
  SelectedPart,
  Vehicle,
} from "@/interfaces/app_interfaces";
import { notFound, redirect } from "next/navigation";

const fetchVehicleData = async (id: number) => {
  const endPoint = `http://server:5000/vehicle/${id}`;

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
  const { partCategories }: { partCategories: PartCategory[] } = await (
    await fetch("http://server:5000/part-categories")
  ).json();
  if (!data) {
    return <p className="text-error">Error: Vehicle data not found</p>;
  }

  const { vehicle, parts }: { vehicle: Vehicle; parts: SelectedPart[] } = data;

  return (
    <div className="container">
      <div className="bg-white p-6 rounded shadow-md max-w-4xl mx-auto">
        <h1 className="text-heading mb-4">Vehicle Details</h1>
        <ViewVehicleForm
          slug={parseInt(params.id)}
          vehicle={vehicle}
          partCategories={partCategories}
          parts={parts}
        />
      </div>
    </div>
  );
};

export default ViewVehicle;
