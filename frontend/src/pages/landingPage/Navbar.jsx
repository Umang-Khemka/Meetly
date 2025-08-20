import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore.js";

export default function Navbar() {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [meetingId, setMeetingId] = useState("");

  const handleJoin = (e) => {
    e.preventDefault();
    if (meetingId.trim() !== "") {
      setShowPopup(false);
      navigate(`/room/${meetingId}`); // go to VideoMeet with meetingId
    }
  };

  return (
    <>
      <nav>
        <div className="navHeader">
          <h2>MEETLY</h2>
        </div>
        <div className="navList">
          <Link style={{ textDecoration: "none", color: "white" }}
            onClick={() => setShowPopup(true)}
          >
            Join as Guest
          </Link>

          <Link to="/auth" style={{ textDecoration: "none", color: "white" }}>
            Register
          </Link>
          <Link to="/auth" style={{ textDecoration: "none", color: "white" }}>
            Login
          </Link>
        </div>
      </nav>

      {/* Popup for Meeting ID */}
      {showPopup && (
        <div className="popupOverlay">
          <div className="popupBox">
            <h3>Enter Meeting ID</h3>
            <form onSubmit={handleJoin}>
              <input
                type="text"
                placeholder="Meeting ID"
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value)}
                required
              />
              <div className="popupActions">
                <button type="submit" className="joinBtn">Join</button>
                <button type="button" onClick={() => setShowPopup(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
