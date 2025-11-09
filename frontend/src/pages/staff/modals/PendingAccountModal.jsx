export default function PendingAccountModal({
  selectedPendingAccount,
  setSelectedPendingAccount,
  handleAccountAction
}) {
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  return (
    <div
      className="modal-overlay"
      onClick={() => setSelectedPendingAccount(null)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1000,
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "8px",
          minWidth: "300px",
          maxWidth: "500px",
          position: "relative",
        }}
      >
        <h2>ID Preview - {selectedPendingAccount.full_name}</h2>
        <img
          src={`${baseUrl}/uploads/ids/${selectedPendingAccount.id_picture}`}
          alt="Resident ID"
          style={{ width: "100%", maxHeight: "400px", objectFit: "contain" }}
        />
        <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
          <button
            className="btn-green"
            onClick={() => {
              handleAccountAction(selectedPendingAccount.id, "approved");
              setSelectedPendingAccount(null);
            }}
          >
            Approve
          </button>
          <button
            className="btn-red"
            onClick={() => {
              handleAccountAction(selectedPendingAccount.id, "rejected");
              setSelectedPendingAccount(null);
            }}
          >
            Reject
          </button>
          <button
            className="btn-gray"
            onClick={() => setSelectedPendingAccount(null)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}