import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmarkCircle, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import EditCard from "./EditCard";

export default function Card({
  id,
  name,
  url,
  iconUrl: initialIconUrl,
  color,
  pagetype,
  sortType,
  del,
  isEditMode,
  data,
  refresh,
  notify,
  isDraggable,
}) {
  const [iconUrl, setIconUrl] = useState(initialIconUrl);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setIconUrl(initialIconUrl);
  }, [initialIconUrl]);

  const deleteCard = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const filteredData = data.filter((item) => item.url !== url);
    localStorage.setItem("websiteData", JSON.stringify(filteredData));
    refresh();
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
      sortType === "WebPage" || pagetype === sortType
        ? "flex"
        : "none",
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.6 : 1,
    cursor: isDraggable ? "grab" : "pointer",
  };

  const cardData = { name, url, iconUrl: initialIconUrl, color, pagetype };

  return (
    <>
      <a
        ref={setNodeRef}
        href={del || isDraggable ? null : url}
        target="_blank"
        rel="noreferrer"
        style={style}
        className={isDragging ? "dragging" : ""}
        {...attributes}
        {...(isDraggable ? listeners : {})}
      >
        <div
          className="card"
          style={{
            background: color,
            boxShadow: `0px 0px 20px ${color}80`,
            position: "relative",
          }}
        >
          <div className="imgspace">
            <img src={iconUrl} alt="icon" onError={handleError} id="icon" />
          </div>
          <div className="card-name">
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
            style={{ display: del ? "block" : "none" }}
          />
        </div>
      </a>

      {isEditing && (
        <EditCard
          card={cardData}
          data={data}
          onClose={() => setIsEditing(false)}
          refresh={refresh}
          notify={notify}
        />
      )}
    </>
  );
}
