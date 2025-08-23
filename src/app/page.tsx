"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function HomePage() {
  return (
    <div
      className="relative w-full h-screen flex items-center justify-center"
      style={{
        backgroundImage: "url('/images/lnk.jpg')", // Place your image in public/images
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      

      {/* Content */}
      <div className="relative z-10 text-center px-6">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Image
            src="/images/logo.jpg"
            alt="Event Logo"
            width={120}
            height={120}
            className="mx-auto mb-4 rounded-full"
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg"
        >
          Mister and Miss Linggo ng Kabataan 2025
        </motion.h1>

        {/* Login Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-8"
        >

          <button className="px-12 py-4 rounded-full bg-[#1ED760] font-bold text-white tracking-widest uppercase transform hover:scale-105 hover:bg-[#21e065] transition-colors duration-200" onClick={() => (window.location.href = "/login")}>
            Login
          </button>
        </motion.div>
      </div>
    </div>
  );
}
