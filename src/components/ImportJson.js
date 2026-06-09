import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import CryptoJS from "crypto-js";

import "./inpexp.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faFileCode,
  faFileCirclePlus,
  faLink,
  faReplyAll,
} from "@fortawesome/free-solid-svg-icons";

export default function ImportJson({ display, setDisplay, refresh, notify }) {
  const [fileContent, setFileContent] = useState(null);
  const [senderName, setSenderName] = useState("");

  const generateKey = (sender, receiver) => {
    const combined = `${sender.trim()}:${receiver.trim()}`;
    return CryptoJS.SHA256(combined).toString();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const receiverName = localStorage.getItem("imuser");

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
        setFileContent(json);
        notify("File decrypted successfully ✅");
      } catch (error) {
        console.error("Decrypt/parse error:", error);
        notify("Failed to decrypt or parse the file. Check both usernames.");
        setFileContent(null);
      }
    };

    reader.readAsText(file);
  };

  const addData = () => {
    if (!fileContent) return;

    const existingData = JSON.parse(localStorage.getItem("websiteData")) || [];
    const newFileContent = Array.isArray(fileContent) ? fileContent : [fileContent];

    const combinedData = [...existingData, ...newFileContent];
    localStorage.setItem("websiteData", JSON.stringify(combinedData));

    setDisplay(false);
    refresh();
    notify(`${newFileContent.length} links added. Total: ${combinedData.length}`);
  };

  const replaceData = () => {
    if (!fileContent) return;

    const newFileContent = Array.isArray(fileContent) ? fileContent : [fileContent];
    localStorage.setItem("websiteData", JSON.stringify(newFileContent));

    setDisplay(false);
    refresh();
    notify(`${newFileContent.length} links replaced existing ones.`);
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
          Import links <FontAwesomeIcon icon={faLink} />
        </h2>

        <input
          type="file"
          accept=".txt,.json"
          onChange={handleFileChange}
          id="fileInput"
          className="hidden-file-input"
        />

        {fileContent && (
          <SyntaxHighlighter
            className="code"
            language="json"
            style={coldarkDark}
            showLineNumbers
          >
            {JSON.stringify(fileContent, null, 2)}
          </SyntaxHighlighter>
        )}

        <div className="btbox">
          <input
            className="inputRN"
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="Sender's username"
          />

          <label htmlFor="fileInput" className="custom-file-label">
            Choose File <FontAwesomeIcon icon={faFileCode} />
          </label>

          <button onClick={addData} disabled={!fileContent}>
            Add <FontAwesomeIcon icon={faFileCirclePlus} />
          </button>

          <button onClick={replaceData} disabled={!fileContent}>
            Replace <FontAwesomeIcon icon={faReplyAll} />
          </button>
        </div>
      </div>
    </div>
  );
}
