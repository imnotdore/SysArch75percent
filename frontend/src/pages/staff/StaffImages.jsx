import StaffLayout from "./StaffLayout";

function StaffImages() {
  const images = [
    { id: 1, url: "https://via.placeholder.com/150", caption: "Community Event" },
    { id: 2, url: "https://via.placeholder.com/150", caption: "Cleanup Drive" },
  ];

  return (
    <StaffLayout>
      <h2 className="text-2xl font-bold mb-4">Manage Images</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((img) => (
          <div key={img.id} className="bg-white p-2 rounded shadow">
            <img src={img.url} alt={img.caption} className="rounded mb-2" />
            <p className="text-sm text-gray-700">{img.caption}</p>
          </div>
        ))}
      </div>
    </StaffLayout>
  );
}

export default StaffImages;
