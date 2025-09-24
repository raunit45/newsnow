"use client"

import { PropsWithChildren } from "react"
import { AnimatePresence, motion } from "framer-motion"

export default function PageTransition({ children }: PropsWithChildren) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="page"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}



