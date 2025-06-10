
// import { useLayoutEffect } from "react";
// import { useLocation } from "react-router-dom";

// export default function ScrollToTop() {
//   const { pathname } = useLocation();
  
//   // useLayoutEffect runs synchronously before the browser paints
//   // This ensures scrolling happens before any visual updates
//   useLayoutEffect(() => {
//     window.scrollTo(0, 0);
//   }, [pathname]);
  
//   return null;
// }

import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();
  
  useLayoutEffect(() => {
    // Temporarily disable smooth scrolling
    const html = document.documentElement;
    const body = document.body;
    
    // Store original scroll behavior
    const originalHtmlBehavior = html.style.scrollBehavior;
    const originalBodyBehavior = body.style.scrollBehavior;
    
    // Force auto scroll behavior
    html.style.scrollBehavior = 'auto';
    body.style.scrollBehavior = 'auto';
    
    // Multiple methods to ensure instant scroll
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Force immediate execution
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
    
    // Restore original scroll behavior after a brief moment
    setTimeout(() => {
      html.style.scrollBehavior = originalHtmlBehavior;
      body.style.scrollBehavior = originalBodyBehavior;
    }, 10);
  }, [pathname]);
  
  return null;
}