import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer style={{ padding: '20px', background: '#333', color: 'white', textAlign: 'center', marginTop: 'auto' }}>
      <p>© {new Date().getFullYear()} Health Management App. All rights reserved.</p>
    </footer>
  );
};

export default Footer;