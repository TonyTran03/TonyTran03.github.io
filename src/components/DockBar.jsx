import React from "react";
import { Dock, DockIcon } from "@/components/magicui/dock";
import ModeToggle from '../components/ModeToggle';
import { useTheme } from './ThemeContext.jsx'; // Import the custom hook
import { useNavigate } from 'react-router-dom';
import { useParticlesConnection } from './ParticlesConnectionContext';

const Icons = {
  gitHub: (props) => (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M12 .5C5.656.5.5 5.656.5 12a11.493 11.493 0 008.196 11.008c.599.111.82-.261.82-.579 0-.287-.01-1.05-.015-2.06-3.338.725-4.042-1.61-4.042-1.61-.544-1.381-1.33-1.748-1.33-1.748-1.088-.744.083-.729.083-.729 1.204.085 1.837 1.235 1.837 1.235 1.069 1.832 2.805 1.303 3.488.996.108-.774.419-1.304.762-1.605-2.664-.305-5.467-1.332-5.467-5.93 0-1.31.468-2.382 1.235-3.223-.124-.304-.535-1.528.117-3.182 0 0 1.008-.323 3.301 1.23a11.495 11.495 0 016.001 0c2.291-1.553 3.298-1.23 3.298-1.23.654 1.654.243 2.878.119 3.182.77.841 1.235 1.913 1.235 3.223 0 4.61-2.807 5.623-5.479 5.922.431.372.812 1.103.812 2.223 0 1.606-.015 2.896-.015 3.286 0 .32.218.694.826.576A11.5 11.5 0 0023.5 12C23.5 5.656 18.344.5 12 .5z"
      />
    </svg>
  ),
  Linkedin: (props) => (
    <svg viewBox="0 0 448 512" {...props}>
      <path fill="currentColor" d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"/>
    </svg>
  ),
  Folder: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
    </svg>
  ),
  Connect: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="5" r="1" fill="currentColor" />
      <circle cx="18" cy="9" r="1" fill="currentColor" />
      <circle cx="6" cy="9" r="1" fill="currentColor" />
      <circle cx="12" cy="13" r="1" fill="currentColor" />
      <circle cx="18" cy="17" r="1" fill="currentColor" />
      <circle cx="6" cy="17" r="1" fill="currentColor" />
      <line x1="12" y1="5" x2="18" y2="9" />
      <line x1="12" y1="5" x2="6" y2="9" />
      <line x1="18" y1="9" x2="12" y2="13" />
      <line x1="6" y1="9" x2="12" y2="13" />
      <line x1="12" y1="13" x2="18" y2="17" />
      <line x1="12" y1="13" x2="6" y2="17" />
    </svg>
  ),
};

export function DockBar() {
  const { isDayMode, toggleMode } = useTheme(); // Use the theme context
  const navigate = useNavigate();
  const { toggleConnections } = useParticlesConnection();

  return (
    <div className="relative">
      <Dock direction="middle">
        <DockIcon>
          <div className="dock-icon">
            <a href="https://github.com/TonyTran03" target="_blank" rel="noopener noreferrer">
              <Icons.gitHub className="size-6" />
            </a>
          </div>
        </DockIcon>

        <DockIcon>
          <div className="dock-icon">
            <a href="https://www.linkedin.com/in/tony-tran-a08b8a230/" target="_blank" rel="noopener noreferrer">
              <Icons.Linkedin className="size-6" />
            </a>
          </div>
        </DockIcon>

        <DockIcon>
          <div className="dock-icon" onClick={() => navigate('/projects')} style={{ cursor: 'pointer' }}>
            <Icons.Folder className="size-6" />
          </div>
        </DockIcon>

        <DockIcon>
          <div className="dock-icon" onClick={toggleConnections} style={{ cursor: 'pointer' }}>
            <Icons.Connect className="size-6" />
          </div>
        </DockIcon>
        
        <ModeToggle onToggle={toggleMode} isDayMode={isDayMode} />
      </Dock>
    </div>
  );
}
