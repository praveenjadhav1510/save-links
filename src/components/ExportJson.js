import React, { useState, useEffect } from "react";
import "./ImportExport.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faFileCode,
  faFileArrowDown,
  faAnchorLock,
  faCircleInfo,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import CryptoJS from "crypto-js";

export default function ExportJson({ display, setDisplay, user, notify }) {
  const [receiverName, setReceiverName] = useState("");
  const [links, setLinks] = useState([]);
  const [includePrivate, setIncludePrivate] = useState(true);
  const userName = user || localStorage.getItem("user_nickname") || "";

  useEffect(() => {
    if (display) {
      const rawData = localStorage.getItem("saved_links_data");
      if (rawData) {
        try {
          const parsed = JSON.parse(rawData);
          setLinks(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          console.error("Error parsing saved links:", e);
          setLinks([]);
        }
      } else {
        setLinks([]);
      }
    }
  }, [display]);

  const privateCount = links.filter((link) => link.category === "Private").length;
  const publicCount = links.length - privateCount;

  const generateKey = (sender, receiver) => {
    const combined = `${sender.trim()}:${receiver.trim()}`;
    return CryptoJS.SHA256(combined).toString();
  };

  const handleExport = () => {
    if (!userName) {
      notify("Your username is missing. Please log in.");
      return;
    }

    if (!receiverName.trim()) {
      notify("Please enter the receiver's username.");
      return;
    }

    const rawData = localStorage.getItem("saved_links_data");
    if (!rawData) {
      notify("No links found to export.");
      return;
    }

    try {
      const parsed = JSON.parse(rawData);
      
      let linksToExport = parsed;
      if (!includePrivate) {
        linksToExport = parsed.filter((link) => link.category !== "Private");
      }

      if (linksToExport.length === 0) {
        notify("No links to export after filtering.");
        return;
      }

      const key = generateKey(userName, receiverName);
      const cipherText = CryptoJS.AES.encrypt(
        JSON.stringify(linksToExport),
        key
      ).toString();

      const blob = new Blob([cipherText], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "savelinks_encrypted.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      notify(`Encrypted file downloaded for "${receiverName.trim()}".`);
      setDisplay(false);
    } catch (error) {
      console.error("Export error:", error);
      notify("Something went wrong while exporting.");
    }
  };

  if (!display) return null;

  return (
    <div className="modal-overlay" style={{ display: "grid" }}>
      <div className="import-export-modal export-modal-redesign">
        <h2>
          <span className="modal-title">
            <FontAwesomeIcon icon={faShieldHalved} className="shield-icon" /> Secure Link Export
          </span>
          <FontAwesomeIcon
            icon={faXmark}
            className="close"
            onClick={() => setDisplay(false)}
          />
        </h2>

        <div className="import-export-body export-body-redesign">
          {/* Left Column: Info & Stats */}
          <div className="export-col-left">
            <div className="export-info-section">
              <div className="info-badge">
                <FontAwesomeIcon icon={faCircleInfo} />
                <span>How Secure Sharing Works</span>
              </div>
              <p className="info-description">
                Your links are encrypted client-side using <strong>AES-256</strong>. 
                The password is derived from both your username and the receiver's username. 
                Only someone with access to both usernames and this file can decrypt and import your links.
              </p>
              <div className="info-steps">
                <div className="step-item">
                  <span className="step-number">1</span>
                  <span>Enter receiver's exact username</span>
                </div>
                <div className="step-item">
                  <span className="step-number">2</span>
                  <span>Download the encrypted text file</span>
                </div>
                <div className="step-item">
                  <span className="step-number">3</span>
                  <span>Share the file and both usernames</span>
                </div>
              </div>
            </div>

            <div className="export-stats-grid">
              <div className="stat-card total-stat">
                <div className="stat-value">{links.length}</div>
                <div className="stat-label">Total Links</div>
              </div>
              <div className="stat-card public-stat">
                <div className="stat-value">{publicCount}</div>
                <div className="stat-label">Public</div>
              </div>
              <div className={`stat-card private-stat ${!includePrivate ? "private-excluded" : ""}`}>
                <div className="stat-value">{privateCount}</div>
                <div className="stat-label">Private</div>
              </div>
            </div>
          </div>

          {/* Right Column: Configuration & Action */}
          <div className="export-col-right">
            <div className="export-form-group">
              <div className="username-display-card">
                <span className="field-label">Sender (You)</span>
                <span className="user-badge">{userName || "Unknown"}</span>
              </div>

              <div className="input-field-wrapper">
                <label htmlFor="receiverNameInput" className="field-label">Receiver's Username</label>
                <input
                  id="receiverNameInput"
                  className="inputRN redesigned-input"
                  type="text"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="Receiver's username (case-sensitive)"
                />
                <span className="input-help">Receiver must enter your exact username when importing.</span>
              </div>
            </div>

            <div className="private-toggle-container">
              <div className="toggle-info">
                <span className="toggle-title">Include Private Links</span>
                <span className="toggle-desc">
                  {privateCount > 0
                    ? `Export your ${privateCount} private link${privateCount === 1 ? "" : "s"}.`
                    : "No private links found."}
                </span>
              </div>
              <label className="switch-toggle">
                <input
                  type="checkbox"
                  checked={includePrivate}
                  disabled={privateCount === 0}
                  onChange={(e) => setIncludePrivate(e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>

            <div className="export-actions">
              <button
                onClick={handleExport}
                className="btn-download btn-export-primary"
                disabled={links.length === 0 || (!includePrivate && publicCount === 0)}
              >
                Export & Download File <FontAwesomeIcon icon={faFileArrowDown} />
              </button>

              <div className="export-footer-details">
                <span>File: <strong className="filename-style">savelinks_encrypted.txt <FontAwesomeIcon icon={faFileCode} /></strong></span>
                <span className="encryption-badge">
                  <FontAwesomeIcon icon={faAnchorLock} /> End-to-End
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

