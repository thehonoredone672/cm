import { useState } from "react";
import "./InviteModal.css";

import { sendInvite } from "../../services/teamInviteService";

export default function InviteModal({
  open,
  onClose,
  receiver,
}) {
  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);
      setSuccess("");
      setError("");

      await sendInvite({
        receiverId: receiver.id,
        message,
      });

      setSuccess(
        "Invitation sent successfully."
      );

      setMessage("");

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to send invite."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay">

      <div className="invite-modal">

        <div className="modal-header">

          <h2>
            Invite {receiver.name}
          </h2>

          <button
            className="close-btn"
            onClick={onClose}
          >
            ✕
          </button>

        </div>

        <form
          onSubmit={handleSubmit}
        >

          <label>
            Message
          </label>

          <textarea
            rows="5"
            placeholder="Hi! I saw your profile on CodeMatch and would like to invite you to collaborate on a project."
            value={message}
            onChange={(e) =>
              setMessage(
                e.target.value
              )
            }
          />

          {success && (
            <p className="success">
              {success}
            </p>
          )}

          {error && (
            <p className="error">
              {error}
            </p>
          )}

          <div className="modal-actions">

            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              className="send-btn"
              disabled={loading}
            >
              {loading
                ? "Sending..."
                : "Send Invite"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}