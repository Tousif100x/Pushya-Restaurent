"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

export const FadeIn = ({
  children,
  delay = 0,
  duration = 0.5,
  ...props
}: { children: ReactNode; delay?: number; duration?: number } & HTMLMotionProps<"div">) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration, delay }}
    {...props}
  >
    {children}
  </motion.div>
);

export const SlideUp = ({
  children,
  delay = 0,
  duration = 0.5,
  y = 20,
  ...props
}: { children: ReactNode; delay?: number; duration?: number; y?: number } & HTMLMotionProps<"div">) => (
  <motion.div
    initial={{ opacity: 0, y }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration, delay, type: "spring", stiffness: 100 }}
    {...props}
  >
    {children}
  </motion.div>
);

export const StaggerContainer = ({
  children,
  delayChildren = 0.2,
  staggerChildren = 0.1,
  ...props
}: { children: ReactNode; delayChildren?: number; staggerChildren?: number } & HTMLMotionProps<"div">) => (
  <motion.div
    variants={{
      hidden: {},
      show: {
        transition: {
          staggerChildren,
          delayChildren,
        },
      },
    }}
    initial="hidden"
    animate="show"
    {...props}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({ children, y = 20, ...props }: { children: ReactNode, y?: number } & HTMLMotionProps<"div">) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y },
      show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
    }}
    {...props}
  >
    {children}
  </motion.div>
);
