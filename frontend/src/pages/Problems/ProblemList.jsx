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
        <h1>Coding Problems</h1>
        {user?.role === "ADMIN" && (
          <button 
            className="btn-primary" 
            onClick={() => navigate("/problems/create")}
          >
            + Create Problem
          </button>
        )}
      </div>

      {errorMessage && <div style={{ background: "rgba(220, 38, 38, 0.1)", border: "1px solid var(--danger)", color: "var(--danger)", padding: "12px", borderRadius: "var(--radius-sm)", marginBottom: "20px" }}>{errorMessage}</div>}

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "24px" }}>
        <input
          type="text"
          placeholder="Search problems by name or tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: "240px",
            padding: "10px 16px",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            background: "var(--surface)",
            color: "var(--text-primary)",
            fontSize: "14px"
          }}
        />

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
            <div key={i} className="problem-card skeleton" style={{ height: "160px" }}>
              <div style={{ background: "var(--border)", height: "20px", width: "60%", borderRadius: "4px" }} />
              <div style={{ background: "var(--border)", height: "16px", width: "40%", borderRadius: "4px" }} />
              <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                <div style={{ background: "var(--border)", height: "24px", width: "50px", borderRadius: "12px" }} />
                <div style={{ background: "var(--border)", height: "24px", width: "60px", borderRadius: "12px" }} />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProblems.length === 0 ? (
        <div style={{ background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)", padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
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
