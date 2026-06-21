import React, { useEffect } from "react";
import "./ShortcutsModal.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faKeyboard } from "@fortawesome/free-solid-svg-icons";

export default function ShortcutsModal({ isOpen, onClose }) {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const shortcuts = [
    { keys: ["?"], desc: "Show / Hide Help" },
    { keys: ["S", "/"], desc: "Focus Search" },
    { keys: ["A", "←"], desc: "Previous Filter" },
    { keys: ["D", "→"], desc: "Next Filter" },
    { keys: ["E"], desc: "Toggle Edit Mode" },
    { keys: ["T"], desc: "Toggle Trash Mode" },
    { keys: ["R"], desc: "Toggle Arrange Mode" },
    { keys: ["I"], desc: "Open Import" },
    { keys: ["X"], desc: "Open Export" },
    { keys: ["Esc"], desc: "Close Modals" },
  ];

  return (
    <>
      <div className={`shortcuts-overlay ${isOpen ? "visible" : ""}`} onClick={onClose}></div>
      <div className={`shortcuts-modal ${isOpen ? "visible" : ""}`}>
        <div className="shortcuts-header">
          <h2>
            <FontAwesomeIcon icon={faKeyboard} /> Keyboard Shortcuts
          </h2>
          <FontAwesomeIcon icon={faXmark} className="close-shortcuts" onClick={onClose} />
        </div>
        <div className="shortcuts-list">
          {shortcuts.map((s, index) => (
            <div className="shortcut-item" key={index}>
              <span className="shortcut-desc">{s.desc}</span>
              <div className="shortcut-keys">
                {s.keys.map((k, i) => (
                  <span className="key" key={i}>
                    {k}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
