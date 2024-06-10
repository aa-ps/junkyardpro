import InventoryTable from "@/components/InventoryTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inventory",
  description: "View and manage your inventory in JunkYardPro.",
};

export default async function Inventory() {
  try {
    // TODO: Update inventory when new vehicle added.
    // Get the latest added vehicles. Do not store cache.
    const inventory = await (await fetch("http://localhost:3333/inventory", { cache: 'no-store' })).json();
    return <InventoryTable inventory={inventory} />;
  } catch (err) {
    if (err instanceof Error) {
      return <main></main>;
    }
  }
}
