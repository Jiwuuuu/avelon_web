import adminProfile from "../assets/will.png";

export default function Settings() {
  return (
    <div className="bg-gray-50 min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-end items-center">
        <div className="flex items-center gap-3">
          <img
            src={adminProfile}
            alt="Admin"
            className="w-10 h-10 rounded-full object-cover"
          />
          <span className="text-sm font-medium">Admin</span>
        </div>
      </div>

      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
      </div>
    </div>
  );
}
