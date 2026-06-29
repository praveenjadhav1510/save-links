import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faUserPen, faCheck } from "@fortawesome/free-solid-svg-icons";
import "./ImportExport.css";

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

  useEffect(() => {
    if (isUserModalOpen) {
      setUserInput(localStorage.getItem("user_nickname") || "");
    }
  }, [isUserModalOpen]);

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
      <div className="import-export-modal export-modal-redesign identity-modal-redesign" ref={modalRef}>
        <h2>
          <span className="modal-title">
            <FontAwesomeIcon icon={faUserPen} className="shield-icon" /> Define Identity
          </span>
          <FontAwesomeIcon
            icon={faXmark}
            className="close"
            onClick={() => setIsUserModalOpen(false)}
          />
        </h2>

        <div className="import-export-body">
          <div className="export-form-group">
            <div className="input-field-wrapper">
              <label htmlFor="userInputField" className="field-label">Nickname or Username</label>
              <input
                id="userInputField"
                type="text"
                className="inputRN redesigned-input"
                placeholder="e.g., Master Programmer"
                autoFocus
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") saveUser(); }}
              />
              <span className="input-help">This name is used as the sender name when exporting links.</span>
            </div>
          </div>

          <div className="export-actions">
            <button className="btn-download btn-export-primary" onClick={saveUser}>
              Set Nickname <FontAwesomeIcon icon={faCheck} />
            </button>
            <button className="btn-download btn-export-secondary" onClick={() => setIsUserModalOpen(false)}>
              Keep Current
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

