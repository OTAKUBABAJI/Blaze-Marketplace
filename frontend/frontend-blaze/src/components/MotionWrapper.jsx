/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { fadeIn } from "../animations/fadeIn";

export default function MotionWrapper({ children }) {
  return (
    <motion.div initial="hidden" animate="show" variants={fadeIn("up", 0.05)} className="motion-wrap">
      {children}
    </motion.div>
  );
}