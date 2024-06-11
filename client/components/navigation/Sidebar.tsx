"use client";
import Link from "next/link";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { MdDashboard, MdInventory, MdAdd, MdSettings } from "react-icons/md";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const pathName = usePathname();
  return (
    <div className="h-full bg-[#2F4F4F] text-white fixed flex flex-col items-center w-20 md:w-52">
      <div className="p-4 text-xl md:text-2xl font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
        <span className="md:hidden">JYP</span>
        <span className="hidden md:inline">JunkYardPro</span>
      </div>
      <nav className="flex flex-col w-full">
        <Link
          href="/dashboard"
          className={`flex gap-4 p-2 justify-center md:justify-start hover:bg-gray-600 ${
            pathName === "/dashboard" ? "bg-gray-700" : ""
          }`}
        >
          <MdDashboard size={25} title="Dashboard" />
          <span className="hidden md:inline">Dashboard</span>
        </Link>
        <Link
          href="/inventory"
          className={`flex gap-4 p-2 justify-center md:justify-start hover:bg-gray-600 ${
            pathName === "/inventory" ? "bg-gray-700" : ""
          }`}
        >
          <MdInventory size={25} title="Inventory" />
          <span className="hidden md:inline">Inventory</span>
        </Link>
        <Link
          href="/add-vehicle"
          className={`flex gap-4 p-2 justify-center md:justify-start hover:bg-gray-600 ${
            pathName === "/add-vehicle" ? "bg-gray-700" : ""
          }`}
        >
          <MdAdd size={25} title="Add Vehicle" />
          <span className="hidden md:inline">Add Vehicle</span>
        </Link>
        <Link
          href="/settings"
          className={`flex gap-4 p-2 justify-center md:justify-start hover:bg-gray-600 ${
            pathName === "/settings" ? "bg-gray-700" : ""
          }`}
        >
          <MdSettings size={25} title="Settings" />
          <span className="hidden md:inline">Settings</span>
        </Link>
      </nav>
      <footer className="flex gap-4 mt-auto pb-5">
        <Link href="https://github.com/aa-ps">
          <FaGithub
            aria-label="GitHub Profile"
            size={25}
            title="GitHub Profile"
          />
        </Link>
        <Link href="https://www.linkedin.com/in/aaron-pulido-salinas/">
          <FaLinkedin
            aria-label="LinkedIn Profile"
            size={25}
            title="LinkedIn Profile"
          />
        </Link>
      </footer>
    </div>
  );
};

export default Sidebar;
