import React, { useState, useEffect, useRef, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faXmark, faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import CATEGORY_LABELS from "./CategoryLabels";

const CATEGORIES = [
  "WebPage",
  "AI",
  "Tool",
  "Utility",
  "Development",
  "Design",
  "Multimedia",
  "Games",
  "Blogs",
  "D-Link",
  "Work",
  "Private",
  "Favorites",
];

export default function AddCard({ data, refreshData, notify }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("default.svg");
  const [urlError, setUrlError] = useState(false);
  const [cardColor, setCardColor] = useState("#1e1e1e");
  const [category, setCategory] = useState("WebPage");
  const [loading, setLoading] = useState(false);
  const modalRef = useRef();

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") setAdding(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setAdding(false);
    }
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const addCard = () => {
    if (!isValidUrl(url)) {
      setUrlError(true);
      return;
    }

    const newCard = {
      name,
      url,
      iconUrl: faviconUrl,
      color: cardColor,
      category,
    };

    const updatedData = [...data, newCard];
    localStorage.setItem("saved_links_data", JSON.stringify(updatedData));

    if (name === "deletedata") {
      localStorage.removeItem("saved_links_data");
    }

    // Reset all fields
    setName("");
    setUrl("");
    setCategory("WebPage");
    setFaviconUrl("default.svg");
    setCardColor("#1e1e1e");
    setAdding(false);
    setUrlError(false);

    refreshData();
    notify(name + " created", cardColor);
  };

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
    const timeoutId = setTimeout(() => {
      if (url && isValidUrl(url)) {
        getFavicon();
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [url, getFavicon]);

  return (
    <>
      <div className="floatingAddCard">
        <FontAwesomeIcon
          icon={faPlus}
          className="pic"
          onClick={() => setAdding(true)}
        />
      </div>

      <div className="card add-card-item" onClick={() => setAdding(true)} style={{ backgroundColor: "#1e1e1e" }}>
        <div className="card-icon-container">
          <FontAwesomeIcon icon={faPlus} className="plus" />
        </div>
        <div className="card-name">
          <span>Add New Link</span>
        </div>
      </div>

      {adding && (
        <div className="modal-overlay" onClick={handleBackdropClick}>
          <div className="modal-content" ref={modalRef} style={{ borderTop: `4px solid ${cardColor}` }}>
            <div className="modal-header">
              <h3>Create New Link</h3>
              <FontAwesomeIcon icon={faXmark} className="close-btn" onClick={() => setAdding(false)} title="Close (Esc)" />
            </div>

            <div className="live-preview">
              <div className="card preview-card" style={{ backgroundColor: cardColor, boxShadow: `0px 10px 25px ${cardColor}40` }}>
                <div className="card-icon-container">
                  {loading ? (
                    <FontAwesomeIcon icon={faCircleNotch} spin />
                  ) : (
                    <img src={faviconUrl} alt="icon" onError={() => setFaviconUrl("default.svg")} />
                  )}
                </div>
                <div className="card-name">
                  <span>{name || "Title Preview"}</span>
                </div>
              </div>
            </div>

            <div className="details redesigned">
              <div className="input-group">
                <label>Display Name</label>
                <input
                  type="text"
                  placeholder="e.g., My Portfolio"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addCard(); }}
                />
              </div>

              <div className="input-row">
                <div className="input-group full">
                  <label>Service URL</label>
                  <input
                    type="text"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); setUrlError(false); }}
                    className={urlError ? "error" : ""}
                    onKeyDown={(e) => { if (e.key === "Enter") addCard(); }}
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

              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setAdding(false)}>Cancel</button>
                <button className="btn-save" onClick={addCard} style={{ backgroundColor: cardColor }}>
                  <FontAwesomeIcon icon={faPlus} /> Save Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
