import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  ChevronRight, 
  RefreshCcw, 
  Download, 
  Dog, 
  Coffee, 
  Shirt, 
  ShoppingBag, 
  Smartphone,
  Sparkles,
  ArrowLeft,
  Send,
  CreditCard,
  Truck,
  ShieldCheck,
  X,
  MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PRODUCTS, THEMES } from '../lib/constants';
import { playSound } from '../lib/sounds';
import type { AppState } from '../types/domain';
import { useMerchGeneration } from '../hooks/useMerchGeneration';

export function Studio() {
  const [state, setState] = useState<AppState>({
    step: 1,
    photo: null,
    dogName: '',
    product: null,
    theme: null,
    customTheme: '',
    showCheckout: false,
    showFeedback: false,
  });

  const [refinePrompt, setRefinePrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const {
    isGenerating,
    loadingMessage,
    error,
    resultImage,
    generateMerch: runGenerateMerch,
    refineMerch,
    setResultImage,
    clearError,
  } = useMerchGeneration();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setState(prev => ({ ...prev, photo: reader.result as string }));
        playSound('upload');
      };
      reader.readAsDataURL(file);
    }
  };

  const nextStep = () => {
    playSound('click');
    setState(prev => ({ ...prev, step: prev.step + 1 }));
  };

  const prevStep = () => {
    playSound('click');
    setState(prev => ({ ...prev, step: Math.max(1, prev.step - 1) }));
  };

  const generateMerch = async () => {
    playSound('click');
    setState(prev => ({ ...prev, step: 4 }));

    await runGenerateMerch({
      product: state.product,
      theme: state.theme,
      customTheme: state.customTheme,
      dogName: state.dogName,
      photo: state.photo,
    });

    if (!error) {
      playSound('success');
    }

    setState(prev => ({ ...prev, step: 5 }));
  };

  const handleRefine = async () => {
    if (!refinePrompt || !resultImage) return;
    playSound('click');
    await refineMerch(refinePrompt);
    setRefinePrompt('');
  };

  const reset = () => {
    playSound('click');
    setResultImage(null);
    clearError();
    setState(prev => ({
      ...prev,
      step: 1,
      product: null,
      theme: null,
      customTheme: '',
      showCheckout: false,
    }));
  };

  const renderProgress = () => {
    if (state.step < 1 || state.step > 4) return null;
    return (
      <div className="w-full max-w-md mx-auto mb-8 px-4">
        <div className="flex justify-between mb-2">
          {[1, 2, 3].map((s) => (
            <div 
              key={s}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                state.step >= s ? 'bg-brand-coral text-white' : 'bg-gray-200 text-gray-400'
              }`}
            >
              {state.step > s ? <Check className="w-5 h-5" /> : s}
            </div>
          ))}
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-brand-coral"
            initial={{ width: 0 }}
            animate={{ width: `${(Math.min(state.step, 3) / 3) * 100}%` }}
          />
        </div>
      </div>
    );
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

      {renderProgress()}

      <main className="w-full max-w-2xl flex-1 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {state.step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex flex-col items-center"
            >
              <div 
                onClick={() => {
                  playSound('click');
                  fileInputRef.current?.click();
                }}
                className="w-full aspect-square max-w-md border-4 border-dashed border-brand-coral/30 rounded-3xl bg-white flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-brand-coral/5 transition-colors group relative overflow-hidden"
              >
                {state.photo ? (
                  <div className="relative w-full h-full">
                    <img src={state.photo} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <div className="bg-green-500 text-white p-2 rounded-full shadow-lg">
                        <Check className="w-6 h-6" />
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          playSound('click');
                          setState(prev => ({ ...prev, photo: null }));
                        }}
                        className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-brand-coral/10 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
                      <Dog className="w-20 h-20 text-brand-coral" />
                    </div>
                    <p className="text-xl font-bold text-brand-brown mb-2 text-center">Drop your dog's photo here 🐾</p>
                    <p className="text-brand-brown/50 mb-6">Or tap to browse</p>
                    <button className="bg-brand-coral text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-brand-orange transition-colors">
                      Choose Photo
                    </button>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              <div className="mt-8 w-full max-w-md">
                <label className="block text-sm font-bold text-brand-brown/60 mb-2 uppercase tracking-wider">Dog's Name (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Buddy"
                  value={state.dogName}
                  onChange={(e) => setState(prev => ({ ...prev, dogName: e.target.value }))}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:border-brand-coral outline-none text-lg font-medium transition-all"
                />
              </div>

              <div className="flex flex-col items-center gap-4 mt-8 w-full">
                {state.photo && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={nextStep}
                    className="bg-brand-brown text-white px-12 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-black transition-all flex items-center gap-2"
                  >
                    Next Step <ChevronRight className="w-5 h-5" />
                  </motion.button>
                )}
                <button 
                  onClick={() => navigate('/')}
                  className="text-brand-brown/50 font-bold flex items-center gap-2 hover:text-brand-brown transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Landing
                </button>
              </div>
            </motion.div>
          )}

          {state.step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full"
            >
              <h2 className="text-3xl font-bold text-center mb-8">What should we put your pup on?</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {PRODUCTS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      playSound('click');
                      setState(prev => ({ ...prev, product: p.id }));
                    }}
                    className={`bg-white p-6 rounded-3xl shadow-sm border-4 transition-all flex flex-col items-center gap-4 hover:shadow-md ${
                      state.product === p.id ? 'border-brand-coral scale-105' : 'border-transparent'
                    }`}
                  >
                    <div className="text-brand-coral">
                      <p.icon className="w-12 h-12" />
                    </div>
                    <div className="text-center">
                      <span className="font-bold text-lg block">{p.id}</span>
                      <span className="text-sm text-brand-brown/50 font-medium">{p.price}</span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex flex-col items-center gap-4 mt-8">
                {state.product && (
                  <button
                    onClick={nextStep}
                    className="bg-brand-brown text-white px-12 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-black transition-all flex items-center gap-2"
                  >
                    Next Step <ChevronRight className="w-5 h-5" />
                  </button>
                )}
                <button onClick={prevStep} className="text-brand-brown/50 font-bold flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Go Back
                </button>
              </div>
            </motion.div>
          )}

          {state.step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full"
            >
              <h2 className="text-3xl font-bold text-center mb-8">Pick a vibe</h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      playSound('click');
                      setState(prev => ({ ...prev, theme: t.id }));
                    }}
                    className={`bg-white p-6 rounded-3xl shadow-sm border-4 transition-all flex flex-col items-center justify-center text-center gap-2 hover:shadow-md min-h-[100px] ${
                      state.theme === t.id ? 'border-brand-coral scale-105' : 'border-transparent'
                    }`}
                  >
                    <span className="font-bold text-lg leading-tight">{t.label}</span>
                  </button>
                ))}
              </div>

              {state.theme === 'Custom' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 w-full max-w-md mx-auto"
                >
                  <label className="block text-sm font-bold text-brand-brown/60 mb-2 uppercase tracking-wider">Describe your vibe</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Cyberpunk Samurai or Space Pirate"
                    value={state.customTheme}
                    onChange={(e) => setState(prev => ({ ...prev, customTheme: e.target.value }))}
                    className="w-full px-6 py-4 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:border-brand-coral outline-none text-lg font-medium transition-all"
                  />
                </motion.div>
              )}

              <div className="flex flex-col items-center gap-4 mt-8">
                {state.theme && (state.theme !== 'Custom' || state.customTheme.trim() !== '') && (
                  <button
                    onClick={generateMerch}
                    className="bg-brand-coral text-white px-12 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-brand-orange transition-all flex items-center gap-2"
                  >
                    Generate <Sparkles className="w-5 h-5" />
                  </button>
                )}
                <button onClick={prevStep} className="text-brand-brown/50 font-bold flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Go Back
                </button>
              </div>
            </motion.div>
          )}

          {state.step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-brand-cream z-50 flex flex-col items-center justify-center p-8 text-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-8"
              >
                <div className="bg-brand-coral p-8 rounded-full shadow-2xl">
                  <Dog className="w-24 h-24 text-white" />
                </div>
              </motion.div>
              <h2 className="text-2xl font-bold text-brand-brown mb-4 h-8">
                {loadingMessage}
              </h2>
              <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mb-8">
                <motion.div 
                  className="h-full bg-brand-coral"
                  animate={{ x: [-256, 256] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <button 
                onClick={() => setState(prev => ({ ...prev, step: 3 }))}
                className="text-brand-brown/40 font-bold hover:text-brand-brown transition-colors"
              >
                Cancel Generation
              </button>
            </motion.div>
          )}

          {state.step === 5 && (resultImage || error) && (
            <motion.div 
              key="step5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full flex flex-col items-center"
            >
              {error ? (
                <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-12 flex flex-col items-center text-center">
                  <div className="bg-red-50 p-6 rounded-full mb-6">
                    <RefreshCcw className="w-16 h-16 text-brand-coral" />
                  </div>
                  <h2 className="text-2xl font-bold text-brand-brown mb-8">
                    {error}
                  </h2>
                  <button 
                    onClick={generateMerch}
                    className="w-full bg-brand-coral text-white py-5 rounded-2xl font-bold text-xl shadow-lg hover:bg-brand-orange transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCcw className="w-6 h-6" /> Try Again
                  </button>
                  <button 
                    onClick={reset}
                    className="mt-4 text-brand-brown/40 font-bold hover:text-brand-brown transition-colors"
                  >
                    Start Over
                  </button>
                </div>
              ) : (
                <>
                  {state.dogName && (
                    <h2 className="text-3xl font-bold mb-6 text-brand-brown">
                      {state.dogName}'s Masterpiece
                    </h2>
                  )}
                  
                  <div className="relative w-full max-w-md aspect-square bg-white rounded-[2rem] shadow-2xl p-4 mb-8 overflow-hidden group">
                    <img 
                      src={resultImage!} 
                      alt="Result" 
                      className="w-full h-full object-contain rounded-2xl"
                    />
                    {isGenerating && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                        <RefreshCcw className="w-12 h-12 text-brand-coral animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="w-full max-w-md space-y-4">
                    <button 
                      onClick={() => {
                        playSound('click');
                        setState(prev => ({ ...prev, showCheckout: true }));
                      }}
                      className="w-full bg-brand-brown text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl hover:bg-black transition-all text-xl"
                    >
                      <ShoppingBag className="w-6 h-6" /> Get This {state.product}
                    </button>

                    <div className="flex gap-4">
                      <a 
                        href={resultImage!} 
                        download={`${state.dogName || 'dog'}-merch.png`}
                        onClick={() => playSound('click')}
                        className="flex-1 bg-brand-coral text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-brand-orange transition-all"
                      >
                        <Download className="w-5 h-5" /> Download
                      </a>
                      <button 
                        onClick={reset}
                        className="flex-1 bg-white border-2 border-brand-brown text-brand-brown py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
                      >
                        <RefreshCcw className="w-5 h-5" /> Start Over
                      </button>
                    </div>

                    <div className="pt-6 border-t border-brand-brown/10">
                      <p className="text-sm font-bold text-brand-brown/60 mb-3 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brand-coral" /> Want to change something?
                      </p>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="e.g. Add a retro filter or make it blue"
                          value={refinePrompt}
                          onChange={(e) => setRefinePrompt(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                          className="w-full pl-6 pr-14 py-4 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:border-brand-coral outline-none font-medium transition-all"
                        />
                        <button 
                          onClick={handleRefine}
                          disabled={!refinePrompt || isGenerating}
                          className="absolute right-2 top-2 bottom-2 aspect-square bg-brand-brown text-white rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-black transition-all"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {!error && (
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ 
                        top: -20, 
                        left: `${Math.random() * 100}%`,
                        rotate: 0,
                        scale: Math.random() * 0.5 + 0.5
                      }}
                      animate={{ 
                        top: '120%',
                        rotate: 360,
                      }}
                      transition={{ 
                        duration: Math.random() * 2 + 2,
                        repeat: Infinity,
                        delay: Math.random() * 5
                      }}
                      className="absolute w-4 h-4 rounded-sm"
                      style={{ 
                        backgroundColor: ['#FF7F50', '#FF6347', '#4A3728', '#FDFCF8'][i % 4] 
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {state.showCheckout && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-brand-cream w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl relative"
            >
              <button 
                onClick={() => {
                  playSound('click');
                  setState(prev => ({ ...prev, showCheckout: false }));
                }}
                className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-all z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="p-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <CreditCard className="text-brand-coral" /> Checkout
                </h3>

                <div className="bg-white p-6 rounded-3xl shadow-sm mb-6 flex items-center gap-4">
                  <img src={resultImage!} className="w-20 h-20 object-cover rounded-xl" alt="Preview" />
                  <div>
                    <p className="font-bold text-lg">{state.product}</p>
                    <p className="text-brand-brown/50">{state.dogName || 'Custom Pup'} Design</p>
                    <p className="text-brand-coral font-bold mt-1">
                      {PRODUCTS.find(p => p.id === state.product)?.price}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-brand-brown/70">
                    <Truck className="w-5 h-5 text-brand-coral" />
                    <span className="text-sm font-medium">Free Shipping (3-5 business days)</span>
                  </div>
                  <div className="flex items-center gap-3 text-brand-brown/70">
                    <ShieldCheck className="w-5 h-5 text-brand-coral" />
                    <span className="text-sm font-medium">Secure Payment & Quality Guarantee</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    playSound('success');
                    alert("Order placed! (Demo only)");
                    setState(prev => ({ ...prev, showCheckout: false }));
                  }}
                  className="w-full bg-brand-coral text-white py-5 rounded-2xl font-bold text-xl shadow-lg hover:bg-brand-orange transition-all flex items-center justify-center gap-2"
                >
                  Confirm Order
                </button>
                <p className="text-center text-xs text-brand-brown/30 mt-4 uppercase tracking-widest">
                  No real payment will be taken
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-12 flex flex-col items-center gap-4">
        <button 
          onClick={() => {
            playSound('click');
            setState(prev => ({ ...prev, showFeedback: true }));
          }}
          className="text-brand-brown/40 hover:text-brand-coral transition-colors flex items-center gap-2 font-bold text-sm uppercase tracking-widest"
        >
          <MessageSquare className="w-4 h-4" /> Share Feedback
        </button>
        <div className="text-brand-brown/30 text-xs font-medium uppercase tracking-widest">
          Made with ❤️ for Dog Lovers
        </div>
      </footer>

      <AnimatePresence>
        {state.showFeedback && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-brand-cream w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl relative p-8"
            >
              <button 
                onClick={() => {
                  playSound('click');
                  setState(prev => ({ ...prev, showFeedback: false }));
                }}
                className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-all z-10"
              >
                <X className="w-6 h-6" />
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
                  setState(prev => ({ ...prev, showFeedback: false }));
                }}
                className="w-full bg-brand-coral text-white py-5 rounded-2xl font-bold text-xl shadow-lg hover:bg-brand-orange transition-all flex items-center justify-center gap-2"
              >
                Send Feedback
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

