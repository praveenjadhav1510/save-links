import React, { useState, useEffect, useRef, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faCircleNotch,
  faPenToSquare,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import CATEGORY_LABELS from "./CategoryLabels";

const CATEGORIES = [
  "WebPage", "AI", "Tool", "Utility",
  "Development", "Design", "Multimedia", "Games",
  "Blogs", "D-Link", "Work", "Private", "Favorites",
];

export default function EditCard({ card, data, onClose, refreshData, notify }) {
  const [name, setName] = useState(card.name);
  const [url, setUrl] = useState(card.url);
  const [faviconUrl, setFaviconUrl] = useState(card.iconUrl || "default.svg");
  const [cardColor, setCardColor] = useState(card.color || "#1e1e1e");
  const [category, setCategory] = useState(card.category || "WebPage");
  const [urlError, setUrlError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const modalRef = useRef();

  /* ─── close on Escape ─── */
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
  };

  /* ─── URL validation ─── */
  const isValidUrl = (str) => {
    try { new URL(str); return true; } catch { return false; }
  };


  /* ─── auto-fetch favicon when URL changes ─── */
  const getFavicon = useCallback(async () => {
    if (!url || !isValidUrl(url)) return;
    setLoading(true);
    try {
      const response = await fetch(
        "https://favicon-api-rho.vercel.app/api/favicon?x-api-key=3dc7403302f4b8eccbe9465f0aae978c7e2bb661754a71f9e6ad88a81a9a7a0e",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        }
      );
      const resData = await response.json();
      if (resData.success && resData.favicon && resData.favicon.href) {
        setFaviconUrl(resData.favicon.href);
      } else {
        setFaviconUrl("default.svg");
      }
    } catch (error) {
      console.error("Error fetching favicon:", error);
      setFaviconUrl("default.svg");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    const id = setTimeout(() => {
      if (url && isValidUrl(url)) getFavicon();
    }, 500);
    return () => clearTimeout(id);
  }, [url, getFavicon]);

  /* ─── save handler ─── */
  const saveCard = () => {
    if (!isValidUrl(url)) { setUrlError(true); return; }

    const updated = data.map((item) =>
      item.url === card.url
        ? { ...item, name, url, iconUrl: faviconUrl, color: cardColor, category }
        : item
    );

    localStorage.setItem("saved_links_data", JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => {
      refreshData();
      notify(`"${name}" updated`, cardColor);
      onClose();
    }, 500);
  };

  return (
    <div className="modal-overlay edit-card-overlay" onClick={handleBackdropClick}>
      <div
        className="modal-content edit-modal-content"
        ref={modalRef}
        style={{ borderTop: `4px solid ${cardColor}` }}
      >
        {/* ── Header ── */}
        <div className="modal-header">
          <div className="edit-modal-title">
            <div className="edit-title-icon" style={{ background: `${cardColor}33`, color: cardColor }}>
              <FontAwesomeIcon icon={faPenToSquare} />
            </div>
            <h3>Edit Link</h3>
          </div>
          <FontAwesomeIcon
            icon={faXmark}
            className="close-btn"
            onClick={onClose}
            title="Close (Esc)"
          />
        </div>

        {/* ── Live Preview ── */}
        <div className="live-preview">
          <div
            className="card preview-card"
            style={{
              backgroundColor: cardColor,
              boxShadow: `0px 10px 25px ${cardColor}50`,
            }}
          >
            <div className="card-icon-container">
              {loading ? (
                <FontAwesomeIcon icon={faCircleNotch} spin style={{ color: "white" }} />
              ) : (
                <img
                  src={faviconUrl}
                  alt="icon"
                  onError={() => setFaviconUrl("default.svg")}
                />
              )}
            </div>
            <div className="card-name">
              <span>{name || "Title Preview"}</span>
            </div>
          </div>
        </div>

        {/* ── Form ── */}
        <div className="details redesigned">
          {/* Name */}
          <div className="input-group">
            <label>Display Name</label>
            <input
              type="text"
              placeholder="e.g., My Portfolio"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveCard(); }}
            />
          </div>

          {/* URL + Color */}
          <div className="input-row">
            <div className="input-group full">
              <label>Service URL</label>
              <input
                type="text"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setUrlError(false); }}
                className={urlError ? "error" : ""}
                onKeyDown={(e) => { if (e.key === "Enter") saveCard(); }}
              />
              {urlError && <span className="error-msg">Please enter a valid URL</span>}
            </div>
            <div className="input-group color">
              <label>Card</label>
              <input
                className="color-picker"
                type="color"
                value={cardColor}
                onChange={(e) => setCardColor(e.target.value)}
              />
            </div>
          </div>

          {/* Category */}
          <div className="input-group">
            <label>Category / Type</label>
            <div className="tooltype list">
              {CATEGORIES.map((type) => (
                <div
                  key={type}
                  className={`type-chip ${category === type ? "active" : ""}`}
                  onClick={() => setCategory(type)}
                >
                  {CATEGORY_LABELS[type] || type}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button className="btn-cancel" onClick={onClose}>Cancel</button>
            <button
              className={`btn-save edit-save-btn ${saved ? "saved" : ""}`}
              onClick={saveCard}
              style={{ backgroundColor: saved ? "#1dff77" : cardColor }}
            >
              <FontAwesomeIcon icon={saved ? faCheck : faPenToSquare} />
              {saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
