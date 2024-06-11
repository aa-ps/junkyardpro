// Vehicle: year, make, model, trim
export interface YearOption {
  year: number;
}
export interface MakeOption {
  make: string;
}
export interface ModelOption {
  model: string;
}
export interface TrimOption {
  trim: string;
}

// Name of category and id it belongs to in db.
export interface PartCategory {
  id: number;
  name: string;
}

// Parts
export interface Part {
  id: number;
  name: string;
  category_id: number;
}

// Parts with availability, for checkbox options
export interface SelectedPart {
  id: number;
  name: string;
  category_id: number;
  available: boolean;
}

// Results from /inventory/stats api
export interface InventoryStats {
  part_count: number;
  vehicle_count: number;
  recent_vehicles: Vehicle[];
}

// Objects from vehicles table
export interface Vehicle {
  id: number;
  year: number;
  make: string;
  model: string;
  trim: string;
}
