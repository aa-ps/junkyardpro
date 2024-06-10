import InventoryTable from "@/components/InventoryTable";

export default async function Inventory() {
  try {
    const res = await fetch("http://localhost:3333/inventory");
    const inventory = await res.json();
    return <InventoryTable inventory={inventory} />;
  } catch (err) {
    if (err instanceof Error) {
      return <main></main>;
    }
  }
}
