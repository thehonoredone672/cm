import { useEffect, useMemo, useState } from "react";
import "./Skills.css";

import {
  getAllSkills,
  getMySkills,
  addSkill,
  removeSkill,
} from "../../services/skillService";

export default function Skills() {
  const [allSkills, setAllSkills] = useState([]);
  const [mySkills, setMySkills] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [skills, userSkills] = await Promise.all([
        getAllSkills(),
        getMySkills(),
      ]);

      setAllSkills(skills);
      setMySkills(userSkills);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load skills.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(skillId) {
    try {
      await addSkill(skillId);
      await loadData();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to add skill.");
    }
  }

  async function handleRemove(skillId) {
    try {
      await removeSkill(skillId);
      await loadData();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to remove skill.");
    }
  }

  const filteredSkills = useMemo(() => {
    return allSkills.filter((skill) =>
      skill.name.toLowerCase().includes(search.trim().toLowerCase())
    );
  }, [allSkills, search]);

  if (loading) {
    return (
      <div className="skills-page">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="skills-page">
      {/* ---------------- My Skills ---------------- */}

      <div className="card">
        <h2>My Skills ({mySkills.length})</h2>

        {mySkills.length === 0 ? (
          <div className="empty-state">
            No skills added yet.
          </div>
        ) : (
          mySkills.map((item) => (
            <div
              className="skill-item"
              key={item.skill.id}
            >
              <span>{item.skill.name}</span>

              <button
                type="button"
                className="remove-btn"
                onClick={() =>
                  handleRemove(item.skill.id)
                }
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      {/* ---------------- Available Skills ---------------- */}

      <div className="card">
        <h2>
          Available Skills ({filteredSkills.length})
        </h2>

        <input
          className="search-input"
          type="text"
          placeholder="Search skills..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        {filteredSkills.length === 0 ? (
          <div className="empty-state">
            No matching skills found.
          </div>
        ) : (
          filteredSkills.map((skill) => {
            const added = mySkills.some(
              (item) => item.skill.id === skill.id
            );

            return (
              <div
                className="skill-item"
                key={skill.id}
              >
                <span>{skill.name}</span>

                <button
                  type="button"
                  className={
                    added
                      ? "added-btn"
                      : "add-btn"
                  }
                  disabled={added}
                  onClick={() =>
                    handleAdd(skill.id)
                  }
                >
                  {added ? "Added" : "Add"}
                </button>
              </div>
            );
          })
        )}

        {message && (
          <p className="message">{message}</p>
        )}
      </div>
    </div>
  );
}