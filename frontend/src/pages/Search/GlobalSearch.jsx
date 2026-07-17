import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  performSearch, 
  getSearchSuggestions, 
  getSearchHistory, 
  deleteSearchHistoryItem, 
  clearAllSearchHistory, 
  getTrendingSearches 
} from "../../services/searchService";
import "../Problems/Problems.css";

export default function GlobalSearch() {
  const navigate = useNavigate();

  // Query States
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [difficulty, setDifficulty] = useState("");
  const [contestStatus, setContestStatus] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");

  const debounceTimeoutRef = useRef(null);

  useEffect(() => {
    fetchHistoryAndTrending();
  }, []);

  // Trigger search on query change or filter change (debounced for typing)
  useEffect(() => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);

    if (!query.trim()) {
      setResults(null);
      setSuggestions([]);
      return;
    }

    debounceTimeoutRef.current = setTimeout(() => {
      fetchSearchAndSuggestions();
    }, 400);

    return () => clearTimeout(debounceTimeoutRef.current);
  }, [query, difficulty, contestStatus, collegeFilter]);

  const fetchHistoryAndTrending = async () => {
    try {
      const hist = await getSearchHistory();
      setHistory(hist || []);
      const trend = await getTrendingSearches();
      setTrending(trend || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSearchAndSuggestions = async () => {
    try {
      setLoading(true);
      const filters = {
        difficulty: difficulty || undefined,
        contestStatus: contestStatus || undefined,
        college: collegeFilter || undefined
      };
      const res = await performSearch(query, filters);
      setResults(res);

      const sug = await getSearchSuggestions(query);
      setSuggestions(sug || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistoryItem = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteSearchHistoryItem(id);
      fetchHistoryAndTrending();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAllHistory = async () => {
    try {
      await clearAllSearchHistory();
      fetchHistoryAndTrending();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSuggestClick = (sugText) => {
    setQuery(sugText);
  };

  const totalResults = results 
    ? (results.students?.length || 0) + 
      (results.teams?.length || 0) + 
      (results.projects?.length || 0) + 
      (results.problems?.length || 0) + 
      (results.contests?.length || 0)
    : 0;

  return (
    <motion.div className="lc-problems" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1>Global Platform Search</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: "24px", marginTop: "20px" }}>
        
        {/* LEFT COLUMN: Search bar & results container */}
        <div>
          {/* Main search bar */}
          <div className="stats-card" style={{ padding: "16px", marginBottom: "20px" }}>
            <input 
              type="text" 
              placeholder="Search students, teams, problems, contests, and projects..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", background: "var(--background)", color: "var(--text-primary)", border: "1.5px solid var(--border)", fontSize: "14px" }}
            />

            {/* Suggestions list */}
            {suggestions.length > 0 && (
              <div style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: "6px", marginTop: "8px", padding: "8px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                <span className="muted-text" style={{ fontSize: "11px", display: "flex", alignItems: "center" }}>Suggestions:</span>
                {suggestions.map((sug, i) => (
                  <span 
                    key={i} 
                    className="lc-tag" 
                    style={{ cursor: "pointer", margin: 0 }}
                    onClick={() => handleSuggestClick(sug)}
                  >
                    🔍 {sug}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Results section */}
          {loading ? (
            <div className="lc-spinner" style={{ padding: "40px" }}>
              <div className="lc-spin" />
              <span>Searching indices...</span>
            </div>
          ) : !results ? (
            <div className="stats-card" style={{ padding: "40px", textAlign: "center" }}>
              <span className="muted-text">Type something to search the entire platform indices.</span>
            </div>
          ) : totalResults === 0 ? (
            <div className="stats-card" style={{ padding: "40px", textAlign: "center" }}>
              <span className="muted-text">No results found matching query keys. Try widening your filters.</span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
              {/* Students Results */}
              {results.students?.length > 0 && (
                <div className="stats-card">
                  <h3 className="lc-section-title">👥 Students ({results.students.length})</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {results.students.map(std => (
                      <div key={std.id} className="team-item-row" style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: "8px", cursor: "pointer" }} onClick={() => navigate(`/profile`)}>
                        <strong>{std.name}</strong>
                        <span className="meta-details" style={{ display: "block", fontSize: "11px" }}>{std.college} | {std.department}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Teams Results */}
              {results.teams?.length > 0 && (
                <div className="stats-card">
                  <h3 className="lc-section-title">🏢 Teams ({results.teams.length})</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {results.teams.map(team => (
                      <div key={team.id} className="team-item-row" style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: "8px", cursor: "pointer" }} onClick={() => navigate(`/teams/${team.id}`)}>
                        <strong>{team.name}</strong>
                        <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "2px 0 0 0" }}>{team.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Problems Results */}
              {results.problems?.length > 0 && (
                <div className="stats-card">
                  <h3 className="lc-section-title">💻 Coding Problems ({results.problems.length})</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {results.problems.map(prob => (
                      <div key={prob.id} className="team-item-row" style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: "8px", cursor: "pointer" }} onClick={() => navigate(`/problems/${prob.id}`)}>
                        <strong>{prob.title}</strong>
                        <span className="meta-details" style={{ display: "block", fontSize: "11px" }}>{prob.category} | {prob.difficulty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contests Results */}
              {results.contests?.length > 0 && (
                <div className="stats-card">
                  <h3 className="lc-section-title">📅 Contests ({results.contests.length})</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {results.contests.map(c => (
                      <div key={c.id} className="team-item-row" style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: "8px", cursor: "pointer" }} onClick={() => navigate(`/contests/${c.id}`)}>
                        <strong>{c.title}</strong>
                        <span className="meta-details" style={{ display: "block", fontSize: "11px" }}>Status: {c.status} | Starts: {new Date(c.startTime).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects Results */}
              {results.projects?.length > 0 && (
                <div className="stats-card">
                  <h3 className="lc-section-title">📝 Student Projects ({results.projects.length})</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {results.projects.map(proj => (
                      <div key={proj.id} className="team-item-row" style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: "8px" }}>
                        <strong>{proj.title}</strong>
                        <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "2px 0 0 0" }}>{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Filters and Search histories */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Filters card */}
          <div className="stats-card">
            <h3 className="lc-section-title">⚙️ Search Filters</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", display: "block", marginBottom: "4px" }}>Problem Difficulty</label>
                <select 
                  value={difficulty} 
                  onChange={(e) => setDifficulty(e.target.value)}
                  style={{ width: "100%", padding: "8px", background: "var(--background)", color: "var(--text-primary)", border: "1.5px solid var(--border)", borderRadius: "6px" }}
                >
                  <option value="">All Ranks</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "11px", display: "block", marginBottom: "4px" }}>Contest Status</label>
                <select 
                  value={contestStatus} 
                  onChange={(e) => setContestStatus(e.target.value)}
                  style={{ width: "100%", padding: "8px", background: "var(--background)", color: "var(--text-primary)", border: "1.5px solid var(--border)", borderRadius: "6px" }}
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">Running</option>
                  <option value="UPCOMING">Upcoming</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "11px", display: "block", marginBottom: "4px" }}>Filter College</label>
                <input 
                  type="text" 
                  placeholder="e.g. Stanford University" 
                  value={collegeFilter}
                  onChange={(e) => setCollegeFilter(e.target.value)}
                  style={{ width: "100%", padding: "8px", background: "var(--background)", color: "var(--text-primary)", border: "1.5px solid var(--border)", borderRadius: "6px" }}
                />
              </div>
            </div>
          </div>

          {/* Recent search history list */}
          <div className="stats-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 className="lc-section-title" style={{ margin: 0 }}> Recent Searches</h3>
              {history.length > 0 && (
                <button className="btn-table-action" style={{ borderColor: "#ef4444", color: "#ef4444", fontSize: "10px" }} onClick={handleClearAllHistory}>
                  Clear All
                </button>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {history.length === 0 ? (
                <span className="muted-text" style={{ fontSize: "12px" }}>No recent searches found.</span>
              ) : (
                history.map(item => (
                  <div 
                    key={item.id} 
                    className="team-item-row" 
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "6px", borderBottom: "1px solid var(--border-light)", cursor: "pointer" }}
                    onClick={() => setQuery(item.query)}
                  >
                    <span style={{ fontSize: "12px" }}>🕒 {item.query}</span>
                    <button 
                      style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "12px" }}
                      onClick={(e) => handleClearHistoryItem(e, item.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Trending Searches section */}
          <div className="stats-card">
            <h3 className="lc-section-title">🔥 Popular Searches</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {trending.length === 0 ? (
                <span className="muted-text" style={{ fontSize: "12px" }}>Search metrics loading...</span>
              ) : (
                trending.map((item, idx) => (
                  <div 
                    key={item.id} 
                    style={{ fontSize: "12px", borderBottom: "1px solid var(--border-light)", paddingBottom: "6px", cursor: "pointer" }}
                    onClick={() => setQuery(item.query)}
                  >
                    <strong>#{idx + 1}</strong> {item.query} <span className="muted-text" style={{ fontSize: "10px" }}>({item.count} searches)</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </motion.div>
  );
}
