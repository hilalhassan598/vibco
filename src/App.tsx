import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Sprout, Info, MessageSquare, Send, Loader2, ChevronRight, RefreshCcw, X, Calendar, Droplets, ShieldCheck, FlaskConical } from 'lucide-react';
import { getEnhancedExplanation, getChatResponse, getDetailedCropPlan, getSoilImprovementAdvice } from './lib/gemini';
import Markdown from 'react-markdown';

interface AnalysisResult {
  soil_type: string;
  confidence: string;
  explanation: string;
  crops: string[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const DISTRICTS = [
  { name: "Kozhikode", areas: ["Areekad"] },
  { name: "Palakkad", areas: ["Chittur"] },
  { name: "Thiruvananthapuram", areas: ["Neyyattinkara"] },
  { name: "Alappuzha", areas: ["Kuttanad"] },
  { name: "Idukki", areas: ["Munnar"] }
];

export default function App() {
  const [district, setDistrict] = useState('');
  const [area, setArea] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [selectedCropForPlan, setSelectedCropForPlan] = useState<string | null>(null);
  const [cropPlan, setCropPlan] = useState<string | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [soilAdvice, setSoilAdvice] = useState<string | null>(null);
  const [showSoilModal, setShowSoilModal] = useState(false);
  const [soilLoading, setSoilLoading] = useState(false);

  useEffect(() => {
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is missing! Please add it to the Secrets panel in AI Studio.");
    }
  }, []);

  const handleAnalyze = async () => {
    if (!district || !area) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/analyze-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ district, area }),
      });

      if (!res.ok) throw new Error('Location not found');
      const data = await res.json();
      
      // Enhance with Gemini
      const enhancedExplanation = await getEnhancedExplanation(district, area, data.soil_type, data.crops);
      
      setResult({
        ...data,
        explanation: enhancedExplanation
      });

      // Initialize chat
      setMessages([
        { role: 'assistant', content: `This area has ${data.soil_type} soil. What would you like to do? I can suggest crop plans or soil improvement tips.` }
      ]);
    } catch (err) {
      setError('Sorry, we couldn\'t find data for that location.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !result) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatLoading(true);

    const context = `Location: ${district}, ${area}. Soil: ${result.soil_type}. Crops: ${result.crops.join(', ')}.`;
    const aiMsg = await getChatResponse(userMsg, context);
    
    setMessages(prev => [...prev, { role: 'assistant', content: aiMsg }]);
    setChatLoading(false);
  };

  const handleGetCropPlan = async (crop: string) => {
    if (!result) return;
    setSelectedCropForPlan(crop);
    setPlanLoading(true);
    setCropPlan(null);

    const plan = await getDetailedCropPlan(district, area, result.soil_type, crop);
    setCropPlan(plan);
    setPlanLoading(false);
  };

  const handleImproveSoil = async () => {
    if (!result) return;
    setShowSoilModal(true);
    setSoilLoading(true);
    setSoilAdvice(null);

    const advice = await getSoilImprovementAdvice(district, area, result.soil_type);
    setSoilAdvice(advice);
    setSoilLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFCF0] text-[#2D3436] font-sans">
      {/* Header */}
      <header className="bg-white border-b border-[#E0E0E0] py-6 px-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#27AE60] p-2 rounded-xl">
              <Sprout className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#2D3436]">
              Smart Kerala <span className="text-[#27AE60]">AgriPortal</span>
            </h1>
          </div>
          <div className="text-xs font-medium uppercase tracking-widest text-[#636E72] opacity-70">
            Hackathon MVP
          </div>
        </div>
      </header>

      {!process.env.GEMINI_API_KEY && (
        <div className="bg-red-500 text-white text-center py-2 text-xs font-bold uppercase tracking-widest">
          ⚠️ GEMINI_API_KEY is missing! Please add it to the Secrets panel in AI Studio.
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="selector"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-extrabold text-[#2D3436] leading-tight">
                  Find the Perfect Crop for <br />
                  <span className="text-[#27AE60]">Your Land</span>
                </h2>
                <p className="text-[#636E72] max-w-lg mx-auto">
                  Select your location in Kerala to get instant soil insights and AI-powered recommendations.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-xl border border-[#F0F0F0] space-y-6 max-w-md mx-auto">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#B2BEC3]">District</label>
                  <select
                    value={district}
                    onChange={(e) => { setDistrict(e.target.value); setArea(''); }}
                    className="w-full p-4 bg-[#F9F9F9] border-2 border-transparent focus:border-[#27AE60] rounded-2xl outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select District</option>
                    {DISTRICTS.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#B2BEC3]">Area</label>
                  <select
                    value={area}
                    disabled={!district}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full p-4 bg-[#F9F9F9] border-2 border-transparent focus:border-[#27AE60] rounded-2xl outline-none transition-all appearance-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="">Select Area</option>
                    {DISTRICTS.find(d => d.name === district)?.areas.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={loading || !area}
                  className="w-full bg-[#27AE60] hover:bg-[#219150] text-white font-bold py-5 rounded-2xl shadow-lg shadow-[#27AE60]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing your area...
                    </>
                  ) : (
                    <>
                      Analyze Location
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setResult(null)}
                  className="flex items-center gap-2 text-[#636E72] hover:text-[#2D3436] font-medium transition-colors"
                >
                  <RefreshCcw className="w-4 h-4" />
                  New Analysis
                </button>
                <div className="flex items-center gap-2 bg-[#27AE60]/10 text-[#27AE60] px-3 py-1 rounded-full text-sm font-bold">
                  <MapPin className="w-4 h-4" />
                  {area}, {district}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <div className="bg-white p-8 rounded-3xl shadow-lg border border-[#F0F0F0] space-y-4">
                    <div className="flex items-center gap-2 text-[#27AE60]">
                      <Info className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase tracking-widest">Soil Insight</span>
                    </div>
                    <h3 className="text-3xl font-black text-[#2D3436]">{result.soil_type} Soil</h3>
                    <p className="text-lg text-[#636E72] leading-relaxed italic">
                      "{result.explanation}"
                    </p>
                  </div>

                  <div className="bg-white p-8 rounded-3xl shadow-lg border border-[#F0F0F0] space-y-6">
                    <div className="flex items-center gap-2 text-[#E67E22]">
                      <Sprout className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase tracking-widest">Recommended Crops</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {result.crops.map(crop => (
                        <button
                          key={crop}
                          onClick={() => handleGetCropPlan(crop)}
                          className="bg-[#FDFCF0] border border-[#E0E0E0] px-6 py-3 rounded-2xl font-bold text-[#2D3436] shadow-sm hover:border-[#27AE60] hover:bg-[#27AE60]/5 transition-all flex items-center gap-2 group"
                        >
                          {crop}
                          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                    <div className="pt-4">
                      <p className="text-xs text-[#B2BEC3] font-bold uppercase tracking-widest mb-4">Quick Actions</p>
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => handleGetCropPlan(result.crops[0])}
                          className="bg-[#2D3436] text-white py-4 rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2"
                        >
                          <Calendar className="w-4 h-4" />
                          Get Crop Plan
                        </button>
                        <button 
                          onClick={handleImproveSoil}
                          className="border-2 border-[#2D3436] text-[#2D3436] py-4 rounded-xl font-bold hover:bg-[#2D3436] hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                          <Droplets className="w-4 h-4" />
                          Improve Soil
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className={`bg-white rounded-3xl shadow-xl border border-[#F0F0F0] flex flex-col h-[500px] overflow-hidden transition-all ${showChat ? 'ring-2 ring-[#27AE60]' : ''}`}>
                    <div className="bg-[#2D3436] p-4 flex items-center justify-between text-white">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-bold text-sm">Agri Assistant</span>
                      </div>
                      {!showChat && (
                        <button 
                          onClick={() => setShowChat(true)}
                          className="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30"
                        >
                          Open Chat
                        </button>
                      )}
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F9F9F9]">
                      {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                            m.role === 'user' 
                              ? 'bg-[#27AE60] text-white rounded-tr-none' 
                              : 'bg-white border border-[#E0E0E0] text-[#2D3436] rounded-tl-none shadow-sm'
                          }`}>
                            {m.content}
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-white border border-[#E0E0E0] p-3 rounded-2xl rounded-tl-none shadow-sm">
                            <Loader2 className="w-4 h-4 animate-spin text-[#27AE60]" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-white border-t border-[#F0F0F0] flex gap-2">
                      <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask about crops..."
                        className="flex-1 bg-[#F9F9F9] p-3 rounded-xl text-sm outline-none focus:ring-1 ring-[#27AE60]"
                      />
                      <button 
                        onClick={handleSendMessage}
                        disabled={chatLoading}
                        className="bg-[#27AE60] p-3 rounded-xl text-white hover:bg-[#219150] disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Crop Plan Modal */}
        <AnimatePresence>
          {selectedCropForPlan && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="bg-[#2D3436] p-6 flex items-center justify-between text-white">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#27AE60] p-2 rounded-lg">
                      <Sprout className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{selectedCropForPlan} Plan</h3>
                      <p className="text-xs text-white/60 uppercase tracking-widest font-bold">{area}, {district}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedCropForPlan(null)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-[#FDFCF0]/30">
                  {planLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                      <Loader2 className="w-10 h-10 animate-spin text-[#27AE60]" />
                      <p className="text-[#636E72] font-medium animate-pulse">Generating your custom crop plan...</p>
                    </div>
                  ) : (
                    <div className="prose prose-slate max-w-none">
                      <div className="markdown-body">
                        <Markdown>{cropPlan || ''}</Markdown>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-white border-t border-[#F0F0F0] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#27AE60]">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">AI Verified Plan</span>
                  </div>
                  <button 
                    onClick={() => setSelectedCropForPlan(null)}
                    className="bg-[#27AE60] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#219150] transition-colors"
                  >
                    Got it
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Soil Improvement Modal */}
        <AnimatePresence>
          {showSoilModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="bg-[#2D3436] p-6 flex items-center justify-between text-white">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#E67E22] p-2 rounded-lg">
                      <FlaskConical className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight">Soil Enrichment Guide</h3>
                      <p className="text-xs text-white/60 uppercase tracking-widest font-bold">{result?.soil_type} Soil • {area}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowSoilModal(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-[#FDFCF0]/30">
                  {soilLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                      <Loader2 className="w-10 h-10 animate-spin text-[#E67E22]" />
                      <p className="text-[#636E72] font-medium animate-pulse">Analyzing soil enrichment strategies...</p>
                    </div>
                  ) : (
                    <div className="prose prose-slate max-w-none">
                      <div className="markdown-body">
                        <Markdown>{soilAdvice || ''}</Markdown>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-white border-t border-[#F0F0F0] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#E67E22]">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">Expert Soil Advice</span>
                  </div>
                  <button 
                    onClick={() => setShowSoilModal(false)}
                    className="bg-[#E67E22] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#D35400] transition-colors"
                  >
                    Got it
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-4xl mx-auto px-4 py-12 text-center border-t border-[#E0E0E0] mt-12">
        <p className="text-[#B2BEC3] text-sm font-medium">
          &copy; 2026 Smart Kerala Agriculture Portal. Built for Kerala Hackathon.
        </p>
      </footer>
    </div>
  );
}
