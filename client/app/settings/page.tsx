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
    <div className="container">
      <div className="p-6 bg-white rounded shadow-md max-w-4xl mx-auto">
        <h1 className="text-heading mb-4">Settings</h1>
        
        <section className="mb-6">
          <h2 className="text-subheading mb-2">User Profile</h2>
          <form>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input type="text" className="form-input" value="JohnDoe123" disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value="john.doe@example.com" disabled />
            </div>
            <div>
              <button type="button" className="form-button">Edit Profile</button>
            </div>
          </form>
        </section>
        
        <section className="mb-6">
          <h2 className="text-subheading mb-2">Account Settings</h2>
          <form>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" placeholder="Enter new password" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="form-input" placeholder="Confirm new password" />
            </div>
            <div>
              <button type="submit" className="save-button">Update Password</button>
            </div>
          </form>
        </section>

        <section className="mb-6">
          <h2 className="text-subheading mb-2">Invite Code</h2>
          <div className="form-group">
            <label className="form-label">Your Invite Code</label>
            <input type="text" className="form-input" value={inviteCode} readOnly />
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
    </div>
  );
}

export default Settings;
