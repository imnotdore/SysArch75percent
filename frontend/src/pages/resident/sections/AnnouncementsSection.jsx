export default function AnnouncementsSection() {
  const announcements = [
    {
      id: 1,
      title: 'Barangay Basketball League',
      content: 'The Barangay Basketball Tournament will start on August 25 at the covered court.',
    },
    {
      id: 2,
      title: 'Free Vaccination Program',
      content: 'Residents may avail free flu vaccines at the Barangay Health Center on September 3.',
    },
    {
      id: 3,
      title: 'Matchmaking',
      content: 'Barangay Uno Vs Barangay Dos. arrive at court 30mins before the game or will be default',
    },
  ];

  return (
    <section style={styles.section}>
      <h2>ANNOUNCEMENTS</h2>
      {announcements.map((announcement) => (
        <div key={announcement.id} style={styles.announcement}>
          <h3 style={styles.title}>{announcement.title}</h3>
          <p style={styles.content}>{announcement.content}</p>
        </div>
      ))}
    </section>
  );
}

const styles = {
  section: {
    backgroundColor: 'rgba(0, 255, 0, 0.31)',
    borderRadius: '10px',
    padding: '20px',
    maxHeight: '200px',
    overflowY: 'auto',
    boxShadow: '0 0 5px #999',
  },
  announcement: {
    marginBottom: '10px',
  },
  title: {
    margin: '0 0 5px 0',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  content: {
    margin: 0,
    fontSize: '14px',
  },
};