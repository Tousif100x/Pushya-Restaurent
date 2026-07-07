"use client";

import { motion, HTMLMotionProps, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

export const FadeIn = ({
  children,
  delay = 0,
  duration = 0.5,
  ...props
}: { children: ReactNode; delay?: number; duration?: number } & HTMLMotionProps<"div">) => {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : duration, delay: shouldReduceMotion ? 0 : delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const SlideUp = ({
  children,
  delay = 0,
  duration = 0.5,
  y = 20,
  ...props
}: { children: ReactNode; delay?: number; duration?: number; y?: number } & HTMLMotionProps<"div">) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : duration, delay: shouldReduceMotion ? 0 : delay, type: "spring", stiffness: 100 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const StaggerContainer = ({
  children,
  delayChildren = 0.2,
  staggerChildren = 0.1,
  ...props
}: { children: ReactNode; delayChildren?: number; staggerChildren?: number } & HTMLMotionProps<"div">) => {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: shouldReduceMotion ? 0 : staggerChildren,
            delayChildren: shouldReduceMotion ? 0 : delayChildren,
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
};

export const StaggerItem = ({ children, y = 20, ...props }: { children: ReactNode, y?: number } & HTMLMotionProps<"div">) => {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: shouldReduceMotion ? 0 : y },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, duration: shouldReduceMotion ? 0 : undefined } },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};
