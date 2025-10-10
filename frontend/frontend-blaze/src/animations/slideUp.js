export const slideUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 18, delay }
  }
});

export const fadeIn = (direction = "up", delay = 0) => ({
  hidden: { 
    y: direction === "up" ? 20 : direction === "down" ? -20 : 0,
    x: direction === "left" ? 20 : direction === "right" ? -20 : 0,
    opacity: 0 
  },
  show: { 
    y: 0, 
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 120, damping: 18, delay }
  }
});