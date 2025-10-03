import React, { useState } from 'react';
export function Forms() {
  const [form, setForm] = useState({ title: 'Untitled Form', questions: [] });
  const addQuestion = () => {
    setForm({ ...form, questions: [...form.questions, { id: Date.now(), type: 'text', question: 'New Question' }] });
  };
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ fontSize: '2rem', border: 'none', marginBottom: '2rem', width: '100%' }} />
      {form.questions.map((q, i) => (
        <div key={q.id} style={{ padding: '1rem', backgroundColor: '#fff', marginBottom: '1rem', borderRadius: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <input value={q.question} onChange={(e) => {
            const newQuestions = [...form.questions];
            newQuestions[i].question = e.target.value;
            setForm({ ...form, questions: newQuestions });
          }} style={{ width: '100%', fontSize: '1.125rem', border: 'none', marginBottom: '0.5rem' }} />
          <select value={q.type} onChange={(e) => {
            const newQuestions = [...form.questions];
            newQuestions[i].type = e.target.value;
            setForm({ ...form, questions: newQuestions });
          }} style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #d1d5db' }}>
            <option value="text">Short Answer</option>
            <option value="paragraph">Paragraph</option>
            <option value="multiple">Multiple Choice</option>
            <option value="checkbox">Checkboxes</option>
            <option value="dropdown">Dropdown</option>
          </select>
        </div>
      ))}
      <button onClick={addQuestion} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' }}>+ Add Question</button>
    </div>
  );
}
export default Forms;
