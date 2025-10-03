import React, { useState } from 'react';
export function Vids() {
  const [video, setVideo] = useState({ title: 'Untitled Video', scenes: [] });
  const addScene = () => {
    setVideo({ ...video, scenes: [...video.scenes, { id: Date.now(), type: 'text', content: 'New Scene' }] });
  };
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '200px', backgroundColor: '#f3f4f6', padding: '1rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Scenes</h3>
        {video.scenes.map((scene, i) => (
          <div key={scene.id} style={{ padding: '0.5rem', backgroundColor: '#fff', marginBottom: '0.5rem', borderRadius: '0.25rem', cursor: 'pointer' }}>Scene {i + 1}</div>
        ))}
        <button onClick={addScene} style={{ width: '100%', padding: '0.5rem', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>+ Add Scene</button>
      </div>
      <div style={{ flex: 1, padding: '2rem' }}>
        <input value={video.title} onChange={(e) => setVideo({ ...video, title: e.target.value })} style={{ fontSize: '1.5rem', border: 'none', marginBottom: '2rem', width: '100%' }} />
        <div style={{ width: '100%', height: '400px', backgroundColor: '#000', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.5rem' }}>Video Preview</div>
      </div>
    </div>
  );
}
export default Vids;
