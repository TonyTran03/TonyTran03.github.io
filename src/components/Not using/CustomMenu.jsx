import React from 'react';
import Typography from '@mui/material/Typography';

const CustomMenu = () => {
  const menuItems = ["HOME", "ABOUT", "PROJECTS", "EXTRAS"];

  return (
    <div style={menuContainerStyle}>
      {menuItems.map((item, index) => (
        <Typography
          key={index}
          variant="h2"
          sx={menuItemStyle}
        >
          {item}
        </Typography>
      ))}
    </div>
  );
};

const menuContainerStyle = {
  display: 'fixed',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh', // Full screen height
  position: 'sticky',
  
};

const menuItemStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  fontFamily: 'Bebas Neue, sans-serif',
  '-webkit-text-stroke': '2px #000',
  '-webkit-text-fill-color': 'transparent',
  fontSize: '3rem',
  margin: '1rem 0', // Spacing between items
};

export default CustomMenu;
