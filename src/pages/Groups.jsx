import React, { useState } from 'react';
export function Groups() {
  const [groups, setGroups] = useState([{ id: 1, name: 'Study Group', members: 5, discussions: 3 }]);
  const [selectedGroup, setSelectedGroup] = useState(0);
  const addGroup = () => {
    setGroups([...groups, { id: Date.now(), name: 'New Group', members: 1, discussions: 0 }]);
  };
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '250px', backgroundColor: '#f3f4f6', padding: '1rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>My Groups</h2>
        {groups.map((group, i) => (
          <div key={group.id} onClick={() => setSelectedGroup(i)} style={{ padding: '1rem', backgroundColor: selectedGroup === i ? '#3b82f6' : '#fff', color: selectedGroup === i ? '#fff' : '#000', marginBottom: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer' }}>
            <div style={{ fontWeight: '600' }}>{group.name}</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>{group.members} members</div>
          </div>
        ))}
        <button onClick={addGroup} style={{ width: '100%', padding: '0.75rem', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' }}>+ Create Group</button>
      </div>
      <div style={{ flex: 1, padding: '2rem' }}>
        <h1 style={{ marginBottom: '1rem' }}>{groups[selectedGroup]?.name}</h1>
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
          <div><strong>{groups[selectedGroup]?.members}</strong> Members</div>
          <div><strong>{groups[selectedGroup]?.discussions}</strong> Discussions</div>
        </div>
        <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Recent Discussions</h3>
          <p style={{ color: '#6b7280' }}>No discussions yet. Start a conversation!</p>
        </div>
      </div>
    </div>
  );
}
export default Groups;
