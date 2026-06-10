import React from "react";
import "./Notification.css";

/**
 * Renders a vertical stack of notifications.
 * Each item in props.queue is: { id, message, color }
 * Dismissal is handled by App via props.dismiss(id).
 */
export default function Notification({ queue = [], dismiss }) {
  return (
    <div className="notif-stack">
      {queue.map((notif, index) => {
        // Position relative to the newest (last in queue)
        const position = queue.length - 1 - index;
        
        return (
          <div
            key={notif.id}
            className="notif-anim-container"
            onAnimationEnd={() => dismiss(notif.id)}
          >
            <div
              className="notification-item"
              style={{
                background: notif.color + "95", // Back to original opacity
                boxShadow: "0px 0px 20px " + notif.color, // Back to original shadow
                transform: `translateY(${-position * 10}px) scale(${1 - position * 0.05})`,
                zIndex: 100 - position,
                opacity: position > 2 ? 0 : 1,
                filter: `blur(${position * 2}px)`,
              }}
            >
              <div>{notif.message}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
