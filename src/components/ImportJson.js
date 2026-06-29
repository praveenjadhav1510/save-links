import React, { useState } from "react";
import CryptoJS from "crypto-js";

import "./ImportExport.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faFileCode,
  faFileCirclePlus,
  faReplyAll,
  faCircleInfo,
  faShieldHalved,
  faUnlock,
} from "@fortawesome/free-solid-svg-icons";

export default function ImportJson({ display, setDisplay, refreshData, notify }) {
  const [loadedLinks, setLoadedLinks] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [senderName, setSenderName] = useState("");

  const receiverName = localStorage.getItem("user_nickname") || "";

  const generateKey = (sender, receiver) => {
    const combined = `${sender.trim()}:${receiver.trim()}`;
    return CryptoJS.SHA256(combined).toString();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!senderName.trim()) {
      notify("Please enter the sender's username before choosing a file.");
      event.target.value = "";
      return;
    }

    if (!receiverName) {
      notify("Your username (receiver) is missing. Please log in again.");
      event.target.value = "";
      return;
    }

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const encrypted = e.target.result;
        const key = generateKey(senderName, receiverName);
        const bytes = CryptoJS.AES.decrypt(encrypted, key);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);

        if (!decrypted) {
          throw new Error("Decryption failed. Wrong usernames or corrupted file.");
        }

        const json = JSON.parse(decrypted);
        const parsedArray = Array.isArray(json) ? json : [json];
        
        setLoadedLinks(parsedArray);
        setSelectedIndices(parsedArray.map((_, index) => index)); // Select all by default
        notify("File decrypted successfully ✅");
      } catch (error) {
        console.error("Decrypt/parse error:", error);
        notify("Failed to decrypt or parse the file. Check both usernames.");
        setLoadedLinks([]);
        setSelectedIndices([]);
      }
    };

    reader.readAsText(file);
  };

  const toggleSelect = (index) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter((i) => i !== index));
    } else {
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  const selectAll = () => {
    setSelectedIndices(loadedLinks.map((_, index) => index));
  };

  const selectNone = () => {
    setSelectedIndices([]);
  };

  const resetModal = () => {
    setLoadedLinks([]);
    setSelectedIndices([]);
    setSenderName("");
  };

  const addSelectedData = () => {
    if (selectedIndices.length === 0) {
      notify("Please select at least one link to import.");
      return;
    }

    const linksToImport = loadedLinks.filter((_, idx) => selectedIndices.includes(idx));
    const existingData = JSON.parse(localStorage.getItem("saved_links_data")) || [];

    const combinedData = [...existingData, ...linksToImport];
    localStorage.setItem("saved_links_data", JSON.stringify(combinedData));

    setDisplay(false);
    refreshData();
    notify(`${linksToImport.length} links added successfully!`);
    resetModal();
  };

  const replaceSelectedData = () => {
    if (selectedIndices.length === 0) {
      notify("Please select at least one link to import.");
      return;
    }

    const linksToImport = loadedLinks.filter((_, idx) => selectedIndices.includes(idx));
    localStorage.setItem("saved_links_data", JSON.stringify(linksToImport));

    setDisplay(false);
    refreshData();
    notify(`${linksToImport.length} links imported. Existing links replaced.`);
    resetModal();
  };

  if (!display) return null;

  return (
    <div className="modal-overlay" style={{ display: "grid" }}>
      <div className="import-export-modal export-modal-redesign">
        <h2>
          <span className="modal-title">
            <FontAwesomeIcon icon={faShieldHalved} className="shield-icon" /> Secure Link Import
          </span>
          <FontAwesomeIcon
            icon={faXmark}
            className="close"
            onClick={() => {
              setDisplay(false);
              resetModal();
            }}
          />
        </h2>

        <div className="import-export-body export-body-redesign">
          {loadedLinks.length === 0 ? (
            /* ==========================================
               STEP 1: BEFORE DECRYPTION (Upload file)
               ========================================== */
            <>
              {/* Left Column: Info */}
              <div className="export-col-left">
                <div className="export-info-section">
                  <div className="info-badge">
                    <FontAwesomeIcon icon={faCircleInfo} />
                    <span>How Decrypting Links Works</span>
                  </div>
                  <p className="info-description">
                    Import files shared by friends. Your files are decrypted completely client-side.
                    The decryption key is derived from the sender's username and your username.
                    No data is sent to any server.
                  </p>
                  <div className="info-steps">
                    <div className="step-item">
                      <span className="step-number">1</span>
                      <span>Enter the exact username of the sender</span>
                    </div>
                    <div className="step-item">
                      <span className="step-number">2</span>
                      <span>Select the encrypted <code>savelinks_encrypted.txt</code> file</span>
                    </div>
                    <div className="step-item">
                      <span className="step-number">3</span>
                      <span>Preview and choose which links to import</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Configuration & File Pick */}
              <div className="export-col-right">
                <div className="export-form-group">
                  <div className="username-display-card">
                    <span className="field-label">Receiver (You)</span>
                    <span className="user-badge">{receiverName || "Unknown"}</span>
                  </div>

                  <div className="input-field-wrapper">
                    <label htmlFor="senderNameInput" className="field-label">Sender's Username</label>
                    <input
                      id="senderNameInput"
                      className="inputRN redesigned-input"
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Sender's username (case-sensitive)"
                    />
                    <span className="input-help">Enter the username of the person who exported the links.</span>
                  </div>
                </div>

                <div className="file-upload-container">
                  <input
                    type="file"
                    accept=".txt,.json"
                    onChange={handleFileChange}
                    id="fileInput"
                    className="hidden-file-input"
                  />
                  <label htmlFor="fileInput" className="custom-file-label-redesign">
                    <FontAwesomeIcon icon={faFileCode} className="upload-icon" />
                    <span className="upload-text">Choose Decryption File</span>
                    <span className="upload-subtext">savelinks_encrypted.txt</span>
                  </label>
                </div>
              </div>
            </>
          ) : (
            /* ==========================================
               STEP 2: AFTER DECRYPTION (Preview & Action)
               ========================================== */
            <>
              {/* Left Column: Metadata & Action Buttons */}
              <div className="export-col-left">
                <div className="export-info-section success-border">
                  <div className="info-badge success-color">
                    <FontAwesomeIcon icon={faUnlock} />
                    <span>File Decrypted Successfully</span>
                  </div>
                  <p className="info-description">
                    The file was decrypted successfully. Preview the links and select which ones you would like to import.
                  </p>
                  <div className="info-details-list">
                    <div className="meta-row">
                      <span className="meta-label">Sender Username:</span>
                      <span className="meta-badge blue-badge">{senderName}</span>
                    </div>
                  </div>
                </div>

                <div className="export-stats-grid">
                  <div className="stat-card total-stat">
                    <div className="stat-value">{loadedLinks.length}</div>
                    <div className="stat-label">Total Links</div>
                  </div>
                  <div className="stat-card public-stat">
                    <div className="stat-value">{selectedIndices.length}</div>
                    <div className="stat-label">Selected</div>
                  </div>
                  <div className={`stat-card private-stat ${selectedIndices.length === loadedLinks.length ? "private-excluded" : ""}`}>
                    <div className="stat-value">{loadedLinks.length - selectedIndices.length}</div>
                    <div className="stat-label">Excluded</div>
                  </div>
                </div>

                <div className="selection-quick-actions">
                  <button className="btn-selection-action" onClick={selectAll}>Select All</button>
                  <button className="btn-selection-action" onClick={selectNone}>Deselect All</button>
                  <button className="btn-selection-action reset-btn" onClick={resetModal}>Load Different File</button>
                </div>

                <div className="export-actions">
                  <button
                    onClick={addSelectedData}
                    className="btn-download btn-export-primary"
                    disabled={selectedIndices.length === 0}
                  >
                    Import Selected ({selectedIndices.length}) <FontAwesomeIcon icon={faFileCirclePlus} />
                  </button>

                  <button
                    onClick={replaceSelectedData}
                    className="btn-download btn-export-secondary"
                    disabled={selectedIndices.length === 0}
                  >
                    Replace All with Selected <FontAwesomeIcon icon={faReplyAll} />
                  </button>
                </div>
              </div>

              {/* Right Column: Preview Grid */}
              <div className="export-col-right">
                <div className="preview-header-row">
                  <span className="preview-title">Link Preview</span>
                  <span className="preview-badge-count">{selectedIndices.length} / {loadedLinks.length} Selected</span>
                </div>

                <div className="import-preview-list">
                  {loadedLinks.map((link, index) => {
                    const isSelected = selectedIndices.includes(index);
                    return (
                      <div
                        key={index}
                        className={`mini-card-preview ${isSelected ? "card-selected" : ""}`}
                        style={{ borderLeft: `4px solid ${link.color || "#1e1e1e"}` }}
                        onClick={() => toggleSelect(index)}
                      >
                        <div className="mini-card-checkbox">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // Handled by parent div click
                          />
                        </div>
                        <div className="mini-card-icon">
                          <img
                            src={link.iconUrl || "default.svg"}
                            alt=""
                            onError={(e) => {
                              e.target.src = "default.svg";
                            }}
                          />
                        </div>
                        <div className="mini-card-details">
                          <span className="mini-card-name" title={link.name}>
                            {link.name || "Untitled Link"}
                          </span>
                          <span className="mini-card-url" title={link.url}>
                            {link.url}
                          </span>
                        </div>
                        <span className="mini-card-category">{link.category}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

