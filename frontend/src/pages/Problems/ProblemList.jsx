import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProblems } from "../../services/problemService";
import { useAuth } from "../../context/AuthContext";
import "./Problems.css";

export default function ProblemList() {
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchProblems();
  }, []);

  useEffect(() => {
    let result = problems;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }

    if (difficultyFilter !== "ALL") {
      result = result.filter(p => p.difficulty === difficultyFilter);
    }

    if (categoryFilter !== "ALL") {
      result = result.filter(p => p.category === categoryFilter);
    }

    setFilteredProblems(result);
  }, [search, difficultyFilter, categoryFilter, problems]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const data = await getProblems();
      setProblems(data);
      setFilteredProblems(data);
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to load problems.");
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyClass = (diff) => {
    return diff.toLowerCase();
  };

  const categories = ["ALL", ...new Set(problems.map(p => p.category))];

  return (
    <div className="problems-page">
      <div className="problems-header">
        <h1>Coding Workspace</h1>
      </div>

      {errorMessage && <div style={{ background: "var(--danger-glow)", border: "1px solid var(--danger)", color: "var(--danger)", padding: "12px", borderRadius: "var(--radius-sm)", marginBottom: "20px" }}>{errorMessage}</div>}

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "24px", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
          <input
            type="text"
            placeholder="Search problems or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 16px 10px 38px",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              background: "var(--surface)",
              color: "var(--text-primary)",
              fontSize: "14px"
            }}
          />
          <svg 
            width="18" 
            height="18" 
            fill="none" 
            stroke="var(--text-secondary)" 
            strokeWidth="2" 
            viewBox="0 0 24 24"
            style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          style={{
            padding: "10px 16px",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            background: "var(--surface)",
            color: "var(--text-primary)",
            fontSize: "14px",
            outline: "none"
          }}
        >
          <option value="ALL">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{
            padding: "10px 16px",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            background: "var(--surface)",
            color: "var(--text-primary)",
            fontSize: "14px",
            outline: "none"
          }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === "ALL" ? "All Categories" : cat}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="problems-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="problem-card skeleton" style={{ height: "160px" }}></div>
          ))}
        </div>
      ) : filteredProblems.length === 0 ? (
        <div style={{ background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)", padding: "48px 24px", textAlign: "center", color: "var(--text-secondary)" }}>
          <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ margin: "0 auto 16px auto", opacity: 0.5 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3>No problems found</h3>
          <p>Try resetting filters or search queries.</p>
        </div>
      ) : (
        <div className="problems-grid">
          {filteredProblems.map((problem) => (
            <div
              key={problem.id}
              className="problem-card"
              onClick={() => navigate(`/problems/${problem.id}`)}
            >
              <div>
                <div className="problem-card__top">
                  <h3 className="problem-card__title">{problem.title}</h3>
                  <span className={`difficulty-badge ${getDifficultyClass(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                </div>
                <div className="problem-card__category">{problem.category}</div>
              </div>
              <div className="problem-card__tags">
                {problem.tags.map(tag => (
                  <span key={tag} className="problem-tag">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
