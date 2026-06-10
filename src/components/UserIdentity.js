import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faUserPen, faCheck } from "@fortawesome/free-solid-svg-icons";

export default function UserIdentity({ isUserModalOpen, setIsUserModalOpen, setUser, notify }) {
  const [userInput, setUserInput] = useState("");
  const modalRef = useRef();

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") setIsUserModalOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [setIsUserModalOpen]);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setIsUserModalOpen(false);
    }
  };

  const saveUser = () => {
    if (userInput.trim() === "") {
      notify("Please enter a nickname.");
      return;
    }
    localStorage.setItem("user_nickname", userInput);
    setUser(userInput);
    setIsUserModalOpen(false);
    notify("New nickname " + userInput + " set!");
  };

  if (!isUserModalOpen) return null;

  return (
    <div
      className="modal-overlay"
      style={{ display: "flex" }}
      onClick={handleBackdropClick}
    >
      <div className="modal-content redesigned-user" ref={modalRef}>
        <div className="modal-header">
          <h3>
            <FontAwesomeIcon icon={faUserPen} style={{ marginRight: "10px", opacity: 0.7 }} />
            Define Identity
          </h3>
          <FontAwesomeIcon icon={faXmark} className="close-btn" onClick={() => setIsUserModalOpen(false)} />
        </div>

        <div className="details redesigned">
          <div className="input-group">
            <label>Nickname or Username</label>
            <input
              type="text"
              className="modern-input"
              placeholder="e.g., Master Programmer"
              autoFocus
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveUser(); }}
            />
          </div>

          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => setIsUserModalOpen(false)}>
              Keep current
            </button>
            <button className="btn-save accent" onClick={saveUser}>
              <FontAwesomeIcon icon={faCheck} /> Set Nickname
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
