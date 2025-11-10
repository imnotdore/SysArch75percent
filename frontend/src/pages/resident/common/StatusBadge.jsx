export default function StatusBadge({ status }) {
  const getStatusStyle = (status) => {
    const statusLower = status?.toLowerCase();
    
    if (statusLower === "completed" || statusLower === "approved") {
      return { color: "green", backgroundColor: "#d4edda" };
    } else if (statusLower === "pending") {
      return { color: "orange", backgroundColor: "#fff3cd" };
    } else if (statusLower === "rejected" || statusLower === "cancelled") {
      return { color: "red", backgroundColor: "#f8d7da" };
    }
    return { color: "#555", backgroundColor: "#fff" };
  };

  const style = getStatusStyle(status);

  return (
    <span style={{
      ...style,
      padding: "4px 8px",
      borderRadius: "4px",
      fontWeight: "bold",
      fontSize: "12px"
    }}>
      {status || "Pending"}
    </span>
  );
}