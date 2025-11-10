import { useState } from "react";
import FilePreviewModal from "../modals/FilePreviewModal";

export default function DisclosureFiles() {
  const [previewFile, setPreviewFile] = useState(null);

  const disclosureFiles = [
    { id: 1, name: 'Barangay Budget 2025', type: 'pdf' },
    { id: 2, name: 'Annual Project Report', type: 'doc' },
    { id: 3, name: 'Barangay Ordinances', type: 'pdf' },
    { id: 4, name: 'Community Programs', type: 'doc' },
  ];

  return (
    <div style={styles.filesGrid}>
      {disclosureFiles.map((file) => (
        <div
          key={file.id}
          style={styles.fileCard}
          onClick={() => setPreviewFile(file)}
        >
          <div style={styles.fileIcon}>📄</div>
          <div style={styles.fileName}>{file.name}</div>
          <div style={styles.fileType}>.{file.type}</div>
        </div>
      ))}

      <FilePreviewModal 
        file={previewFile} 
        onClose={() => setPreviewFile(null)} 
      />
    </div>
  );
}

const styles = {
  filesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '15px',
  },
  fileCard: {
    backgroundColor: '#f2f2f2',
    padding: '20px',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    textAlign: 'center',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  fileIcon: {
    fontSize: '40px',
    marginBottom: '10px',
  },
  fileName: {
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  fileType: {
    fontSize: '12px',
    color: '#666',
  },
};