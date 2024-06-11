import { InventoryStats, Vehicle } from "@/interfaces/app_interfaces";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | JunkYardPro",
  description: "Dashboard to manage your junkyard inventory on JunkYardPro.",
};

const Dashboard = async () => {
  const { part_count, vehicle_count, recent_vehicles }: InventoryStats = await (
    await fetch("http://localhost:3333/inventory/stats", { cache: "no-store" })
  ).json();
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Total Vehicles</h3>
            <p className="text-2xl font-bold">{vehicle_count}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Parts Available</h3>
            <p className="text-2xl font-bold">{part_count}</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Recent Activity</h2>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <ul className="list-disc list-inside">
            {recent_vehicles.length > 0 ? recent_vehicles.map((vehicle: Vehicle, index: number) => {
              return (
                <li
                  key={index}
                >{`Added new vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`}</li>
              );
            }) : <li>There is no recent activity.</li>}
          </ul>
        </div>
      </section>
    </main>
  );
}

export default Dashboard;