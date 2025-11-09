export default function AccountsTab({
  pendingAccounts,
  setSelectedPendingAccount,
  handleAccountAction
}) {
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  return (
    <section className="accounts-list">
      <h2>Pending Resident Accounts</h2>
      
      {pendingAccounts.length === 0 ? (
        <p>No pending accounts waiting for approval.</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Username</th>
                <th>Address</th>
                <th>Age</th>
                <th>Gender</th>
                <th>ID Preview</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingAccounts.map((resident) => (
                <tr key={resident.id}>
                  <td className="resident-name">{resident.full_name}</td>
                  <td>{resident.username}</td>
                  <td>{resident.address}</td>
                  <td>{resident.age}</td>
                  <td>{resident.gender}</td>
                  <td>
                    {resident.id_picture ? (
                      <img
                        src={`${baseUrl}/uploads/ids/${resident.id_picture}`}
                        alt={`${resident.full_name}'s ID`}
                        className="id-preview"
                        onClick={() => setSelectedPendingAccount(resident)}
                      />
                    ) : (
                      <span className="no-id">No ID</span>
                    )}
                  </td>
                  <td className="action-buttons">
                    <button
                      className="btn-green"
                      onClick={() => handleAccountAction(resident.id, "approved")}
                      title="Approve this account"
                    >
                      Approve
                    </button>
                    <button
                      className="btn-red"
                      onClick={() => handleAccountAction(resident.id, "rejected")}
                      title="Reject this account"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}