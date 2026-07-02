import {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./Interests.css";

import {
  getAllInterests,
  getMyInterests,
  addInterest,
  removeInterest,
} from "../../services/interestService";

export default function Interests() {
  const [allInterests, setAllInterests] =
    useState([]);

  const [myInterests, setMyInterests] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [all, mine] =
        await Promise.all([
          getAllInterests(),
          getMyInterests(),
        ]);

      setAllInterests(all);
      setMyInterests(mine);
    } catch (err) {
      console.error(err);
      setMessage(
        "Failed to load interests."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(
    interestId
  ) {
    try {
      await addInterest(
        interestId
      );

      await loadData();
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message ||
          "Unable to add interest."
      );
    }
  }

  async function handleRemove(
    interestId
  ) {
    try {
      await removeInterest(
        interestId
      );

      await loadData();
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message ||
          "Unable to remove interest."
      );
    }
  }

  const filtered =
    useMemo(() => {
      return allInterests.filter(
        (interest) =>
          interest.name
            .toLowerCase()
            .includes(
              search
                .trim()
                .toLowerCase()
            )
      );
    }, [
      allInterests,
      search,
    ]);

  if (loading) {
    return (
      <div className="interests-page">
        <h2>
          Loading...
        </h2>
      </div>
    );
  }

  return (
    <div className="interests-page">

      <div className="card">

        <h2>
          My Interests (
          {
            myInterests.length
          }
          )
        </h2>

        {myInterests.length ===
        0 ? (
          <div className="empty-state">
            No interests
            added.
          </div>
        ) : (
          myInterests.map(
            (item) => (
              <div
                className="interest-item"
                key={
                  item.interest.id
                }
              >
                <span>
                  {
                    item
                      .interest
                      .name
                  }
                </span>

                <button
                  className="remove-btn"
                  onClick={() =>
                    handleRemove(
                      item
                        .interest
                        .id
                    )
                  }
                >
                  Remove
                </button>
              </div>
            )
          )
        )}

      </div>

      <div className="card">

        <h2>
          Available
          Interests (
          {
            filtered.length
          }
          )
        </h2>

        <input
          className="search-input"
          placeholder="Search interests..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

        {filtered.length ===
        0 ? (
          <div className="empty-state">
            No matching
            interests.
          </div>
        ) : (
          filtered.map(
            (
              interest
            ) => {
              const exists =
                myInterests.some(
                  (
                    item
                  ) =>
                    item
                      .interest
                      .id ===
                    interest.id
                );

              return (
                <div
                  className="interest-item"
                  key={
                    interest.id
                  }
                >
                  <span>
                    {
                      interest.name
                    }
                  </span>

                  <button
                    disabled={
                      exists
                    }
                    className={
                      exists
                        ? "added-btn"
                        : "add-btn"
                    }
                    onClick={() =>
                      handleAdd(
                        interest.id
                      )
                    }
                  >
                    {exists
                      ? "Added"
                      : "Add"}
                  </button>
                </div>
              );
            }
          )
        )}

        {message && (
          <p className="message">
            {message}
          </p>
        )}

      </div>

    </div>
  );
}