import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Dog, 
  Sparkles, 
  ChevronRight, 
  Shirt, 
  Coffee, 
  Smartphone, 
  MessageSquare 
} from 'lucide-react';
import { playSound } from '../lib/sounds';

export function LandingPage() {
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();

  const handleStart = () => {
    playSound('click');
    navigate('/studio');
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 sm:px-6">
      <header className="mb-8 text-center">
        <h1 
          onClick={() => navigate('/')}
          className="text-4xl font-bold text-brand-brown flex items-center justify-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Dog className="text-brand-coral w-10 h-10" />
          Dog Drop
        </h1>
        <p className="text-brand-brown/60 font-medium">Custom pup merch in seconds</p>
      </header>

      <main className="w-full max-w-2xl flex-1 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex flex-col items-center text-center py-12"
        >
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="bg-brand-coral p-10 rounded-[3rem] shadow-2xl mb-12 relative"
          >
            <Dog className="w-32 h-32 text-white" />
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-4 -right-4 bg-brand-brown text-white p-4 rounded-full shadow-lg"
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>
          </motion.div>

          <h2 className="text-5xl sm:text-6xl font-black text-brand-brown mb-6 tracking-tight leading-tight">
            Limited Edition Merch.<br />
            <span className="text-brand-coral">Starring Your Dog.</span>
          </h2>
          
          <p className="text-xl text-brand-brown/60 mb-12 max-w-lg font-medium leading-relaxed">
            Turn your pup into a high-end streetwear icon. 
            Custom mascots, varsity crests, and premium apparel in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <button
              onClick={handleStart}
              className="flex-1 bg-brand-brown text-white px-10 py-6 rounded-3xl font-bold text-xl shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 group"
            >
              Start Your Drop
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            <div className="flex flex-col items-center gap-2">
              <Shirt className="w-8 h-8" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Apparel</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Coffee className="w-8 h-8" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Lifestyle</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Smartphone className="w-8 h-8" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Tech</span>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="mt-12 flex flex-col items-center gap-4">
        <button 
          onClick={() => {
            playSound('click');
            setShowFeedback(true);
          }}
          className="text-brand-brown/40 hover:text-brand-coral transition-colors flex items-center gap-2 font-bold text-sm uppercase tracking-widest"
        >
          <MessageSquare className="w-4 h-4" /> Share Feedback
        </button>
        <div className="text-brand-brown/30 text-xs font-medium uppercase tracking-widest">
          Made with ❤️ for Dog Lovers
        </div>
      </footer>

      {showFeedback && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-brand-cream w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl relative p-8">
            <button 
              onClick={() => {
                playSound('click');
                setShowFeedback(false);
              }}
              className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-all z-10"
            >
              <MessageSquare className="w-6 h-6" />
            </button>

            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <MessageSquare className="text-brand-coral" /> Share Feedback
            </h3>

            <p className="text-brand-brown/60 mb-6 font-medium">
              How's your experience in the studio? We'd love to hear your thoughts on the designs and the process!
            </p>

            <textarea 
              placeholder="Your thoughts..."
              className="w-full h-32 px-6 py-4 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:border-brand-coral outline-none font-medium transition-all mb-6 resize-none"
            />

            <button 
              onClick={() => {
                playSound('success');
                alert("Thanks for your feedback! (Demo only)");
                setShowFeedback(false);
              }}
              className="w-full bg-brand-coral text-white py-5 rounded-2xl font-bold text-xl shadow-lg hover:bg-brand-orange transition-all flex items-center justify-center gap-2"
            >
              Send Feedback
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

