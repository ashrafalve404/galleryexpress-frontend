export default function AdminCmsPage() {
  const pages = [
    { slug: 'about', title: 'About Us', lastModified: '2024-01-15' },
    { slug: 'terms', title: 'Terms & Conditions', lastModified: '2024-01-10' },
    { slug: 'privacy', title: 'Privacy Policy', lastModified: '2024-01-10' },
    { slug: 'cancellation-policy', title: 'Cancellation Policy', lastModified: '2024-01-12' },
    { slug: 'faq', title: 'FAQ', lastModified: '2024-01-14' },
  ];
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-black text-[#111111]">CMS Pages</h1><p className="text-gray-500 text-sm mt-0.5">Manage website content pages</p></div>
      </div>
      <div className="space-y-3">
        {pages.map((page) => (
          <div key={page.slug} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between hover:shadow-sm transition-shadow">
            <div>
              <div className="font-semibold text-[#111111]">{page.title}</div>
              <div className="text-xs text-gray-400 mt-0.5">/{page.slug} · Last modified: {page.lastModified}</div>
            </div>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
