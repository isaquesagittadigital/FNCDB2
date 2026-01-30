
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogoFull, LogoIcon } from './Logo';

interface SplashScreenProps {
  showText: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ showText }) => {
  return (
    <div className="flex items-center justify-center w-full h-full bg-[#002B49]">
      <div className="flex items-center gap-4">
        <AnimatePresence mode="wait">
          {!showText ? (
            <motion.div
              key="icon"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <LogoIcon className="w-16 h-16 md:w-20 md:h-20" />
            </motion.div>
          ) : (
            <motion.div
              key="full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.6, ease: "easeOut" }}
            >
              <LogoFull dark={false} className="h-12 md:h-16" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SplashScreen;
