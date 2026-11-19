import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from './api';

const STATUSES = ['Want to Play', 'Playing', 'Completed', 'Dropped'];

const EntryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [error, setError] = useState('');

  const [noteText, setNoteText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewShared, setReviewShared] = useState(false);
  const [challengeDesc, setChallengeDesc] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getEntry(id);
        setEntry(data);
        if (data.review) {
          setReviewRating(data.review.rating);
          setReviewText(data.review.text || '');
          setReviewShared(data.review.shared);
        }
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, [id]);

  const changeStatus = async (newStatus) => {
    try {
      const updated = await api.updateStatus(id, newStatus);
      setEntry({ ...entry, status: updated.status });
    } catch (err) {
      alert(err.message);
    }
  };

  const addNote = async (event) => {
    event.preventDefault();
    if (!noteText.trim()) return;
    try {
      const note = await api.addNote(id, noteText);
      setEntry({ ...entry, notes: [...entry.notes, note] });
      setNoteText('');
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteNote = async (noteId) => {
    if (!confirm('Delete this note?')) return;
    try {
      await api.deleteNote(id, noteId);
      setEntry({ ...entry, notes: entry.notes.filter((n) => n.id !== noteId) });
    } catch (err) {
      alert(err.message);
    }
  };

  const saveReview = async (event) => {
    event.preventDefault();
    try {
      const review = await api.saveReview(id, { rating: reviewRating, text: reviewText, shared: reviewShared });
      setEntry({ ...entry, review });
    } catch (err) {
      alert(err.message);
    }
  };

  const addChallenge = async (event) => {
    event.preventDefault();
    if (!challengeDesc.trim()) return;
    try {
      const challenge = await api.addChallenge(id, challengeDesc);
      setEntry({ ...entry, challenges: [...entry.challenges, challenge] });
      setChallengeDesc('');
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleChallenge = async (challengeId) => {
    try {
      const updated = await api.toggleChallenge(id, challengeId);
      setEntry({
        ...entry,
        challenges: entry.challenges.map((c) => (c.id === challengeId ? { ...c, done: updated.done } : c)),
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteChallenge = async (challengeId) => {
    if (!confirm('Delete this challenge?')) return;
    try {
      await api.deleteChallenge(id, challengeId);
      setEntry({ ...entry, challenges: entry.challenges.filter((c) => c.id !== challengeId) });
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteEntry = async () => {
    if (!confirm('Remove this game from your journal?')) return;
    try {
      await api.deleteEntry(id);
      navigate('/dashboard');
    } catch (err) {
      alert(err.message);
    }
  };

  if (error) return <p style={{ padding: '24px', color: '#ef4444' }}>{error}</p>;
  if (!entry) return <p style={{ padding: '24px', color: '#666' }}>Loading...</p>;

  const sectionStyle = { padding: '20px 0', borderTop: '1px solid #222' };
  const h2Style = { color: '#aaa', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' };

  return (
    <div style={{ padding: '24px', maxWidth: '720px', margin: '0 auto' }}>
      <Link to="/dashboard" style={{ color: '#aaa', fontSize: '0.9rem', textDecoration: 'none' }}>← Back</Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '16px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#f2f2f2' }}>{entry.title}</h1>
          {(entry.platform || entry.release_year) && (
            <p style={{ color: '#888', margin: '4px 0 0' }}>
              {[entry.platform, entry.release_year].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        <button onClick={deleteEntry} style={{ background: 'transparent', border: '1px solid #333', color: '#666', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
          Remove
        </button>
      </div>

      <section style={sectionStyle}>
        <h2 style={h2Style}>Status</h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => changeStatus(s)}
              style={{
                padding: '6px 14px',
                border: '1px solid #333',
                borderRadius: '4px',
                background: entry.status === s ? '#c8102e' : 'transparent',
                color: entry.status === s ? '#fff' : '#aaa',
                cursor: 'pointer',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>Notes</h2>
        <form onSubmit={addNote} style={{ marginBottom: '16px' }}>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Write a note..."
            maxLength={5000}
            rows={3}
            style={{ width: '100%', background: '#1a1a1a', color: '#f2f2f2', border: '1px solid #333', borderRadius: '4px', padding: '8px', fontFamily: 'inherit' }}
          />
          <button type="submit" style={{ marginTop: '8px', background: '#c8102e', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer' }}>
            Add note
          </button>
        </form>
        {entry.notes.length === 0 && <p style={{ color: '#666' }}>No notes yet.</p>}
        {entry.notes.map((note) => (
          <div key={note.id} style={{ background: '#1a1a1a', padding: '12px', borderRadius: '6px', marginBottom: '8px' }}>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{note.text}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <span style={{ color: '#555', fontSize: '0.75rem' }}>{new Date(note.date_written).toLocaleDateString()}</span>
              <button onClick={() => deleteNote(note.id)} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.85rem' }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>Challenges</h2>
        <form onSubmit={addChallenge} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <input
            type="text"
            value={challengeDesc}
            onChange={(e) => setChallengeDesc(e.target.value)}
            placeholder="e.g. Finish with no deaths"
            style={{ flex: 1, background: '#1a1a1a', color: '#f2f2f2', border: '1px solid #333', borderRadius: '4px', padding: '8px' }}
          />
          <button type="submit" style={{ background: '#c8102e', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer' }}>
            Add
          </button>
        </form>
        {entry.challenges.length === 0 && <p style={{ color: '#666' }}>No challenges yet.</p>}
        {entry.challenges.map((c) => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#1a1a1a', padding: '10px 12px', borderRadius: '6px', marginBottom: '6px' }}>
            <button onClick={() => toggleChallenge(c.id)} style={{ background: c.done ? '#22c55e' : 'transparent', color: c.done ? '#fff' : '#aaa', border: '1px solid #444', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}>
              {c.done ? '✓' : ''}
            </button>
            <span style={{ flex: 1, textDecoration: c.done ? 'line-through' : 'none', color: c.done ? '#666' : '#f2f2f2' }}>{c.description}</span>
            <button onClick={() => deleteChallenge(c.id)} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer' }}>×</button>
          </div>
        ))}
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>Review</h2>
        {entry.status !== 'Completed' ? (
          <p style={{ color: '#666' }}>Mark the game Completed to write a review.</p>
        ) : (
          <form onSubmit={saveReview}>
            <label style={{ color: '#aaa', fontSize: '0.85rem' }}>Rating</label>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setReviewRating(r)}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #333',
                    borderRadius: '4px',
                    background: reviewRating === r ? '#f59e0b' : 'transparent',
                    color: reviewRating === r ? '#000' : '#aaa',
                    cursor: 'pointer',
                  }}
                >
                  {r}★
                </button>
              ))}
            </div>
            <label style={{ color: '#aaa', fontSize: '0.85rem' }}>Review text</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              style={{ width: '100%', background: '#1a1a1a', color: '#f2f2f2', border: '1px solid #333', borderRadius: '4px', padding: '8px', fontFamily: 'inherit', marginBottom: '8px' }}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa', fontSize: '0.9rem', marginBottom: '12px' }}>
              <input type="checkbox" checked={reviewShared} onChange={(e) => setReviewShared(e.target.checked)} />
              Make public
            </label>
            <button type="submit" style={{ background: '#c8102e', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
              Save review
            </button>
          </form>
        )}
      </section>
    </div>
  );
};

export default EntryDetail;
