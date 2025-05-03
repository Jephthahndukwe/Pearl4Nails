// Fixes for scrolling in the nail challenge game
(function() {
  // Function to ensure scrolling is enabled but prevent double scrollbars
  function fixScrolling() {
    // Remove any scroll-preventing classes
    document.body.classList.remove('body-no-scroll');
    
    // Make only body scrollable, not nested elements
    document.body.style.overflow = 'auto';
    document.body.style.overflowY = 'auto';
    document.body.style.position = 'static';
    document.body.style.height = 'auto';
    
    // Force all containers to not have their own scrollbars
    const containers = document.querySelectorAll('.nail-challenge-container, .force-scroll-container');
    containers.forEach(container => {
      if (container) {
        container.style.overflow = 'visible';
        container.style.overflowY = 'visible';
        container.style.maxHeight = 'none';
      }
    });
    
    // Make sure canvas doesn't have scroll but allows interactions
    const canvasElements = document.querySelectorAll('.nail-canvas');
    canvasElements.forEach(canvas => {
      if (canvas) {
        canvas.style.touchAction = 'none';
      }
    });
  }
  
  // Run immediately
  fixScrolling();
  
  // Then run periodically to ensure scroll is maintained
  setInterval(fixScrolling, 2000);
  
  // Ensure touch events on canvas don't affect page scrolling
  document.addEventListener('touchstart', function(e) {
    if (e.target.closest('.nail-canvas')) {
      // Only prevent default on canvas itself
      e.target.addEventListener('touchmove', function(evt) {
        evt.preventDefault();
      }, { passive: false });
    }
  });
})();
