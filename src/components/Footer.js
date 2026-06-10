import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLink,
  faCodeFork,
  faPaperPlane,
  faSquareArrowUpRight,
} from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

import "./Footer.css";

export default function Footer() {
  return (
    <div className="footer">
      <a href="https://github.com/praveenjadhav1510" target="_blank" rel="noreferrer">
        <FontAwesomeIcon icon={faGithub} /> Github
      </a>
      <a href="https://github.com/praveenjadhav1510/save-links" target="_blank" rel="noreferrer">
        <FontAwesomeIcon icon={faLink} /> App repo
      </a>
      <a href="https://github.com/praveenjadhav1510/save-links/fork" target="_blank" rel="noreferrer">
        <FontAwesomeIcon icon={faCodeFork} /> Fork
      </a>
      <a href="mailto:praveenjadhav1510+githubSavelinks@gmail.com?subject=Feedback%20for%20Savelinks&amp;body=%3C--Your%20feedback--%3E">
        <FontAwesomeIcon icon={faPaperPlane} /> Feedback
      </a>
      <a href="https://favicon-api-rho.vercel.app/" target="_blank" rel="noreferrer">
        <FontAwesomeIcon icon={faSquareArrowUpRight} /> Favicon API
      </a>
    </div>
  );
}
