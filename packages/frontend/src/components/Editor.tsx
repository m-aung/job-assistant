import React, { useState } from 'react';

export default function Editor({
  onResult,
  onDone,
}: {
  onResult: (s: string) => void;
  onDone?: () => void;
}) {
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);

  async function callApi(path: string) {
    setLoading(true);
    try {
      const res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume, jobDescription }),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      onResult(data.coverLetter || data.rewrittenResume || JSON.stringify(data, null, 2));
      onDone?.();
    } catch (err) {
      onResult('Error: ' + String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="editor">
      <div>
        <label>Job Description</label>
        <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
      </div>
      <div>
        <label>Resume</label>
        <textarea value={resume} onChange={(e) => setResume(e.target.value)} />
      </div>
      <div className="editor-actions">
        <button disabled={loading} onClick={() => callApi('/api/cover-letter')}>
          {loading ? 'Working...' : 'Cover Letter'}
        </button>
        <button disabled={loading} onClick={() => callApi('/api/resume')}>
          {loading ? 'Working...' : 'Rewrite Resume'}
        </button>
      </div>
    </div>
  );
}
