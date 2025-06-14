// components/ToastMessage.jsx
import { useEffect, useState } from "react";

export default function ToastMessage({ message, onClose, duration = 4000 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 500); // correspond à la durée de la transition
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, onClose, duration]);

  if (!message) return null;

  return (
    <>
      <div
        className={`toast-message ${visible ? "show" : "hide"}`}
        style={{ zIndex: 1055 }}
      >
        {message}
      </div>
      <style>
        {`
          .toast-message {
            position: fixed;
            top: 0;
            left: 50%;
            transform: translateX(-50%) translateY(-20px);
            margin-top: 1rem;
            padding: 0.75rem 1rem;
            background-color: #dc3545; /* Bootstrap danger */
            color: white;
            border-radius: 0.5rem;
            box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15);
            opacity: 0;
            transition: opacity 0.5s ease, transform 0.5s ease;
          }

          .toast-message.show {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }

          .toast-message.hide {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
        `}
      </style>
    </>
  );
}
