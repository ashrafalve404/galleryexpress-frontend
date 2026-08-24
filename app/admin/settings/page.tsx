export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-black text-[#111111] mb-6">Settings</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          { title: 'Company Information', fields: ['Company Name', 'Email', 'Phone', 'Address'] },
          { title: 'Booking Settings', fields: ['Hold Duration (minutes)', 'Max Seats per Booking', 'Cancellation Window (hours)'] },
          { title: 'Notification Settings', fields: ['SMS Notifications', 'Email Notifications'] },
        ].map((section) => (
          <div key={section.title} className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-[#111111] mb-4">{section.title}</h2>
            <div className="space-y-3">
              {section.fields.map((field) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{field}</label>
                  <input type="text" placeholder={field} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20" />
                </div>
              ))}
            </div>
            <button className="mt-4 w-full bg-[#111111] hover:bg-gray-800 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
              Save Changes
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
