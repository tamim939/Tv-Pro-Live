import React from "react";
import { Play } from "lucide-react";
import { motion } from "motion/react";
import { APP_LOGO } from "../config";

export default function Splash() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] bg-[#080c14] flex flex-col items-center justify-center gap-6"
    >
      <motion.div
        initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 12, stiffness: 200 }}
        className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-400 rounded-[24px] flex items-center justify-center shadow-[0_18px_55px_rgba(34,197,94,0.4)]"
      >
        <Play className="w-9 h-9 text-white fill-current translate-x-0.5" />
      </motion.div>
      
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-black tracking-widest text-white uppercase"
        >
          Tv<span className="text-green-500"> Pro Live</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-xs tracking-[0.2em] text-gray-400 uppercase mt-2"
        >
          Premium Sports & TV Streaming
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="w-44 h-[3px] bg-white/10 rounded-full overflow-hidden"
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-green-500 to-green-400"
        />
      </motion.div>
    </motion.div>
  );
}
