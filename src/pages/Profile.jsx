import { useState } from "react";

export default function Profile() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark", !darkMode);
  };

  const handleChangePassword = () => {
    alert("Redirecting to change password form...");
    // Later, navigate to a proper route or modal
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      <div className="p-4 border-b text-xl font-bold bg-white dark:bg-black">← Profile</div>

      <div className="p-6 flex flex-col items-center">
        {/* Avatar */}
        <div className="w-24 h-24 bg-gray-300 rounded-full mb-4 relative">
          <span className="absolute right-0 bottom-0 text-lg">✏️</span>
        </div>

        <h2 className="font-bold text-lg">Name Of Signup</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">Email login and contact details</p>
      </div>

      <hr className="my-4" />

      {/* Settings */}
      <div className="px-6">
        <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">General settings</h3>

        {/* Dark Mode Toggle */}
        <div className="flex justify-between items-center py-2 border-b">
          <div>
            <p className="text-sm font-medium">Mode</p>
            <p className="text-xs text-gray-500">Dark & Light</p>
          </div>
          <input type="checkbox" checked={darkMode} onChange={toggleTheme} className="scale-150" />
        </div>

        {/* Change Password */}
        <div className="py-2 border-b flex justify-between items-center cursor-pointer" onClick={handleChangePassword}>
          <p className="font-medium">🔑 Change Password</p>
          <span>›</span>
        </div>

        {/* Info Links */}
        <h3 className="font-semibold text-gray-600 dark:text-gray-300 mt-4 mb-2">Information</h3>

        <div className="py-2 border-b flex justify-between items-center cursor-pointer">
          <p>📄 About App</p><span>›</span>
        </div>
        <div className="py-2 border-b flex justify-between items-center cursor-pointer">
          <p>📜 Terms & Conditions</p><span>›</span>
        </div>
        <div className="py-2 border-b flex justify-between items-center cursor-pointer">
          <p>🔒 Privacy Policy</p><span>›</span>
        </div>
        <div className="py-2 flex justify-between items-center cursor-pointer">
          <p>🔗 Share this App</p><span>›</span>
        </div>
      </div>
    </div>
  );
}

