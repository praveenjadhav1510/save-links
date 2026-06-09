import React, { useEffect } from "react";
import "./sorter.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeadphones,
  faHouse,
  faPlay,
  faScrewdriverWrench,
  faXmark,
  faGamepad,
  faBlog,
  faCloudArrowDown,
  faLock,
} from "@fortawesome/free-solid-svg-icons";

export default function SortCards({ sortDisplay, setSortDisplay, sortType, setSortType }) {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") setSortDisplay(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [setSortDisplay]);

  return (
    <div className={`Card-sorter redesigned ${sortDisplay ? "visible" : ""}`}>
      <div className="sorter-header">
        <span>Filters</span>
        <FontAwesomeIcon icon={faXmark} className="close-sorter" onClick={() => setSortDisplay(false)} />
      </div>

      <div className="sorter-grid">
        <div
          className={`sorter-item ${sortType === "WebPage" ? "active" : ""}`}
          onClick={() => setSortType("WebPage")}
        >
          <FontAwesomeIcon icon={faHouse} className="icon" />
          <span className="label">All</span>
        </div>

        <div
          className={`sorter-item ${sortType === "Tool" ? "active" : ""}`}
          onClick={() => setSortType("Tool")}
        >
          <FontAwesomeIcon icon={faScrewdriverWrench} className="icon" />
          <span className="label">Tools</span>
        </div>

        <div
          className={`sorter-item ${sortType === "AI" ? "active" : ""}`}
          onClick={() => setSortType("AI")}
        >
          <span className="icon-text">AI</span>
          <span className="label">AI</span>
        </div>

        <div
          className={`sorter-item multi ${sortType === "Multimedia" ? "active" : ""}`}
          onClick={() => setSortType("Multimedia")}
        >
          <div className="icon-stack">
            <FontAwesomeIcon icon={faHeadphones} />
            <FontAwesomeIcon icon={faPlay} />
          </div>
          <span className="label">Media</span>
        </div>

        <div
          className={`sorter-item ${sortType === "Games" ? "active" : ""}`}
          onClick={() => setSortType("Games")}
        >
          <FontAwesomeIcon icon={faGamepad} className="icon" />
          <span className="label">Games</span>
        </div>

        <div
          className={`sorter-item ${sortType === "Blogs" ? "active" : ""}`}
          onClick={() => setSortType("Blogs")}
        >
          <FontAwesomeIcon icon={faBlog} className="icon" />
          <span className="label">Blogs</span>
        </div>

        <div
          className={`sorter-item ${sortType === "D-Link" ? "active" : ""}`}
          onClick={() => setSortType("D-Link")}
        >
          <FontAwesomeIcon icon={faCloudArrowDown} className="icon" />
          <span className="label">Files</span>
        </div>

        <div
          className={`sorter-item ${sortType === "Private" ? "active" : ""}`}
          onClick={() => setSortType("Private")}
        >
          <FontAwesomeIcon icon={faLock} className="icon" />
          <span className="label">Private</span>
        </div>
      </div>
    </div>
  );
}
