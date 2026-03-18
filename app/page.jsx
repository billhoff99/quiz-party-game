'use client';

import React, { useState, useEffect } from 'react';
import { Users, Play, LogIn, Trophy, FileText, Send, CheckCircle, Clock } from 'lucide-react';

// ─── Storage helpers — now use the shared API instead of localStorage ──────────
const storageGet = async (key) => {
  try {
    const res = await fetch(`/api/store?key=${encodeURIComponent(key)}`);
    const data = await res.json();
    return data.value ?? null;
  } catch (err) {
    console.error('storageGet error:', key, err);
    return null;
  }
};

const storageSet = async (key, value) => {
  try {
    const res = await fetch('/api/store', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
    return res.ok;
  } catch (err) {
    console.error('storageSet error:', key, err);
    return false;
  }
};

// ─── Fix: useState inside .map() is illegal — extract to its own component ────
function Round2AnswerItem({ question, idx, gameId, participantId, answers, setAnswers }) {
  const [assignedName, setAssignedName] = useState('Loading…');

  useEffect(() => {
    (async () => {
      const assignments = await storageGet(`round2assignments:${gameId}`);
      if (!assignments?.[participantId]) return;
      const assignment = assignments[participantId].find(a => a.questionIndex === idx);
      if (!assignment) return;
      const participant = await storageGet(`participant:${gameId}:${assignment.assignedParticipantId}`);
      setAssignedName(participant?.name ?? '?');
    })();
  }, [idx, gameId, participantId]);

  return (
    <div className="answer-item">
      <div className="question">{question}</div>
      <div className="assigned-name">About: {assignedName}</div>
      <textarea
        placeholder="Your answer…"
        value={answers[idx] || ''}
        onChange={(e) => {
          const next = [...answers];
          next[idx] = e.target.value;
          setAnswers(next);
        }}
      />
    </div>
  );
}

// ─── Results ──────────────────────────────────────────────────────────────────
function ResultsView({ gameId }) {
  const [resultsData, setResultsData] = useState(null);

  useEffect(() => {
    (async () => {
      const game = await storageGet(`game:${gameId}`);
      const assignments = await storageGet(`round2assignments:${gameId}`);
      const results = [];

      for (const pid of game.participants) {
        const participant = await storageGet(`participant:${gameId}:${pid}`);
        const round1 = await storageGet(`round1:${gameId}:${pid}`);
        const round2 = await storageGet(`round2:${gameId}:${pid}`);

        const playerResult = {
          name: participant.name,
          round1Answers: round1?.answers || [],
          round2Answers: [],
        };

        if (round2 && assignments?.[pid]) {
          for (let i = 0; i < round2.answers.length; i++) {
            const assignment = assignments[pid][i];
            const about = await storageGet(`participant:${gameId}:${assignment.assignedParticipantId}`);
            playerResult.round2Answers.push({
              answer: round2.answers[i],
              aboutPerson: about?.name ?? '?',
            });
          }
        }

        results.push(playerResult);
      }

      setResultsData({ game, results });
    })();
  }, [gameId]);

  if (!resultsData) return <div className="loading">Loading results…</div>;

  return (
    <div className="results-container">
      <div className="results-header">
        <Trophy size={48} />
        <h1>Game Results</h1>
        <p>Game Code: <strong>{gameId}</strong></p>
      </div>

      {resultsData.results.map((player, idx) => (
        <div key={idx} className="player-results">
          <h2>{player.name}'s Answers</h2>

          <div className="round-section">
            <h3>Round 1: About Themselves</h3>
            {resultsData.game.questions.map((q, qIdx) => (
              <div key={qIdx} className="result-item">
                <div className="question">{q}</div>
                <div className="answer">{player.round1Answers[qIdx]}</div>
              </div>
            ))}
          </div>

          <div className="round-section">
            <h3>Round 2: About Others</h3>
            {resultsData.game.questions.map((q, qIdx) => (
              <div key={qIdx} className="result-item">
                <div className="question">
                  {q}{' '}
                  <span className="about">(about {player.round2Answers[qIdx]?.aboutPerson})</span>
                </div>
                <div className="answer">{player.round2Answers[qIdx]?.answer}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button onClick={() => window.print()} className="print-btn">
        <FileText size={20} />
        Print Results
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function QuizPartyGame() {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState('home');
  const [gameId, setGameId] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [participantId, setParticipantId] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [questions, setQuestions] = useState(['', '', '']);
  const [answers, setAnswers] = useState([]);
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Load full game snapshot (game record + participant list)
  const loadGameData = async (gId) => {
    const game = await storageGet(`game:${gId}`);
    if (!game) return;

    const participants = await Promise.all(
      game.participants.map(id => storageGet(`participant:${gId}:${id}`))
    );
    setGameData({ ...game, participantList: participants.filter(Boolean) });
  };

  // ── Host creates game ──────────────────────────────────────────────────────
  const createGame = async () => {
    if (!participantName.trim()) { setError('Please enter your name'); return; }
    const validQuestions = questions.filter(q => q.trim());
    if (!validQuestions.length) { setError('Please add at least one question'); return; }

    setLoading(true);
    const newGameId = generateId();
    const hostId = generateId();

    const game = {
      gameId: newGameId,
      hostId,
      hostName: participantName,
      questions: validQuestions,
      status: 'waiting',
      participants: [hostId],
      createdAt: new Date().toISOString(),
    };

    const participant = {
      participantId: hostId,
      name: participantName,
      isHost: true,
      joinedAt: new Date().toISOString(),
    };

    const ok = await storageSet(`game:${newGameId}`, game);
    if (ok) {
      await storageSet(`participant:${newGameId}:${hostId}`, participant);
      setGameId(newGameId);
      setParticipantId(hostId);
      setIsHost(true);
      setError('');
      await loadGameData(newGameId);
      setView('hostWaiting');
    }
    setLoading(false);
  };

  // ── Player joins game ──────────────────────────────────────────────────────
  const joinGame = async () => {
    if (!gameId.trim() || !participantName.trim()) {
      setError('Please enter game code and your name');
      return;
    }

    setLoading(true);
    const game = await storageGet(`game:${gameId}`);

    if (!game) { setError('Game not found. Check your game code.'); setLoading(false); return; }
    if (game.status !== 'waiting') { setError('This game has already started or ended.'); setLoading(false); return; }

    const playerId = generateId();
    const participant = {
      participantId: playerId,
      name: participantName,
      isHost: false,
      joinedAt: new Date().toISOString(),
    };

    game.participants.push(playerId);
    const ok = await storageSet(`game:${gameId}`, game);
    if (ok) {
      await storageSet(`participant:${gameId}:${playerId}`, participant);
      setParticipantId(playerId);
      setIsHost(false);
      setError('');
      await loadGameData(gameId);
      setView('playerWaiting');
    }
    setLoading(false);
  };

  // ── Start Round 1 (host only) ──────────────────────────────────────────────
  const startRound1 = async () => {
    setLoading(true);
    const game = await storageGet(`game:${gameId}`);
    game.status = 'round1';
    await storageSet(`game:${gameId}`, game);
    await loadGameData(gameId);
    setView('playerRound1'); // host also answers questions about themselves
    setLoading(false);
  };

  // ── Submit Round 1 ─────────────────────────────────────────────────────────
  const submitRound1 = async (currentParticipantId) => {
    if (!gameData || answers.length < gameData.questions.length) {
      setError('Please answer all questions');
      return;
    }
    setLoading(true);
    await storageSet(`round1:${gameId}:${currentParticipantId}`, {
      participantId: currentParticipantId,
      answers,
      submittedAt: new Date().toISOString(),
    });
    setAnswers([]);
    // Both host and players wait here; polling will advance the host to hostRound2
    setView('playerWaiting');
    setLoading(false);
  };

  // ── Check completion helpers ───────────────────────────────────────────────
  const checkRound1Complete = async () => {
    const game = await storageGet(`game:${gameId}`);
    if (!game) return false;
    const checks = await Promise.all(game.participants.map(pid => storageGet(`round1:${gameId}:${pid}`)));
    return checks.every(c => c !== null);
  };

  const checkRound2Complete = async () => {
    const game = await storageGet(`game:${gameId}`);
    if (!game) return false;
    const checks = await Promise.all(game.participants.map(pid => storageGet(`round2:${gameId}:${pid}`)));
    return checks.every(c => c !== null);
  };

  // ── Start Round 2 (host only) ──────────────────────────────────────────────
  const startRound2 = async () => {
    setLoading(true);
    const game = await storageGet(`game:${gameId}`);
    const participants = game.participants;

    const assignments = {};
    for (const pid of participants) {
      const others = participants.filter(p => p !== pid);
      assignments[pid] = game.questions.map((_, qIdx) => ({
        questionIndex: qIdx,
        assignedParticipantId: others[Math.floor(Math.random() * others.length)],
      }));
    }

    await storageSet(`round2assignments:${gameId}`, assignments);
    game.status = 'round2';
    await storageSet(`game:${gameId}`, game);
    await loadGameData(gameId);
    setView('playerRound2'); // host also answers round 2
    setLoading(false);
  };

  // ── Submit Round 2 ─────────────────────────────────────────────────────────
  const submitRound2 = async (currentParticipantId) => {
    if (!gameData || answers.length < gameData.questions.length) {
      setError('Please answer all questions');
      return;
    }
    setLoading(true);
    await storageSet(`round2:${gameId}:${currentParticipantId}`, {
      participantId: currentParticipantId,
      answers,
      submittedAt: new Date().toISOString(),
    });
    setAnswers([]);
    setView('playerWaiting');
    setLoading(false);
  };

  // ── View final results ─────────────────────────────────────────────────────
  const viewResults = async () => {
    setLoading(true);
    const game = await storageGet(`game:${gameId}`);
    game.status = 'completed';
    await storageSet(`game:${gameId}`, game);
    setView('hostResults');
    setLoading(false);
  };

  // ── Polling ────────────────────────────────────────────────────────────────
  // Fix: host ends up in 'playerWaiting' after submitting answers, so we check
  // round completion there — NOT only in 'hostWaiting'.
  useEffect(() => {
    if (!['playerWaiting', 'hostWaiting'].includes(view) || !gameId) return;

    const tick = async () => {
      await loadGameData(gameId);
      const game = await storageGet(`game:${gameId}`);
      if (!game) return;

      if (view === 'hostWaiting') {
        // Still in lobby — only transition once host clicks Start Round 1
        return;
      }

      // view === 'playerWaiting'
      if (isHost) {
        // Host is waiting after submitting their own answers — check if everyone is done
        if (game.status === 'round1') {
          const done = await checkRound1Complete();
          if (done) setView('hostRound2');
        } else if (game.status === 'round2') {
          const done = await checkRound2Complete();
          if (done) await viewResults();
        }
      } else {
        // Regular player waiting for host to advance the game
        if (game.status === 'round1') setView('playerRound1');
        else if (game.status === 'round2') setView('playerRound2');
        else if (game.status === 'completed') {
          // nothing to do — host shows results on their screen
        }
      }
    };

    const interval = setInterval(tick, 2000);
    return () => clearInterval(interval);
  }, [view, gameId, isHost]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Space+Mono:wght@400;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Fredoka', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          min-height: 100vh;
          overflow-x: hidden;
        }
        .app { min-height: 100vh; padding: 2rem; display: flex; justify-content: center; align-items: center; }
        .container {
          background: white; border-radius: 24px; padding: 3rem;
          max-width: 600px; width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          animation: slideUp 0.6s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes slideUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        .header { text-align: center; margin-bottom: 2rem; }
        .logo {
          display: inline-flex; align-items: center; justify-content: center;
          width: 80px; height: 80px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 50%; margin-bottom: 1rem;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.05); } }
        h1 { font-size: 2.5rem; color: #2d3748; font-weight: 700; margin-bottom: 0.5rem; }
        .subtitle { color: #718096; font-size: 1.1rem; }
        .game-code {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white; padding: 1rem 2rem; border-radius: 12px;
          text-align: center; margin-bottom: 2rem;
          font-family: 'Space Mono', monospace;
        }
        .game-code strong { font-size: 2rem; display: block; margin-top: 0.5rem; letter-spacing: 0.2em; }
        .input-group { margin-bottom: 1.5rem; }
        label { display: block; margin-bottom: 0.5rem; color: #4a5568; font-weight: 600; }
        input, textarea {
          width: 100%; padding: 0.875rem;
          border: 2px solid #e2e8f0; border-radius: 12px;
          font-size: 1rem; font-family: 'Fredoka', sans-serif; transition: all 0.3s;
        }
        input:focus, textarea:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,0.1); }
        textarea { min-height: 100px; resize: vertical; }
        .questions-list { margin-bottom: 1.5rem; }
        .question-item { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
        .question-item input { flex: 1; }
        button {
          width: 100%; padding: 1rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white; border: none; border-radius: 12px;
          font-size: 1.1rem; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          transition: all 0.3s; font-family: 'Fredoka', sans-serif;
        }
        button:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(102,126,234,0.4); }
        button:active { transform: translateY(0); }
        button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .btn-secondary { background: linear-gradient(135deg, #f093fb, #f5576c); margin-top: 1rem; }
        .btn-success   { background: linear-gradient(135deg, #4facfe, #00f2fe); margin-top: 1rem; }
        .add-question-btn { background: #e2e8f0; color: #4a5568; margin-top: 0.5rem; }
        .add-question-btn:hover { background: #cbd5e0; box-shadow: none; transform: none; }
        .error { background: #fed7d7; color: #c53030; padding: 1rem; border-radius: 12px; margin-bottom: 1rem; text-align: center; }
        .participants-list { background: #f7fafc; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; }
        .participants-list h3 { color: #2d3748; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .participant-item {
          background: white; padding: 0.875rem; border-radius: 8px;
          margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;
        }
        .participant-item.host { background: linear-gradient(135deg,#667eea15,#764ba215); font-weight: 600; }
        .status-badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.5rem 1rem; background: #f7fafc; border-radius: 8px;
          font-size: 0.9rem; margin-bottom: 1.5rem;
        }
        .waiting-animation { text-align: center; padding: 2rem; }
        .waiting-animation svg { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        .results-container {
          background: white; border-radius: 24px; padding: 3rem;
          max-width: 900px; width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .results-header { text-align: center; margin-bottom: 3rem; padding-bottom: 2rem; border-bottom: 3px solid #e2e8f0; }
        .results-header svg { color: #f5a623; margin-bottom: 1rem; }
        .player-results { margin-bottom: 3rem; padding: 2rem; background: #f7fafc; border-radius: 16px; }
        .player-results h2 { color: #667eea; margin-bottom: 1.5rem; }
        .round-section { margin-bottom: 2rem; }
        .round-section h3 { color: #4a5568; margin-bottom: 1rem; font-size: 1.2rem; }
        .result-item { background: white; padding: 1.25rem; border-radius: 12px; margin-bottom: 1rem; }
        .question { font-weight: 600; color: #2d3748; margin-bottom: 0.5rem; }
        .about { color: #667eea; font-size: 0.9rem; }
        .answer { color: #4a5568; padding-left: 1rem; border-left: 3px solid #667eea; }
        .print-btn { background: linear-gradient(135deg,#4a5568,#2d3748); margin-top: 2rem; }
        .loading { text-align: center; padding: 2rem; color: #718096; }
        .answer-form { margin-bottom: 1.5rem; }
        .answer-item { background: #f7fafc; padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem; }
        .answer-item .question { font-weight: 600; color: #2d3748; margin-bottom: 0.75rem; }
        .assigned-name { color: #667eea; font-size: 0.9rem; margin-bottom: 0.5rem; }
        @media print { body { background: white; } .app { padding: 0; } button { display: none; } }
        @media (max-width: 640px) {
          .app { padding: 1rem; }
          .container, .results-container { padding: 1.5rem; }
          h1 { font-size: 2rem; }
        }
      `}</style>

      {/* ── Home ── */}
      {view === 'home' && (
        <div className="container">
          <div className="header">
            <div className="logo"><Trophy size={40} color="white" /></div>
            <h1>Quiz Party</h1>
            <p className="subtitle">The ultimate party quiz game</p>
          </div>
          <button onClick={() => setView('hostLogin')}><Users size={20} />Create Game (Host)</button>
          <button onClick={() => setView('playerLogin')} className="btn-secondary"><LogIn size={20} />Join Game (Player)</button>
        </div>
      )}

      {/* ── Host Login ── */}
      {view === 'hostLogin' && (
        <div className="container">
          <div className="header"><h1>Create Your Game</h1><p className="subtitle">Set up questions for your party</p></div>
          {error && <div className="error">{error}</div>}
          <div className="input-group">
            <label>Your Name (Host)</label>
            <input type="text" placeholder="Enter your name" value={participantName} onChange={e => setParticipantName(e.target.value)} />
          </div>
          <div className="questions-list">
            <label>Create Questions</label>
            {questions.map((q, idx) => (
              <div key={idx} className="question-item">
                <input
                  type="text"
                  placeholder={`Question ${idx + 1}`}
                  value={q}
                  onChange={e => { const nq = [...questions]; nq[idx] = e.target.value; setQuestions(nq); }}
                />
              </div>
            ))}
            <button onClick={() => setQuestions([...questions, ''])} className="add-question-btn">+ Add Question</button>
          </div>
          <button onClick={createGame} disabled={loading}>{loading ? 'Creating…' : 'Create Game'}</button>
          <button onClick={() => { setView('home'); setError(''); }} className="btn-secondary">Back</button>
        </div>
      )}

      {/* ── Player Login ── */}
      {view === 'playerLogin' && (
        <div className="container">
          <div className="header"><h1>Join a Game</h1><p className="subtitle">Enter the game code from your host</p></div>
          {error && <div className="error">{error}</div>}
          <div className="input-group">
            <label>Game Code</label>
            <input
              type="text"
              placeholder="Enter game code"
              value={gameId}
              onChange={e => setGameId(e.target.value.toLowerCase())}
              style={{ fontFamily: 'Space Mono, monospace', letterSpacing: '0.1em' }}
            />
          </div>
          <div className="input-group">
            <label>Your Name</label>
            <input type="text" placeholder="Enter your name" value={participantName} onChange={e => setParticipantName(e.target.value)} />
          </div>
          <button onClick={joinGame} disabled={loading}>{loading ? 'Joining…' : 'Join Game'}</button>
          <button onClick={() => { setView('home'); setError(''); }} className="btn-secondary">Back</button>
        </div>
      )}

      {/* ── Host Waiting Lobby ── */}
      {view === 'hostWaiting' && gameData && (
        <div className="container">
          <div className="header"><h1>Game Lobby</h1><p className="subtitle">Waiting for players to join</p></div>
          <div className="game-code">
            <div>Share this code with players:</div>
            <strong>{gameId}</strong>
          </div>
          <div className="participants-list">
            <h3><Users size={20} />Players ({gameData.participantList?.length || 0})</h3>
            {gameData.participantList?.map((p, idx) => (
              <div key={idx} className={`participant-item ${p.isHost ? 'host' : ''}`}>
                {p.isHost ? '👑' : '👤'} {p.name}
              </div>
            ))}
          </div>
          <button onClick={startRound1} disabled={!gameData.participantList || gameData.participantList.length < 2}>
            <Play size={20} />Start Round 1
          </button>
          {gameData.participantList && gameData.participantList.length < 2 && (
            <p style={{ textAlign: 'center', color: '#718096', marginTop: '1rem' }}>Need at least 2 players to start</p>
          )}
        </div>
      )}

      {/* ── Player Waiting ── */}
      {view === 'playerWaiting' && gameData && (
        <div className="container">
          <div className="header">
            <h1>Game Lobby</h1>
            <p className="subtitle">
              {gameData.status === 'waiting'   && 'Waiting for host to start…'}
              {gameData.status === 'round1'    && 'Waiting for other players to finish Round 1…'}
              {gameData.status === 'round2'    && 'Waiting for other players to finish Round 2…'}
              {gameData.status === 'completed' && 'Game complete! Check the host screen for results.'}
            </p>
          </div>
          <div className="waiting-animation">
            <Clock size={48} color="#667eea" />
            <p style={{ marginTop: '1rem', color: '#718096' }}>
              {gameData.status === 'waiting'   && 'The host will start when everyone is ready'}
              {gameData.status === 'round1'    && '⏳ Round 1 in progress…'}
              {gameData.status === 'round2'    && '⏳ Round 2 in progress…'}
              {gameData.status === 'completed' && '✅ All rounds complete!'}
            </p>
          </div>
          <div className="participants-list">
            <h3><Users size={20} />Players ({gameData.participantList?.length || 0})</h3>
            {gameData.participantList?.map((p, idx) => (
              <div key={idx} className={`participant-item ${p.isHost ? 'host' : ''}`}>
                {p.isHost ? '👑' : '👤'} {p.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Player Round 1 ── */}
      {view === 'playerRound1' && gameData && (
        <div className="container">
          <div className="header"><h1>Round 1</h1><p className="subtitle">Answer questions about yourself</p></div>
          <div className="status-badge"><FileText size={16} />{gameData.questions.length} question{gameData.questions.length !== 1 ? 's' : ''}</div>
          {error && <div className="error">{error}</div>}
          <div className="answer-form">
            {gameData.questions.map((q, idx) => (
              <div key={idx} className="answer-item">
                <div className="question">{q}</div>
                <textarea
                  placeholder="Your answer…"
                  value={answers[idx] || ''}
                  onChange={e => { const na = [...answers]; na[idx] = e.target.value; setAnswers(na); }}
                />
              </div>
            ))}
          </div>
          <button onClick={() => submitRound1(participantId)} disabled={loading}>
            <Send size={20} />{loading ? 'Submitting…' : 'Submit Answers'}
          </button>
        </div>
      )}

      {/* ── Player Round 2 ── */}
      {view === 'playerRound2' && gameData && (
        <div className="container">
          <div className="header"><h1>Round 2</h1><p className="subtitle">Answer questions about others</p></div>
          <div className="status-badge"><FileText size={16} />{gameData.questions.length} question{gameData.questions.length !== 1 ? 's' : ''}</div>
          {error && <div className="error">{error}</div>}
          <div className="answer-form">
            {gameData.questions.map((q, idx) => (
              <Round2AnswerItem
                key={idx}
                question={q}
                idx={idx}
                gameId={gameId}
                participantId={participantId}
                answers={answers}
                setAnswers={setAnswers}
              />
            ))}
          </div>
          <button onClick={() => submitRound2(participantId)} disabled={loading}>
            <Send size={20} />{loading ? 'Submitting…' : 'Submit Answers'}
          </button>
        </div>
      )}

      {/* ── Host Round 2 Ready ── */}
      {view === 'hostRound2' && gameData && (
        <div className="container">
          <div className="header"><h1>Ready for Round 2?</h1><p className="subtitle">All players have completed Round 1</p></div>
          <div className="participants-list">
            <h3><CheckCircle size={20} />Round 1 Complete</h3>
            <p style={{ color: '#718096', marginBottom: '1rem' }}>
              All {gameData.participantList?.length} players have submitted their answers
            </p>
          </div>
          <button onClick={startRound2}><Play size={20} />Start Round 2</button>
        </div>
      )}

      {/* ── Results ── */}
      {view === 'hostResults' && <ResultsView gameId={gameId} />}
    </div>
  );
}
