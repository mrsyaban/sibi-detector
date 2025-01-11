import { useState, useEffect } from 'react';

const useMobile = () => {
  const [screenWidth, setScreenWidth] = useState(0);

  useEffect(() => {
    // Check if the code is running on the client side
    const handleResize = () => setScreenWidth(window.innerWidth);
    
    // Initial setting of the screen width
    handleResize();

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenWidth <= 1024; // pengaturan interface pada mobile web agar interface mobile web tidak berantakan 
};

export default useMobile;
