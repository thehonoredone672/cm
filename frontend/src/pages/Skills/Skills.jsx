import {
  useEffect,
  useState,
} from "react";

import "./Skills.css";

import {
  getAllSkills,
  getMySkills,
  addSkill,
  removeSkill,
} from "../../services/skillService";

export default function Skills() {
  const [skills, setSkills] =
    useState([]);

  const [userSkills, setUserSkills] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  async function loadData() {
    try {
      const [
        all,
        mine,
      ] = await Promise.all([
        getAllSkills(),
        getMySkills(),
      ]);

      setSkills(all);
      setUserSkills(mine);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAdd(
    skillId
  ) {
    await addSkill(skillId);
    loadData();
  }

  async function handleRemove(
    skillId
  ) {
    await removeSkill(skillId);
    loadData();
  }

  if (loading)
    return <h2>Loading...</h2>;

  return (
    <div className="skills-page">

      <div className="card">

        <h2>
          My Skills
        </h2>

        {userSkills.length === 0 && (
          <p>
            No skills added.
          </p>
        )}

        {userSkills.map(
          (item) => (
            <div
              key={
                item.skill.id
              }
              className="skill-item"
            >
              <span>
                {
                  item.skill
                    .name
                }
              </span>

              <button
                onClick={() =>
                  handleRemove(
                    item.skill.id
                  )
                }
              >
                Remove
              </button>
            </div>
          )
        )}

      </div>

      <div className="card">

        <h2>
          Available Skills
        </h2>

        {skills.map((skill) => {
          const exists =
            userSkills.find(
              (s) =>
                s.skill.id ===
                skill.id
            );

          return (
            <div
              key={skill.id}
              className="skill-item"
            >
              <span>
                {skill.name}
              </span>

              <button
                disabled={
                  exists
                }
                onClick={() =>
                  handleAdd(
                    skill.id
                  )
                }
              >
                {exists
                  ? "Added"
                  : "Add"}
              </button>
            </div>
          );
        })}

      </div>

    </div>
  );
}