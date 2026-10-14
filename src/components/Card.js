import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmarkCircle, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import EditCard from "./EditCard";
import { resolveIconUrl } from "../utils/getFavicon";

export default function Card({
  id,
  name,
  url,
  iconUrl: initialIconUrl,
  color,
  category,
  sortType,
  isDeleteMode,
  isEditMode,
  data,
  refreshData,
  notify,
  isDraggable,
  openInNewTab,
}) {
  const [iconUrl, setIconUrl] = useState(initialIconUrl);
  const [isEditing, setIsEditing] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const nameRef = useRef(null);

  useEffect(() => {
    setIconUrl(initialIconUrl);
  }, [initialIconUrl]);

  useEffect(() => {
    const container = nameRef.current;
    if (!container) return;

    const measure = () => {
      const span = container.querySelector("span");
      if (!span) return;
      setIsOverflowing(span.scrollWidth > container.clientWidth + 1);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(container);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure);
    }

    return () => observer.disconnect();
  }, [name]);

  const deleteCard = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const filteredData = data.filter((item) => item.url !== url);
    localStorage.setItem("saved_links_data", JSON.stringify(filteredData));
    refreshData();
    notify("Removed " + name, color);
  };

  const openEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleError = () => setIconUrl("default.svg");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isDraggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    display:
      sortType === "WebPage" || category === sortType
        ? "flex"
        : "none",
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.6 : 1,
    cursor: isDraggable ? "grab" : "pointer",
  };

  const cardData = { name, url, iconUrl: initialIconUrl, color, category };

  return (
    <>
      <a
        ref={setNodeRef}
        href={isDeleteMode || isDraggable ? null : url}
        target={openInNewTab ? "_blank" : "_self"}
        rel="noreferrer"
        style={style}
        className={`card-link ${isDragging ? "dragging" : ""}`}
        {...attributes}
        {...(isDraggable ? listeners : {})}
      >
        <div
          className="card"
          style={{
            background: color,
            boxShadow: `0px 0px 20px ${color}80`,
            position: "relative",
            "--card-color": color,
          }}
        >
          <div className="card-icon-container">
            <img src={resolveIconUrl(iconUrl)} alt="icon" onError={handleError} id="icon" />
          </div>
          <div
            className={`card-name${isOverflowing ? " is-overflowing" : ""}`}
            ref={nameRef}
          >
            <span>{name}</span>
          </div>

          {/* Edit button */}
          <FontAwesomeIcon
            icon={faPenToSquare}
            onClick={openEdit}
            className="edit-mark"
            title="Edit card"
            style={{ display: isEditMode ? "block" : "none" }}
          />

          {/* Delete button */}
          <FontAwesomeIcon
            icon={faXmarkCircle}
            onClick={deleteCard}
            className="x-mark"
            style={{ display: isDeleteMode ? "block" : "none" }}
          />
        </div>
      </a>

      {isEditing && (
        <EditCard
          card={cardData}
          data={data}
          onClose={() => setIsEditing(false)}
          refreshData={refreshData}
          notify={notify}
        />
      )}
    </>
  );
}
