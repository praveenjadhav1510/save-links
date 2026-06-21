import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faFileImport,
  faFileExport,
  faTrash,
  faSort,
  faDice,
  faMagnifyingGlass,
  faXmark,
  faInfo
} from "@fortawesome/free-solid-svg-icons";

import ExportJson from "./ExportJson";
import ImportJson from "./ImportJson";
import CATEGORY_LABELS from "./CategoryLabels";
import { SORT_FILTERS } from "../constants";

import "./NavBar.css";

export default function NavBar({
  setIsUserModalOpen,
  setIsDeleteMode,
  refreshData,
  user,
  notify,
  setSortDisplay,
  isDraggable,
  setIsDraggable,
  isEditMode,
  setIsEditMode,
  sortType,
  setSortType,
  searchQuery,
  setSearchQuery,
  setIsShortcutsModalOpen,
  setImportVisible,
  setExportVisible,
  importVisible,
  exportVisible,
  isDeleteMode,
  searchInputRef,
  isOnline,
}) {
  const currentIndex = SORT_FILTERS.indexOf(sortType);
  const prevIndex = (currentIndex - 1 + SORT_FILTERS.length) % SORT_FILTERS.length;
  const nextIndex = (currentIndex + 1) % SORT_FILTERS.length;

  const getLabel = (type) => (type === "WebPage" ? "All" : CATEGORY_LABELS[type] || type);

  const toggleDelete = () => {
    const nextState = !isDeleteMode;
    setIsDeleteMode(nextState);
    // If turning delete ON, turn edit OFF
    if (nextState && isEditMode) {
      setIsEditMode(false);
    }
  };

  return (
    <>
      <div className="header">
        <div className="userbox">
          <div className="tooltip-container">
            <FontAwesomeIcon
              icon={faPenToSquare}
              className="edit"
              onClick={() => setIsUserModalOpen(true)}
            />
            <span className="tooltip">Edit Identity</span>
          </div>
          <span className="user-name-text">
            {user}'s links
            {!isOnline && <span className="offline-badge">Offline</span>}
          </span>
        </div>

        <div className="filter-nav-navbar">
          <span className="filter-nav-item side" onClick={() => setSortType(SORT_FILTERS[prevIndex])}>
            {getLabel(SORT_FILTERS[prevIndex])}
          </span>
          <span className="filter-nav-item current">
            {getLabel(SORT_FILTERS[currentIndex])}
          </span>
          <span className="filter-nav-item side" onClick={() => setSortType(SORT_FILTERS[nextIndex])}>
            {getLabel(SORT_FILTERS[nextIndex])}
          </span>
        </div>

        <div className="search-container">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />
          <input
            type="text"
            placeholder="Search links..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            ref={searchInputRef}
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
          <div
            className="tooltip-container info-btn"
            onClick={() => setIsShortcutsModalOpen(true)}
          >
            <FontAwesomeIcon icon={faInfo} />
            <span className="tooltip help">Help</span>
          </div>

          <div onClick={() => setSortDisplay(true)} className="tooltip-container">
            <FontAwesomeIcon icon={faSort} />
            <span className="tooltip sort">Sort</span>
          </div>
          <div
            className="tooltip-container"
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
            className={`edit-mode-btn tooltip-container ${isEditMode ? "edit-mode-active" : ""}`}
            onClick={() => {
              const nextEditMode = !isEditMode;
              setIsEditMode(nextEditMode);
              if (nextEditMode && isDeleteMode) {
                setIsDeleteMode(false);
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

          <div onClick={toggleDelete} style={{ color: isDeleteMode ? "red" : "black" }} className="tooltip-container">
            <FontAwesomeIcon className="ic" icon={faTrash} />
            <span className="tooltip delete">Trash box</span>
          </div>
          <div onClick={() => setImportVisible(true)} className="tooltip-container">
            <FontAwesomeIcon className="ic fin" icon={faFileImport} />
            <span className="tooltip import">Import</span>
          </div>
          <div onClick={() => setExportVisible(true)} className="tooltip-container">
            <FontAwesomeIcon className="ic fex" icon={faFileExport} />
            <span className="tooltip export">Export</span>
          </div>
        </div>
      </div>

      <ImportJson
        setDisplay={setImportVisible}
        display={importVisible}
        refreshData={refreshData}
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
