import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Cpu, 
  Download, 
  Usb, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Info,
  Github,
  ChevronLeft,
  ChevronRight,
  Wrench,
  Terminal,
  FileUp,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { availableMods, Mod } from './mods';
import { patchFirmware, flashFirmware } from './services/patcher';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'mods' | 'instructions' | 'about'>('mods');
  const [mods, setMods] = useState<Mod[]>(availableMods);
  const [logs, setLogs] = useState<string[]>(['Ready to patch. Select mods and click "Patch firmware".']);
  const [isPatching, setIsPatching] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [flashProgress, setFlashProgress] = useState(0);
  const [patchedFirmware, setPatchedFirmware] = useState<Uint8Array | null>(null);
  const [baseFirmware, setBaseFirmware] = useState<Uint8Array | null>(new Uint8Array(65536).fill(0xAA)); // Simulated base v26
  const [useDefaultFirmware, setUseDefaultFirmware] = useState(true);
  const [radioModel, setRadioModel] = useState<string>('*');
  const [showInstructions, setShowInstructions] = useState(false);
  
  const consoleRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  const toggleMod = (id: string) => {
    setMods(prev => prev.map(mod => mod.id === id ? { ...mod, enabled: !mod.enabled } : mod));
  };

  const handlePatch = async () => {
    setIsPatching(true);
    setPatchedFirmware(null);
    const selectedModIds = mods.filter(m => m.enabled).map(m => m.id);
    
    const result = await patchFirmware(baseFirmware, selectedModIds, addLog);
    
    if (result) {
      setPatchedFirmware(result);
      addLog('Firmware patched successfully. You can now save or flash it.');
    } else {
      addLog('Error: Patching failed.');
    }
    setIsPatching(false);
  };

  const handleSave = () => {
    if (!patchedFirmware) return;
    
    const blob = new Blob([patchedFirmware], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UVMOD_Patched_${radioModel}_${new Date().toISOString().split('T')[0]}.bin`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addLog('Firmware saved to disk.');
  };

  const handleFlash = async () => {
    if (!patchedFirmware) {
      addLog('Error: No patched firmware to flash. Patch first!');
      return;
    }
    
    setIsFlashing(true);
    setFlashProgress(0);
    
    const success = await flashFirmware(patchedFirmware, addLog, setFlashProgress);
    
    if (success) {
      addLog('Flashing successful!');
    } else {
      addLog('Flashing failed. Check connection and try again.');
    }
    
    setIsFlashing(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const buffer = await file.arrayBuffer();
    setBaseFirmware(new Uint8Array(buffer));
    setUseDefaultFirmware(false);
    addLog(`Custom firmware loaded: ${file.name} (${file.size} bytes)`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#E4E3E0] text-[#141414] font-sans">
      {/* Sidebar - Visible Grid Structure */}
      <aside className="w-80 border-r border-[#141414] flex flex-col bg-[#E4E3E0]">
        <div className="p-8 border-b border-[#141414]">
          <div className="flex items-center gap-3 mb-2">
            <Radio className="w-8 h-8" strokeWidth={1.5} />
            <h1 className="text-3xl font-bold tracking-tighter italic font-serif">UVMOD RX-TX</h1>
          </div>
          <p className="text-[11px] uppercase tracking-widest opacity-50 font-mono">Quansheng Firmware Patcher</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 border-b border-[#141414] bg-[#141414] text-[#E4E3E0]">
            <h2 className="text-xs uppercase tracking-widest font-mono font-bold">Available Mods</h2>
          </div>
          
          {mods.map((mod) => (
            <div 
              key={mod.id}
              onClick={() => toggleMod(mod.id)}
              className={cn(
                "group p-4 border-b border-[#141414] cursor-pointer transition-all duration-200",
                mod.enabled ? "bg-[#141414] text-[#E4E3E0]" : "hover:bg-[#141414]/5"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-serif italic text-lg">{mod.name}</span>
                <div className={cn(
                  "w-4 h-4 border border-[#141414] flex items-center justify-center",
                  mod.enabled ? "bg-[#E4E3E0] border-[#E4E3E0]" : ""
                )}>
                  {mod.enabled && <CheckCircle2 className="w-3 h-3 text-[#141414]" />}
                </div>
              </div>
              <p className={cn(
                "text-xs leading-relaxed",
                mod.enabled ? "opacity-70" : "opacity-50"
              )}>
                {mod.description}
              </p>
              <div className="mt-2 flex gap-2">
                <span className={cn(
                  "text-[9px] uppercase px-1.5 py-0.5 border",
                  mod.enabled ? "border-[#E4E3E0]/30 text-[#E4E3E0]/70" : "border-[#141414]/30 text-[#141414]/50"
                )}>
                  {mod.category}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-[#141414] bg-[#141414]/5">
          <button 
            onClick={() => setShowInstructions(!showInstructions)}
            className="w-full flex items-center justify-between text-xs font-mono uppercase tracking-widest hover:opacity-70"
          >
            <span>Instructions</span>
            {showInstructions ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-20 border-b border-[#141414] flex items-center justify-between px-10">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest opacity-50 font-mono">Target Model</span>
              <select 
                value={radioModel}
                onChange={(e) => setRadioModel(e.target.value)}
                className="bg-transparent border-none font-serif italic text-xl focus:ring-0 p-0 cursor-pointer"
              >
                <option value="*">Patch for all radios</option>
                <option value="2">Patch for UV-K5</option>
                <option value="3">Patch for UV-K6, UV-K5(8)</option>
                <option value="4">Patch for UV-5R Plus</option>
              </select>
            </div>
            
            <div className="h-8 w-px bg-[#141414]/20" />
            
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest opacity-50 font-mono">Base Firmware</span>
              <div className="flex items-center gap-2">
                <span className="font-serif italic text-xl">{useDefaultFirmware ? 'Stock v2.01.26' : 'Custom Upload'}</span>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1 hover:bg-[#141414]/5 rounded"
                >
                  <FileUp className="w-4 h-4" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept=".bin"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a href="https://github.com/RE3CON" target="_blank" rel="noreferrer" className="p-2 hover:bg-[#141414]/5 rounded-full">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-10 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-10">
            
            {/* Action Cards */}
            <div className="grid grid-cols-2 gap-10">
              <div className="border border-[#141414] p-8 flex flex-col justify-between group hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors duration-300">
                <div>
                  <Wrench className="w-10 h-10 mb-6" strokeWidth={1} />
                  <h3 className="text-3xl font-serif italic mb-4">Patch Firmware</h3>
                  <p className="text-sm opacity-70 mb-8 leading-relaxed">
                    Apply the selected mods to your base firmware. This will generate a new binary file ready for flashing.
                  </p>
                </div>
                <button 
                  onClick={handlePatch}
                  disabled={isPatching}
                  className="w-full border border-current py-4 font-mono uppercase tracking-widest text-sm hover:bg-[#E4E3E0] hover:text-[#141414] transition-colors disabled:opacity-50"
                >
                  {isPatching ? 'Patching...' : 'Execute Patch'}
                </button>
              </div>

              <div className="border border-[#141414] p-8 flex flex-col justify-between group hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors duration-300">
                <div>
                  <Usb className="w-10 h-10 mb-6" strokeWidth={1} />
                  <h3 className="text-3xl font-serif italic mb-4">Direct Flashing</h3>
                  <p className="text-sm opacity-70 mb-8 leading-relaxed">
                    Flash the patched firmware directly to your radio using the Web Serial API. No external tools required.
                  </p>
                </div>
                <button 
                  onClick={handleFlash}
                  disabled={!patchedFirmware || isFlashing}
                  className="w-full border border-current py-4 font-mono uppercase tracking-widest text-sm hover:bg-[#E4E3E0] hover:text-[#141414] transition-colors disabled:opacity-50"
                >
                  {isFlashing ? 'Flashing...' : 'Flash Directly'}
                </button>
              </div>
            </div>

            {/* Console Section */}
            <div className="border border-[#141414]">
              <div className="flex items-center justify-between px-6 py-3 border-b border-[#141414] bg-[#141414] text-[#E4E3E0]">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  <span className="text-xs font-mono uppercase tracking-widest font-bold">System Console</span>
                </div>
                <button 
                  onClick={handleSave}
                  disabled={!patchedFirmware}
                  className="flex items-center gap-2 text-[10px] uppercase tracking-widest hover:opacity-70 disabled:opacity-30"
                >
                  <Download className="w-3 h-3" />
                  Save Binary
                </button>
              </div>
              <textarea 
                ref={consoleRef}
                readOnly
                value={logs.join('\n')}
                className="w-full h-64 bg-transparent p-6 font-mono text-xs leading-relaxed focus:ring-0 border-none resize-none"
              />
            </div>

            {/* Warning Section */}
            <div className="border border-[#141414] p-6 bg-[#141414]/5 flex gap-6 items-start">
              <ShieldAlert className="w-6 h-6 shrink-0 mt-1" />
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-widest font-bold">Legal Warning</h4>
                <p className="text-xs opacity-70 leading-relaxed">
                  Check your local laws! In some countries you need a HAM license to operate and/or freq radiation protected environment. Use a Dummyload (50 Ohm, 5W) on frequencies for testing TX before going On-Air. 73, 55 R3CøN.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Instructions Overlay */}
        <AnimatePresence>
          {showInstructions && (
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 right-0 w-96 bg-[#E4E3E0] border-l border-[#141414] z-50 p-10 shadow-2xl overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-serif italic">Instructions</h2>
                <button onClick={() => setShowInstructions(false)} className="hover:opacity-50">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-8 text-sm leading-relaxed">
                <section>
                  <h3 className="font-mono uppercase tracking-widest text-xs font-bold mb-3">Usage</h3>
                  <ol className="list-decimal list-inside space-y-3 opacity-70">
                    <li>Select the desired mods and customize as needed.</li>
                    <li>Select your radio model or leave as "Patch for all radios".</li>
                    <li>Click "Patch" and watch the console output.</li>
                    <li>Click "Save" to download or "Flash Directly" to update your radio.</li>
                  </ol>
                </section>

                <section>
                  <h3 className="font-mono uppercase tracking-widest text-xs font-bold mb-3">Flashing Directly</h3>
                  <p className="opacity-70 mb-3">
                    Modern Chromium-based browsers (Chrome, Edge, Opera) allow UVMOD to flash firmware directly.
                  </p>
                  <ol className="list-decimal list-inside space-y-3 opacity-70">
                    <li>Connect programming cable (CH340/CP210x).</li>
                    <li>Hold PTT and turn on radio to enter bootloader mode (flashlight turns on).</li>
                    <li>Connect cable to radio.</li>
                    <li>Click "Flash directly" and wait.</li>
                  </ol>
                </section>

                <div className="pt-10 border-t border-[#141414]/20">
                  <p className="text-[10px] font-mono opacity-50">
                    UVMOD RX-TX is based on whoismatt's uvmod. Developed by RECON.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Flashing Progress Overlay */}
        <AnimatePresence>
          {isFlashing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[60] bg-[#E4E3E0]/90 backdrop-blur-sm flex flex-col items-center justify-center p-10 text-center"
            >
              <div className="w-full max-w-md space-y-8">
                <div className="relative w-32 h-32 mx-auto">
                  <RefreshCw className="w-full h-full animate-spin-slow" strokeWidth={1} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-4xl font-serif italic">Flashing Radio...</h2>
                  <p className="text-xs font-mono uppercase tracking-widest opacity-50">Do not disconnect cable</p>
                </div>
                <div className="w-full border border-[#141414] h-4 p-0.5">
                  <motion.div 
                    className="bg-[#141414] h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${flashProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest font-bold">
                  <span>Progress: {flashProgress}%</span>
                  <span>Writing Blocks...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
