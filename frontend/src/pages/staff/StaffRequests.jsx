import StaffLayout from "./StaffLayout";

function StaffRequests() {
  const sampleRequests = [
    { id: 1, resident: "Juan Dela Cruz", type: "Repair Request", status: "Pending" },
    { id: 2, resident: "Maria Santos", type: "Permit Request", status: "Approved" },
  ];

  return (
    <StaffLayout>
      <h2 className="text-2xl font-bold mb-4">Resident Requests</h2>
      <table className="w-full border border-gray-300 bg-white">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2 border">Resident</th>
            <th className="p-2 border">Request Type</th>
            <th className="p-2 border">Status</th>
          </tr>
        </thead>
        <tbody>
          {sampleRequests.map((req) => (
            <tr key={req.id}>
              <td className="p-2 border">{req.resident}</td>
              <td className="p-2 border">{req.type}</td>
              <td className="p-2 border">{req.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </StaffLayout>
  );
}

export default StaffRequests;
