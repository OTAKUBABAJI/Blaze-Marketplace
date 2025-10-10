export const fadeIn = (direction = "up", delay = 0) => ({
  hidden: {
    opacity: 0,
    y: direction === "up" ? 20 : direction === "down" ? -20 : 0,
    x: direction === "left" ? 20 : direction === "right" ? -20 : 0
  },
  show: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: { type: "tween", duration: 0.5, delay, ease: "easeOut" }
  }
});