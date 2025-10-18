import React, { createContext, useContext, useState } from 'react';

const ParticlesConnectionContext = createContext();

export const ParticlesConnectionProvider = ({ children }) => {
    const [showConnections, setShowConnections] = useState(false);

    const toggleConnections = () => {
        const newValue = !showConnections;
        console.log('Toggling connections to:', newValue);
        setShowConnections(newValue);
        
        // Dispatch custom event for particles to listen to
        const event = new CustomEvent('toggleParticleConnections', {
            detail: { showConnections: newValue }
        });
        window.dispatchEvent(event);
        console.log('Event dispatched:', event);
    };

    return (
        <ParticlesConnectionContext.Provider value={{ showConnections, toggleConnections }}>
            {children}
        </ParticlesConnectionContext.Provider>
    );
};

export const useParticlesConnection = () => useContext(ParticlesConnectionContext);
