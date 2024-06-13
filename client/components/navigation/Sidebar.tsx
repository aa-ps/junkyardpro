"use client";
import Link from "next/link";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { MdDashboard, MdInventory, MdAdd, MdSettings } from "react-icons/md";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const pathName = usePathname();

  const linkClasses = (path: string) =>
    `flex gap-4 p-2 justify-center md:justify-start hover:bg-gray-600 ${
      pathName === path ? "bg-gray-700" : ""
    }`;

  return (
    <div className="h-full bg-[#2F4F4F] text-white fixed flex flex-col items-center w-20 md:w-52 p-4">
      <div className="text-xl md:text-2xl font-semibold whitespace-nowrap overflow-hidden text-ellipsis mb-6">
        <span className="md:hidden">JYP</span>
        <span className="hidden md:inline">JunkYardPro</span>
      </div>
      <nav className="flex flex-col w-full space-y-2">
        <Link href="/dashboard" className={linkClasses("/dashboard")}>
          <MdDashboard size={25} title="Dashboard" />
          <span className="hidden md:inline">Dashboard</span>
        </Link>
        <Link href="/inventory" className={linkClasses("/inventory")}>
          <MdInventory size={25} title="Inventory" />
          <span className="hidden md:inline">Inventory</span>
        </Link>
        <Link href="/add-vehicle" className={linkClasses("/add-vehicle")}>
          <MdAdd size={25} title="Add Vehicle" />
          <span className="hidden md:inline">Add Vehicle</span>
        </Link>
        <Link href="/settings" className={linkClasses("/settings")}>
          <MdSettings size={25} title="Settings" />
          <span className="hidden md:inline">Settings</span>
        </Link>
      </nav>
      <footer className="flex gap-4 mt-auto pt-6">
        <Link href="https://github.com/aa-ps" target="_blank" rel="noopener noreferrer">
          <FaGithub
            aria-label="GitHub Profile"
            size={25}
            title="GitHub Profile"
            className="hover:text-gray-400"
          />
        </Link>
        <Link href="https://www.linkedin.com/in/aaron-pulido-salinas/" target="_blank" rel="noopener noreferrer">
          <FaLinkedin
            aria-label="LinkedIn Profile"
            size={25}
            title="LinkedIn Profile"
            className="hover:text-gray-400"
          />
        </Link>
      </footer>
    </div>
  );
};

export default Sidebar;
