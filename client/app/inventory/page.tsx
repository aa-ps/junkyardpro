import InventoryTable from "@/components/InventoryTable";
import { Metadata } from "next";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Inventory",
  description: "View and manage your inventory in JunkYardPro.",
};

export default async function Inventory() {
  try {
    const inventory = await (
      await fetch("http://localhost:3333/inventory", { cache: "no-store" })
    ).json();
    return <InventoryTable inventory={inventory} />;
  } catch (err) {
    if (err instanceof Error) {
      return <main></main>;
    }
  }
}
