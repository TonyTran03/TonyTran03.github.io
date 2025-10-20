import React from 'react';

export default function ModeToggle({ onToggle, isDayMode }) {
    return (
        <button 
            onClick={onToggle} 
            className="dock-icon-toggle"
            style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.5rem',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            aria-label={isDayMode ? 'Switch to Night Mode' : 'Switch to Day Mode'}
        >
            {isDayMode ? '🌙' : '☀️'}
        </button>
    );
}
