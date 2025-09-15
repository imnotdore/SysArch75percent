import StaffLayout from "./StaffLayout";

function StaffAnnouncements() {
  const announcements = [
    { id: 1, title: "Barangay Meeting", date: "2025-09-20" },
    { id: 2, title: "Cleanup Drive", date: "2025-09-25" },
  ];

  return (
    <StaffLayout>
      <h2 className="text-2xl font-bold mb-4">Manage Announcements</h2>
      <ul className="space-y-3">
        {announcements.map((a) => (
          <li key={a.id} className="p-4 bg-white border rounded shadow">
            <h3 className="font-semibold">{a.title}</h3>
            <p className="text-sm text-gray-600">Date: {a.date}</p>
          </li>
        ))}
      </ul>
    </StaffLayout>
  );
}

export default StaffAnnouncements;
