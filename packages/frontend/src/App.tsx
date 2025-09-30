import React, { useState, useEffect } from 'react';
import Editor from './components/Editor';
import { apiFetch } from './api';

export default function App() {
  const [result, setResult] = useState('');
  // History items are { id, type, jobDescription, resume, output, createdAt }
  const [history, setHistory] = useState<Record<string, string>[]>([]);

  async function loadHistory() {
    try {
      const res = await apiFetch('/api/history');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setHistory(data);
    } catch (e: unknown) {
      console.error(e);
      setHistory([]);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="app">
      <h1>Job Assistant</h1>
      <div className="cols">
        <Editor onResult={setResult} onDone={loadHistory} />
        <div className="right">
          <section>
            <h2>Result</h2>
            <pre id="result">{result}</pre>
            <div className="actions">
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(result || '');
                }}
              >
                Copy
              </button>
              <button
                onClick={() => {
                  // PDF via jsPDF dynamically loaded
                  import('jspdf').then(({ jsPDF }) => {
                    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
                    const lines = doc.splitTextToSize(result || '', 500);
                    doc.text(lines, 40, 40);
                    doc.save('document.pdf');
                  });
                }}
              >
                PDF
              </button>
            </div>
          </section>

          <section>
            <h2>History</h2>
            <button onClick={loadHistory}>Refresh</button>
            <ul id="historyList">
              {history.map((h) => (
                <li key={h.id}>
                  #{h.id} [{h.type}] {new Date(h.createdAt).toLocaleString()}{' '}
                  <button
                    onClick={async () => {
                      const res = await apiFetch(`/api/history/${h.id}`);
                      const d = await res.json();
                      setResult(d.output || '');
                    }}
                  >
                    Load
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
