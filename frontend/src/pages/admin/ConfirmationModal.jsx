const ConfirmationModal = ({ modal, setModal, handleAction }) => {
  if (!modal.show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Confirm {modal.action}</h3>
        <p>Are you sure you want to {modal.action} <strong>{modal.user?.name || modal.user?.full_name || modal.user?.username}</strong>?</p>
        <div className="modal-buttons">
          <button className="btn-accept" onClick={handleAction}>Yes</button>
          <button className="btn-reject" onClick={() => setModal({show:false, user:null, action:"", type:""})}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;