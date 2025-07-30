import { Settings } from "lucide-react";

const SettingsPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center text-gray-600 uppercase">
      <Settings className="w-10 h-10 mb-4 text-gray-400" />
      <h2 className="text-xl font-semibold ">No Settings Available</h2>
      <p className="mt-2 text-sm text-gray-500">There are currently no settings to configure.</p>
    </div>
  );
};

export default SettingsPage;
