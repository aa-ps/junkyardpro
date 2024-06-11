import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your settings for JunkYardPro.",
};

const Settings = () => {

  const inviteCode = "JUNKYARD2023";
  const invitedUsers = [
    { id: 1, username: "JaneDoe456", email: "jane.doe@example.com" },
    { id: 2, username: "SamSmith789", email: "sam.smith@example.com" },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>
      
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">User Profile</h2>
        <form>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value="JohnDoe123" disabled />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value="john.doe@example.com" disabled />
          </div>
          <div>
            <button type="button" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Edit Profile</button>
          </div>
        </form>
      </section>
      
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Account Settings</h2>
        <form>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input type="password" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="Enter new password" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input type="password" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="Confirm new password" />
          </div>
          <div>
            <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">Update Password</button>
          </div>
        </form>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Invite Code</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Your Invite Code</label>
          <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={inviteCode} readOnly />
        </div>
        <h3 className="text-lg font-semibold mt-4">Users Invited</h3>
        <table className="min-w-full bg-white mt-2">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b border-gray-200">Username</th>
              <th className="py-2 px-4 border-b border-gray-200">Email</th>
            </tr>
          </thead>
          <tbody>
            {invitedUsers.map(user => (
              <tr key={user.id} className="text-center">
                <td className="py-2 px-4 border-b border-gray-200">{user.username}</td>
                <td className="py-2 px-4 border-b border-gray-200">{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default Settings;
