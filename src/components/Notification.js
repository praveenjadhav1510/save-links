import React from "react";
import "./notification.css";

/**
 * Renders a vertical stack of notifications.
 * Each item in props.queue is: { id, message, color }
 * Dismissal is handled by App via props.dismiss(id).
 */
export default function Notification({ queue = [], dismiss }) {
  return (
    <div className="notif-stack">
      {queue.map((notif) => (
        <div
          key={notif.id}
          className="notBox"
          style={{
            background: notif.color + "95",
            boxShadow: "0px 0px 20px " + notif.color,
          }}
          onAnimationEnd={() => dismiss(notif.id)}
        >
          <div>{notif.message}</div>
        </div>
      ))}
    </div>
  );
}
