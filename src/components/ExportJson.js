import React, { useState } from "react";
import "./inpexp.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faFileCode,
  faFileArrowDown,
  faLink,
  faAnchorLock,
} from "@fortawesome/free-solid-svg-icons";
import CryptoJS from "crypto-js";

export default function ExportJson({ display, setDisplay, user, notify }) {
  const [receiverName, setReceiverName] = useState("");
  const userName = user || localStorage.getItem("imuser") || "";

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

    const rawData = localStorage.getItem("websiteData");
    if (!rawData) {
      notify("No links found to export.");
      return;
    }

    try {
      const parsed = JSON.parse(rawData);
      const key = generateKey(userName, receiverName);
      const cipherText = CryptoJS.AES.encrypt(
        JSON.stringify(parsed),
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
    } catch (error) {
      console.error("Export error:", error);
      notify("Something went wrong while exporting.");
    }
  };

  if (!display) return null;

  return (
    <div className="addingCard" style={{ display: "grid" }}>
      <div className="impexp">
        <FontAwesomeIcon
          icon={faXmark}
          className="close"
          onClick={() => setDisplay(false)}
        />

        <h2>
          Export links <FontAwesomeIcon icon={faLink} />
        </h2>

        <div className="btbox">
          <input
            className="inputRN"
            type="text"
            value={receiverName}
            onChange={(e) => setReceiverName(e.target.value)}
            placeholder="Receiver's username"
          />

          <button onClick={handleExport}>
            Download <FontAwesomeIcon icon={faFileArrowDown} />
          </button>
        </div>

        <div className="infoBox">
          <p>Logged in as: <span className="highlight">{userName || "Unknown"}</span></p>
          <p>File: <span className="filename">savelinks_encrypted.txt <FontAwesomeIcon icon={faFileCode} /></span></p>
          <p>Share this file and both usernames with your friend.</p>
          <p className="impo">
            End-to-end encrypted <FontAwesomeIcon icon={faAnchorLock} />
          </p>
        </div>
      </div>
    </div>
  );
}
