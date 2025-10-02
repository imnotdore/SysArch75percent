// CANCEL schedule by staff/admin with reason
const staffCancelSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const staffId = req.user.id; // galing JWT middleware
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: "Cancel reason is required" });
    }

    const [result] = await db.query(
      `UPDATE schedules
       SET status = 'Cancelled',
           cancel_reason = ?,
           approved_by = ?,
           approved_at = NOW(),
           updated_at = NOW()
       WHERE id = ? AND status IN ('Pending', 'Approved')`,
      [reason, staffId, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Schedule not found or cannot be cancelled" });
    }

    res.json({ id, status: "Cancelled", reason });
  } catch (err) {
    console.error("Error cancelling schedule by staff:", err);
    res.status(500).json({ error: "Failed to cancel schedule" });
  }
};
