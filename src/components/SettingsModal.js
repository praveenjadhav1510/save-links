import React, { useEffect, useState, useRef } from "react";
import "./SettingsModal.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faGear } from "@fortawesome/free-solid-svg-icons";

export default function SettingsModal({ isOpen, onClose, settings, setSettings }) {
  const [tempBgColor, setTempBgColor] = useState(settings.customBgColor);
  const [tempIconColor, setTempIconColor] = useState(settings.customIconColor);
  const saveTimeoutRef = useRef(null);

  const bgPresets = [
    "#e7e7e7", "#121212", "#fafafa", "#18181b", 
    "#f0f4f8", "#1e293b", "#f5f3ff", "#2e1065"
  ];

  const iconPresets = [
    "#1e1e1e", "#f5f5f5", "#3b82f6", "#10b981", 
    "#ef4444", "#f59e0b", "#8b5cf6", "#ec4899"
  ];

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Sync local color states when global settings change (e.g. theme toggle or reset)
  useEffect(() => {
    setTempBgColor(settings.customBgColor);
    setTempIconColor(settings.customIconColor);
  }, [settings.customBgColor, settings.customIconColor]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem("saved_links_settings", JSON.stringify(newSettings));
  };

  const updateSettingDebounced = (key, value) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      updateSetting(key, value);
    }, 400); // 400ms debounce
  };

  const handleBgColorTextChange = (e) => {
    const val = e.target.value;
    setTempBgColor(val);
    
    // Apply immediately if blank, valid hex pattern, or general color names
    if (val === "" || val.startsWith("#") || /^[a-zA-Z]+$/.test(val)) {
      document.documentElement.style.setProperty(
        "--bg-color",
        val || (settings.theme === "dark" ? "#121212" : "#e7e7e7")
      );
      updateSettingDebounced("customBgColor", val);
    }
  };

  const handleBgPresetClick = (color) => {
    setTempBgColor(color);
    document.documentElement.style.setProperty("--bg-color", color);
    updateSetting("customBgColor", color);
  };

  const handleIconColorTextChange = (e) => {
    const val = e.target.value;
    setTempIconColor(val);
    
    if (val === "" || val.startsWith("#") || /^[a-zA-Z]+$/.test(val)) {
      document.documentElement.style.setProperty(
        "--icon-color",
        val || (settings.theme === "dark" ? "#f5f5f5" : "#1e1e1e")
      );
      updateSettingDebounced("customIconColor", val);
    }
  };

  const handleIconPresetClick = (color) => {
    setTempIconColor(color);
    document.documentElement.style.setProperty("--icon-color", color);
    updateSetting("customIconColor", color);
  };

  const handleResetBg = () => {
    setTempBgColor("");
    updateSetting("customBgColor", "");
  };

  const handleResetIcon = () => {
    setTempIconColor("");
    updateSetting("customIconColor", "");
  };

  return (
    <>
      <div className={`settings-overlay ${isOpen ? "visible" : ""}`} onClick={onClose}></div>
      <div className={`settings-modal ${isOpen ? "visible" : ""}`}>
        <div className="settings-header">
          <h2>
            <FontAwesomeIcon icon={faGear} /> Settings
          </h2>
          <FontAwesomeIcon icon={faXmark} className="close-settings" onClick={onClose} />
        </div>
        <div className="settings-list">
          {/* Theme setting */}
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-title">Dark Mode</span>
              <span className="setting-desc">Toggle between dark and light themes</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.theme === "dark"}
                onChange={(e) => updateSetting("theme", e.target.checked ? "dark" : "light")}
              />
              <span className="slider"></span>
            </label>
          </div>

          {/* Open link setting */}
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-title">Open in New Tab</span>
              <span className="setting-desc">Open links in a new tab when clicked</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.openInNewTab}
                onChange={(e) => updateSetting("openInNewTab", e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          {/* Background Color setting */}
          <div className="setting-item color-item-vertical">
            <div className="setting-info">
              <span className="setting-title">Background Color</span>
              <span className="setting-desc">Select or enter app background color</span>
            </div>
            <div className="custom-color-picker">
              <div className="color-input-wrapper">
                <span 
                  className="color-preview-circle" 
                  style={{ backgroundColor: tempBgColor || (settings.theme === "dark" ? "#121212" : "#e7e7e7") }}
                ></span>
                <input
                  type="text"
                  value={tempBgColor}
                  placeholder={settings.theme === "dark" ? "#121212" : "#e7e7e7"}
                  onChange={handleBgColorTextChange}
                  className="settings-text-color-input"
                />
                <button 
                  className="color-reset-btn"
                  onClick={handleResetBg}
                  title="Reset to default theme color"
                >
                  Reset
                </button>
              </div>
              <div className="color-presets-grid">
                {bgPresets.map((color) => (
                  <span
                    key={color}
                    className={`preset-circle ${tempBgColor === color ? "active" : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleBgPresetClick(color)}
                    title={color}
                  ></span>
                ))}
              </div>
            </div>
          </div>

          {/* Icon Color setting */}
          <div className="setting-item color-item-vertical">
            <div className="setting-info">
              <span className="setting-title">Icon & Action Color</span>
              <span className="setting-desc">Select or enter navbar icons color</span>
            </div>
            <div className="custom-color-picker">
              <div className="color-input-wrapper">
                <span 
                  className="color-preview-circle" 
                  style={{ backgroundColor: tempIconColor || (settings.theme === "dark" ? "#f5f5f5" : "#1e1e1e") }}
                ></span>
                <input
                  type="text"
                  value={tempIconColor}
                  placeholder={settings.theme === "dark" ? "#f5f5f5" : "#1e1e1e"}
                  onChange={handleIconColorTextChange}
                  className="settings-text-color-input"
                />
                <button 
                  className="color-reset-btn"
                  onClick={handleResetIcon}
                  title="Reset to default theme color"
                >
                  Reset
                </button>
              </div>
              <div className="color-presets-grid">
                {iconPresets.map((color) => (
                  <span
                    key={color}
                    className={`preset-circle ${tempIconColor === color ? "active" : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleIconPresetClick(color)}
                    title={color}
                  ></span>
                ))}
              </div>
            </div>
          </div>

          {/* Card Density setting */}
          <div className="setting-item select-item">
            <div className="setting-info">
              <span className="setting-title">Card Layout Density</span>
              <span className="setting-desc">Choose the size of the link cards</span>
            </div>
            <select
              value={settings.cardDensity}
              onChange={(e) => updateSetting("cardDensity", e.target.value)}
              className="settings-select"
            >
              <option value="compact">Compact</option>
              <option value="comfortable">Comfortable</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>
      </div>
    </>
  );
}
