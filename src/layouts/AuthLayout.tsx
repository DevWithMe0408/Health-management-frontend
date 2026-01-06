import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import loginImage from '../assets/images/auth/login-illustration.jpg';
import registerImage from '../assets/images/auth/register-illustration.jpg';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  footerText?: string;
  footerLink?: {
    text: string;
    to: string;
  };
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title = "Welcome to HealthCare", 
  subtitle = "Sign in by entering information below",
  footerText,
  footerLink 
}) => {
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState<'login' | 'register'>('login');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const newPage = location.pathname === '/register' ? 'register' : 'login';
    if (newPage !== currentPage) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentPage(newPage);
        setIsTransitioning(false);
      }, 150);
    }
  }, [location.pathname, currentPage]);

  const isLogin = currentPage === 'login';
  const currentImage = isLogin ? loginImage : registerImage;

  // Animation variants với hiệu ứng nâng cao
  const slideVariants = {
    initial: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95
    }),
    animate: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        duration: 0.6
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        duration: 0.4
      }
    })
  };

  // Image variants với blur và scale mượt
  const imageVariants = {
    initial: { 
      scale: 1.2, 
      opacity: 0,
      filter: 'blur(20px) brightness(0.8)',
      rotate: 1
    },
    animate: { 
      scale: 1, 
      opacity: 1,
      filter: 'blur(0px) brightness(1)',
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 25,
        delay: 0.3,
        duration: 0.8
      }
    },
    exit: { 
      scale: 1.1, 
      opacity: 0,
      filter: 'blur(15px) brightness(0.6)',
      rotate: -1,
      transition: {
        duration: 0.4,
        ease: "easeInOut"
      }
    }
  };

  // Overlay variants
  const overlayVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        delay: 0.5,
        duration: 0.6
      }
    },
    exit: { 
      opacity: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      <AnimatePresence mode="wait">
        {isLogin ? (
          // LOGIN LAYOUT - Image Left, Form Right
          <motion.div
            key="login"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={slideVariants}
            custom={1}
            className="flex w-full"
          >
            {/* Left Side - Enhanced Background Image */}
            <div className="hidden lg:block relative flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`login-bg-${currentImage}`}
                  variants={imageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${currentImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    backgroundRepeat: 'no-repeat'
                  }}
                >
                  {/* Base gradient overlay */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-blue-600/25 via-blue-500/15 to-indigo-600/35"
                    variants={overlayVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  />
                  
                  {/* Dot pattern overlay */}
                  <motion.div 
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)`,
                      backgroundSize: '30px 30px'
                    }}
                    variants={overlayVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  />
                  
                  {/* Vignette effect */}
                  <motion.div 
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0,0,0,0.1) 100%)`
                    }}
                    variants={overlayVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  />

                  {/* Animated gradient bars */}
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.02) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.02) 75%)`,
                      backgroundSize: '60px 60px'
                    }}
                    animate={{
                      backgroundPosition: ['0px 0px', '60px 60px']
                    }}
                    transition={{
                      duration: 20,
                      ease: "linear",
                      repeat: Infinity
                    }}
                  />

                  {/* Subtle texture overlay */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-t from-black/8 via-transparent to-white/8"
                    variants={overlayVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white/95 backdrop-blur-sm">
              <motion.div 
                className="mx-auto w-full max-w-sm lg:w-96"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  delay: 0.4, 
                  duration: 0.6,
                  type: "spring",
                  stiffness: 200
                }}
              >
                {/* Logo */}
                <div className="mb-8">
                  <Link to="/" className="inline-block">
                    <div className="flex items-center space-x-3">
                      <motion.div 
                        className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg"
                        whileHover={{ 
                          scale: 1.05,
                          boxShadow: "0 10px 25px rgba(34, 197, 94, 0.3)",
                          rotate: 5
                        }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.5 9.5h-4v-4c0-.827-.673-1.5-1.5-1.5h-4c-.827 0-1.5.673-1.5 1.5v4h-4c-.827 0-1.5.673-1.5 1.5v4c0 .827.673 1.5 1.5 1.5h4v4c0 .827.673 1.5 1.5 1.5h4c.827 0 1.5-.673 1.5-1.5v-4h4c.827 0 1.5-.673 1.5-1.5v-4c0-.827-.673-1.5-1.5-1.5z"/>
                        </svg>
                      </motion.div>
                      <div>
                        <h1 className="text-xl font-bold text-gray-900">HealthCare</h1>
                        <p className="text-xs text-gray-500 font-medium">Healthcare Management System</p>
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Welcome Text */}
                <div className="mb-8">
                  <motion.h2 
                    className="text-3xl font-bold text-gray-900 mb-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    {title}
                  </motion.h2>
                  <motion.p 
                    className="text-gray-600 text-base"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                  >
                    {subtitle}
                  </motion.p>
                </div>

                {/* Form Container */}
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  {children}
                </motion.div>

                {/* Footer */}
                {footerText && footerLink && (
                  <motion.div 
                    className="mt-8 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                  >
                    <p className="text-sm text-gray-600">
                      {footerText}{' '}
                      <Link 
                        to={footerLink.to} 
                        className="font-semibold text-green-600 hover:text-green-500 transition-all duration-200 hover:underline"
                      >
                        {footerLink.text}
                      </Link>
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.div>
        ) : (
          // REGISTER LAYOUT - Form Left, Image Right
          <motion.div
            key="register"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={slideVariants}
            custom={-1}
            className="flex w-full"
          >
            {/* Left Side - Form */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white/95 backdrop-blur-sm">
              <motion.div 
                className="mx-auto w-full max-w-sm lg:w-96"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  delay: 0.4, 
                  duration: 0.6,
                  type: "spring",
                  stiffness: 200
                }}
              >
                {/* Logo */}
                <div className="mb-8">
                  <Link to="/" className="inline-block">
                    <div className="flex items-center space-x-3">
                      <motion.div 
                        className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg"
                        whileHover={{ 
                          scale: 1.05,
                          boxShadow: "0 10px 25px rgba(168, 85, 247, 0.3)",
                          rotate: -5
                        }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.5 9.5h-4v-4c0-.827-.673-1.5-1.5-1.5h-4c-.827 0-1.5.673-1.5 1.5v4h-4c-.827 0-1.5.673-1.5 1.5v4c0 .827.673 1.5 1.5 1.5h4v4c0 .827.673 1.5 1.5 1.5h4c.827 0 1.5-.673 1.5-1.5v-4h4c.827 0 1.5-.673 1.5-1.5v-4c0-.827-.673-1.5-1.5-1.5z"/>
                        </svg>
                      </motion.div>
                      <div>
                        <h1 className="text-xl font-bold text-gray-900">HealthCare</h1>
                        <p className="text-xs text-gray-500 font-medium">Healthcare Management System</p>
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Welcome Text */}
                <div className="mb-8">
                  <motion.h2 
                    className="text-3xl font-bold text-gray-900 mb-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    {title}
                  </motion.h2>
                  <motion.p 
                    className="text-gray-600 text-base"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                  >
                    {subtitle}
                  </motion.p>
                </div>

                {/* Form Container */}
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  {children}
                </motion.div>

                {/* Footer */}
                {footerText && footerLink && (
                  <motion.div 
                    className="mt-8 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                  >
                    <p className="text-sm text-gray-600">
                      {footerText}{' '}
                      <Link 
                        to={footerLink.to} 
                        className="font-semibold text-purple-600 hover:text-purple-500 transition-all duration-200 hover:underline"
                      >
                        {footerLink.text}
                      </Link>
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Right Side - Enhanced Background Image */}
            <div className="hidden lg:block relative flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`register-bg-${currentImage}`}
                  variants={imageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${currentImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    backgroundRepeat: 'no-repeat'
                  }}
                >
                  {/* Base gradient overlay với màu purple/pink cho register */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-purple-600/25 via-pink-500/15 to-indigo-600/35"
                    variants={overlayVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  />
                  
                  {/* Dot pattern overlay */}
                  <motion.div 
                    className="absolute inset-0 opacity-25"
                    style={{
                      backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.25) 1px, transparent 0)`,
                      backgroundSize: '25px 25px'
                    }}
                    variants={overlayVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  />
                  
                  {/* Vignette effect */}
                  <motion.div 
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(139,69,19,0.1) 100%)`
                    }}
                    variants={overlayVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  />

                  {/* Animated diagonal stripes */}
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(-45deg, transparent 25%, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.02) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.02) 75%)`,
                      backgroundSize: '50px 50px'
                    }}
                    animate={{
                      backgroundPosition: ['0px 0px', '-50px -50px']
                    }}
                    transition={{
                      duration: 15,
                      ease: "linear",
                      repeat: Infinity
                    }}
                  />

                  {/* Subtle texture overlay */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-t from-purple-900/5 via-transparent to-pink-100/8"
                    variants={overlayVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthLayout;