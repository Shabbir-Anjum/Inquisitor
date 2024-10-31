"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, List, Brain, Settings, User, Menu, X } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/utils/auth";
import Lottie from 'react-lottie';

export const Header = () => {
  const auth = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [animationData, setAnimationData] = useState(null);

  const handleLogout = async (e) => {
    e.preventDefault();
    await auth.logout();
    setIsMenuOpen(false);
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: null,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  useEffect(() => {
    fetch('https://lottie.host/ea982e1a-4684-4774-a38a-af3c9c5b2955/xTvpGD0eYA.json')
      .then(response => response.json())
      .then(data => setAnimationData(data));
  }, []);

  return (
    <header className="absolute top-0 left-0 right-0 z-20 bg-black bg-opacity-20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/">
            <div className="flex items-center gap-2">
              <Lottie options={{ ...defaultOptions, animationData }} height={40} width={40} />
              <span className="text-lg md:text-xl font-bold">Inquisitor</span>
            </div>
          </Link>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              <li><Link href="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
              <li><Link href="/features" className="hover:text-blue-400 transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-blue-400 transition-colors">Pricing</Link></li>
              <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Contact</Link></li>
              {auth.loading ? (
                <li><div>...</div></li>
              ) : (
                <>
                  {auth?.user ? (
                    <li>
                      <button onClick={handleLogout} className="hover:text-blue-400 transition-colors">
                        Logout
                      </button>
                    </li>
                  ) : (
                    <>
                      <li><Link href="/register" className="hover:text-blue-400 transition-colors">Sign up</Link></li>
                      <li><Link href="/login" className="hover:text-blue-400 transition-colors">Login</Link></li>
                    </>
                  )}
                </>
              )}
            </ul>
          </nav>
        </div>

        {/* Mobile Navigation */}
        <nav className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} mt-4`}>
          <ul className="flex flex-col space-y-4">
            <li><Link href="/" className="block hover:text-blue-400 transition-colors" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
            <li><Link href="/features" className="block hover:text-blue-400 transition-colors" onClick={() => setIsMenuOpen(false)}>Features</Link></li>
            <li><Link href="/pricing" className="block hover:text-blue-400 transition-colors" onClick={() => setIsMenuOpen(false)}>Pricing</Link></li>
            <li><Link href="/contact" className="block hover:text-blue-400 transition-colors" onClick={() => setIsMenuOpen(false)}>Contact</Link></li>
            {auth.loading ? (
              <li><div>...</div></li>
            ) : (
              <>
                {auth?.user ? (
                  <li>
                    <button onClick={handleLogout} className="block w-full text-left hover:text-blue-400 transition-colors">
                      Logout
                    </button>
                  </li>
                ) : (
                  <>
                    <li><Link href="/register" className="block hover:text-blue-400 transition-colors" onClick={() => setIsMenuOpen(false)}>Sign up</Link></li>
                    <li><Link href="/login" className="block hover:text-blue-400 transition-colors" onClick={() => setIsMenuOpen(false)}>Login</Link></li>
                  </>
                )}
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export const Footer = () => (
  <footer className="absolute bottom-0 left-0 right-0 z-20 bg-black bg-opacity-20">
    <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
      <div className="text-xs md:text-sm">© 2024 Inquisitor. All rights reserved.</div>
      <div className="flex space-x-4">
        <Link href="/settings" className="hover:text-blue-400 transition-colors">
          <Settings size={18} />
        </Link>
        <Link href="/profile" className="hover:text-blue-400 transition-colors">
          <User size={18} />
        </Link>
      </div>
    </div>
  </footer>
);

const SimplifiedAIAssistantPage = () => {
  const auth = useAuth();

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const slideIn = {
    hidden: { opacity: 0, x: -50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed relative text-white flex items-center"
      style={{ backgroundImage: 'url("/1.webp")' }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      <Header auth={auth} />

      <div className="relative z-10 container mx-auto px-4 py-20">
        <motion.div 
          className="max-w-2xl lg:ml-0 lg:mr-auto"
          initial="hidden"
          animate="visible"
          variants={slideIn}
        >
          <motion.h1
            className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 text-center lg:text-left"
            variants={fadeIn}
          >
            Transform Your Hiring Process with AI-Powered Interviews
          </motion.h1>

          <motion.p
            className="text-sm md:text-base mb-6 md:mb-8 text-center lg:text-left"
            variants={fadeIn}
          >
            Create sophisticated AI interview agents tailored to your company needs. Train them with your organization knowledge, job requirements, and evaluation criteria to conduct consistent, unbiased, and thorough candidate assessments at scale.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center lg:justify-start"
            variants={fadeIn}
          >
            <Link href="/setup-assistant" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 md:py-3 px-4 md:px-6 rounded-full flex items-center justify-center shadow-lg transition-colors"
              >
                <Plus className="mr-2" size={18} />
                <span className="text-sm md:text-base">Create Assistant</span>
              </motion.button>
            </Link>
            <Link href="/assistants" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 md:py-3 px-4 md:px-6 rounded-full flex items-center justify-center shadow-lg transition-colors"
              >
                <List className="mr-2" size={18} />
                <span className="text-sm md:text-base">View Assistants</span>
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default SimplifiedAIAssistantPage;