import React, { useState } from 'react';
export function Sites() {
  const [site, setSite] = useState({ title: 'My Site', pages: [{ id: 1, title: 'Home', content: 'Welcome to my site' }] });
  const [currentPage, setCurrentPage] = useState(0);
  const addPage = () => {
    setSite({ ...site, pages: [...site.pages, { id: Date.now(), title: 'New Page', content: '' }] });
  };
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '200px', backgroundColor: '#f3f4f6', padding: '1rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Pages</h3>
        {site.pages.map((page, i) => (
          <div key={page.id} onClick={() => setCurrentPage(i)} style={{ padding: '0.5rem', backgroundColor: currentPage === i ? '#3b82f6' : '#fff', color: currentPage === i ? '#fff' : '#000', marginBottom: '0.5rem', borderRadius: '0.25rem', cursor: 'pointer' }}>{page.title}</div>
        ))}
        <button onClick={addPage} style={{ width: '100%', padding: '0.5rem', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>+ Add Page</button>
      </div>
      <div style={{ flex: 1, padding: '2rem' }}>
        <input value={site.pages[currentPage]?.title} onChange={(e) => {
          const newPages = [...site.pages];
          newPages[currentPage].title = e.target.value;
          setSite({ ...site, pages: newPages });
        }} style={{ fontSize: '1.5rem', border: 'none', marginBottom: '1rem', width: '100%' }} />
        <textarea value={site.pages[currentPage]?.content} onChange={(e) => {
          const newPages = [...site.pages];
          newPages[currentPage].content = e.target.value;
          setSite({ ...site, pages: newPages });
        }} style={{ width: '100%', height: '400px', padding: '1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '1rem' }} placeholder="Page content..." />
      </div>
    </div>
  );
}
export default Sites;
