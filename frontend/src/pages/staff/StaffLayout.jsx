import { Link, Outlet, useLocation } from "react-router-dom";

function StaffLayout() {
  const location = useLocation();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-gray-700">
          Staff Panel
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/staff/dashboard"
            className={`block p-2 rounded ${
              location.pathname === "/staff/dashboard"
                ? "bg-gray-700"
                : "hover:bg-gray-800"
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/staff/requests"
            className={`block p-2 rounded ${
              location.pathname === "/staff/requests"
                ? "bg-gray-700"
                : "hover:bg-gray-800"
            }`}
          >
            Requests
          </Link>
          <Link
            to="/staff/announcements"
            className={`block p-2 rounded ${
              location.pathname === "/staff/announcements"
                ? "bg-gray-700"
                : "hover:bg-gray-800"
            }`}
          >
            Announcements
          </Link>
          <Link
            to="/staff/images"
            className={`block p-2 rounded ${
              location.pathname === "/staff/images"
                ? "bg-gray-700"
                : "hover:bg-gray-800"
            }`}
          >
            Images
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100">
        <header className="p-4 bg-white shadow flex justify-between items-center">
          <h1 className="text-lg font-semibold">Staff Dashboard</h1>
          <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
            Logout
          </button>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default StaffLayout;
