import React from "react";
import { Dock, DockIcon } from "@/components/magicui/dock";
import ModeToggle from "../components/ModeToggle";
import { useTheme } from "./ThemeContext.jsx";

const Icons = {
  gitHub: (props) => (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M12 .5C5.656.5.5 5.656.5 12a11.493 11.493 0 008.196 11.008c.599.111.82-.261.82-.579 0-.287-.01-1.05-.015-2.06-3.338.725-4.042-1.61-4.042-1.61-.544-1.381-1.33-1.748-1.33-1.748-1.088-.744.083-.729.083-.729 1.204.085 1.837 1.235 1.837 1.235 1.069 1.832 2.805 1.303 3.488.996.108-.774.419-1.304.762-1.605-2.664-.305-5.467-1.332-5.467-5.93 0-1.31.468-2.382 1.235-3.223-.124-.304-.535-1.528.117-3.182 0 0 1.008-.323 3.301 1.23a11.495 11.495 0 016.001 0c2.291-1.553 3.298-1.23 3.298-1.23.654 1.654.243 2.878.119 3.182.77.841 1.235 1.913 1.235 3.223 0 4.61-2.807 5.623-5.479 5.922.431.372.812 1.103.812 2.223 0 1.606-.015 2.896-.015 3.286 0 .32.218.694.826.576A11.5 11.5 0 0023.5 12C23.5 5.656 18.344.5 12 .5z"
      />
    </svg>
  ),
  linkedin: (props) => (
    <svg viewBox="0 0 448 512" {...props}>
      <path
        fill="currentColor"
        d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"
      />
    </svg>
  ),
  spotify: (props) => (
    <svg viewBox="0 0 496 512" {...props}>
      <path
        fill="currentColor"
        d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm108.7 359.6a16 16 0 01-22 5.3c-60.7-37.2-136.8-45.6-226-24.7a16 16 0 01-18.9-11.4 16 16 0 0111.4-18.9c98.9-23.3 183.2-13.3 251.7 29.9a16 16 0 015.8 19.8zM352 301.5a16 16 0 01-22 5.4c-52.8-32.1-133.4-41.5-195.6-22.5a16 16 0 01-20-11 16 16 0 0111-20c70.3-21.4 159.1-11.2 219.4 26.9a16 16 0 015.2 21zM374.6 241a16 16 0 01-21.9 5.7c-45.8-27.9-116.1-34-168.5-18.5a16 16 0 01-20.1-10.9 16 16 0 0110.9-20.1c61-17.6 140.7-10.8 195.8 22.5A16 16 0 01374.6 241z"
      />
    </svg>
  ),
};

export function DockBar() {
  const { isDayMode, toggleMode } = useTheme();

  // Adaptive colors
  const spotifyColor = isDayMode ? "#1DB954" : "#1ED760";
  const iconColor = isDayMode ? "#111" : "#f5f5f5";

  return (
    <div className="relative">
      <Dock direction="middle">
        <DockIcon>
          <a
            href="https://github.com/TonyTran03"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icons.gitHub
              className="w-5 h-5 sm:w-6 sm:h-6"
              style={{ color: iconColor }}
            />
          </a>
        </DockIcon>

        <DockIcon>
          <a
            href="https://www.linkedin.com/in/tony-tran-a08b8a230/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icons.linkedin
              className="w-5 h-5 sm:w-6 sm:h-6"
              style={{ color: iconColor }}
            />
          </a>
        </DockIcon>

        <DockIcon>
          <a
            href="https://open.spotify.com/user/m9ckbj8yi65yt3az5iowj9dah?si=2dff65c74bdb49b8"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icons.spotify
              className="w-5 h-5 sm:w-6 sm:h-6"
              style={{ color: spotifyColor }}
            />
          </a>
        </DockIcon>

        <ModeToggle onToggle={toggleMode} isDayMode={isDayMode} />
      </Dock>
    </div>
  );
}
