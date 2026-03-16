import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import splashBg from '@/assets/splash-bg.png';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 400);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-card"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col items-center gap-4"
        >
          <span className="font-display text-6xl italic text-primary tracking-tight">AS</span>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center">
            Alehegne Sewnet Apartment
          </h1>
          <p className="text-xs tracking-[0.3em] uppercase text-primary font-semibold">
            Sophistication & Excellence
          </p>
          <p className="text-muted-foreground text-sm mt-2">Welcome to the pinnacle of luxury living</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 w-64 md:w-80"
        >
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span className="uppercase tracking-widest">Initializing</span>
            <span className="text-primary font-semibold">{progress}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>
        </motion.div>

        <p className="absolute bottom-6 text-xs text-muted-foreground">
          © 2024 AS Residential Group
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
