import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLink,
  faCodeFork,
  faPaperPlane,
  faPenToSquare,
  faFileImport,
  faFileExport,
  faTrash,
  faSort,
  faDice,
  faSquareArrowUpRight,
  faMagnifyingGlass,
  faXmark
} from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

import ExportJson from "./ExportJson";
import ImportJson from "./ImportJson";

import "./Footer.css";

export default function Footer({
  setv,
  del,
  refresh,
  user,
  notify,
  setSortDisplay,
  isDraggable,
  setIsDraggable,
  isEditMode,
  setIsEditMode,
  sortType,
  searchQuery,
  setSearchQuery,
}) {
  const [trashActive, setTrashActive] = useState(false);

  const toggleDelete = () => {
    const nextState = !trashActive;
    setTrashActive(nextState);
    del(nextState);
    // If turning delete ON, turn edit OFF
    if (nextState && isEditMode) {
      setIsEditMode(false);
    }
  };

  const [importVisible, setImportVisible] = useState(false);
  const [exportVisible, setExportVisible] = useState(false);

  return (
    <>
      <div className="header">
        <div className="userbox">
          <FontAwesomeIcon
            icon={faPenToSquare}
            className="edit"
            onClick={() => setv(true)}
          />
          {user}'s links {sortType && <span className="sort-indicator"> / {sortType === "WebPage" ? "All" : sortType}</span>}
        </div>

        <div className="search-container">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />
          <input
            type="text"
            placeholder="Search links..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <FontAwesomeIcon
              icon={faXmark}
              className="search-clear"
              onClick={() => setSearchQuery("")}
            />
          )}
        </div>

        <div className="importbox">
          <div onClick={() => setSortDisplay(true)}>
            <FontAwesomeIcon icon={faSort} />
            <span className="tooltip sort">Sort</span>
          </div>
          <div
            onClick={() => {
              const nextDraggable = !isDraggable;
              setIsDraggable(nextDraggable);
              notify(
                nextDraggable ? "Dragging enabled" : "Dragging disabled",
                nextDraggable ? "#1dff77" : "#1e1e1e"
              );
            }}
            style={{ color: isDraggable ? "#1dff77" : "black" }}
          >
            <FontAwesomeIcon icon={faDice} />
            <span className="tooltip arrange">Arrange</span>
          </div>

          <div
            className={`edit-mode-btn ${isEditMode ? "edit-mode-active" : ""}`}
            onClick={() => {
              const nextEditMode = !isEditMode;
              setIsEditMode(nextEditMode);
              if (nextEditMode && trashActive) {
                setTrashActive(false);
                del(false);
              }
              notify(
                nextEditMode ? "Edit mode on" : "Edit mode off",
                nextEditMode ? "#4fc3f7" : "#1e1e1e"
              );
            }}
            title="Edit cards"
          >
            <FontAwesomeIcon icon={faPenToSquare} />
            <span className="tooltip edit-tooltip">Edit cards</span>
          </div>

          <div onClick={toggleDelete} style={{ color: trashActive ? "red" : "black" }}>
            <FontAwesomeIcon className="ic" icon={faTrash} />
            <span className="tooltip delete">Trash box</span>
          </div>
          <div onClick={() => setImportVisible(true)}>
            <FontAwesomeIcon className="ic fin" icon={faFileImport} />
            <span className="tooltip import">Import</span>
          </div>
          <div onClick={() => setExportVisible(true)}>
            <FontAwesomeIcon className="ic fex" icon={faFileExport} />
            <span className="tooltip export">Export</span>
          </div>
        </div>
      </div>

      <div className="footer">
        <a href="https://github.com/praveenjadhav1510" target="_blank" rel="noreferrer">
          <FontAwesomeIcon icon={faGithub} /> Github
        </a>
        <a href="https://github.com/praveenjadhav1510/save-links" target="_blank" rel="noreferrer">
          <FontAwesomeIcon icon={faLink} /> App repo
        </a>
        <a href="https://github.com/praveenjadhav1510/save-links/fork" target="_blank" rel="noreferrer">
          <FontAwesomeIcon icon={faCodeFork} /> Fork
        </a>
        <a href="mailto:praveenjadhav1510+githubSavelinks@gmail.com?subject=Feedback%20for%20Savelinks&amp;body=%3C--Your%20feedback--%3E">
          <FontAwesomeIcon icon={faPaperPlane} /> Feedback
        </a>
        <a href="https://favicon-api-rho.vercel.app/" target="_blank" rel="noreferrer">
          <FontAwesomeIcon icon={faSquareArrowUpRight} /> Favicon API
        </a>
      </div>

      <ImportJson
        setDisplay={setImportVisible}
        display={importVisible}
        refresh={refresh}
        notify={notify}
      />
      <ExportJson
        setDisplay={setExportVisible}
        display={exportVisible}
        user={user}
        notify={notify}
      />
    </>
  );
}
