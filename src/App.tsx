import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Database, 
  Cpu, 
  Smartphone, 
  Settings, 
  Activity, 
  Download, 
  Usb, 
  CheckCircle2, 
  AlertCircle,
  Search,
  RefreshCw,
  Info,
  Github,
  FileText,
  Users,
  Folder
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DMRUser, DeviceStatus, AndroidPatchInfo } from './types';
import { fetchDMRUsers, requestDevice, flashFirmware, flashDatabase } from './services/dmrService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'device' | 'database' | 'firmware' | 'android' | 'resources' | 'features'>('device');
  const [users, setUsers] = useState<DMRUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [flashing, setFlashing] = useState(false);
  const [flashProgress, setFlashProgress] = useState(0);
  const [android16Mode, setAndroid16Mode] = useState(false);
  const [device, setDevice] = useState<DeviceStatus>({
    connected: false,
    model: 'MD-380',
    firmware: 'D013.020 (Original)',
  });
  const [searchQuery, setSearchQuery] = useState('');

  const androidPatches: AndroidPatchInfo[] = [
    {
      title: 'Scoped Storage Fix',
      description: 'Updates file access to use MediaStore API for Android 16 compatibility.',
      codeSnippet: `// Android 16 Scoped Storage Implementation
ContentValues values = new ContentValues();
values.put(MediaStore.MediaColumns.DISPLAY_NAME, "users.csv");
values.put(MediaStore.MediaColumns.MIME_TYPE, "text/csv");
Uri uri = getContentResolver().insert(MediaStore.Files.getContentUri("external"), values);`,
      status: 'applied'
    },
    {
      title: 'USB Permission Flow',
      description: 'Modernized USB permission request using PendingIntent with FLAG_MUTABLE.',
      codeSnippet: `// Android 16 USB Permission
PendingIntent permissionIntent = PendingIntent.getBroadcast(this, 0, new Intent(ACTION_USB_PERMISSION), 
    PendingIntent.FLAG_MUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
usbManager.requestPermission(device, permissionIntent);`,
      status: 'applied'
    },
    {
      title: 'S24 Ultra Driver Patch',
      description: 'Optimized serial communication timing for Snapdragon 8 Gen 3 chipsets.',
      codeSnippet: `// S24U Serial Timing Fix
serialPort.setParameters(115200, 8, 1, 0);
serialPort.setFlowControl(UsbSerialPort.FLOW_CONTROL_OFF);
// Add 5ms delay for buffer stability on high-speed USB
Thread.sleep(5);`,
      status: 'applied'
    }
  ];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchDMRUsers();
      setUsers(data);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    const success = await requestDevice();
    if (success) {
      setDevice({
        ...device,
        connected: true,
        firmware: 'D013.020 (Patched v2.0)',
        lastSync: new Date().toLocaleString()
      });
    }
    setLoading(false);
  };

  const handleFlash = async (firmwareName: string) => {
    if (!device.connected) {
      alert('Please connect your radio first.');
      setActiveTab('device');
      return;
    }

    setFlashing(true);
    setFlashProgress(0);
    
    // Apply Android 16 timing patch if enabled
    if (android16Mode) {
      console.log('Android 16 Compatibility Mode: Applying 5ms serial buffer delay...');
    }

    const success = await flashFirmware((progress) => {
      setFlashProgress(progress);
    }, android16Mode);

    if (success) {
      setDevice({
        ...device,
        connected: false,
        firmware: firmwareName,
        lastSync: new Date().toLocaleString()
      });
      alert(`Successfully flashed ${firmwareName}! The radio is now restarting.`);
    } else {
      alert('Flashing failed. Please check your connection.');
    }
    
    setFlashing(false);
  };

  const [dbFile, setDbFile] = useState<File | null>(null);
  const [dbFileData, setDbFileData] = useState<Uint8Array | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setDbFile(selectedFile);
      const buffer = await selectedFile.arrayBuffer();
      setDbFileData(new Uint8Array(buffer));
    }
  };

  const handleFlashDatabase = async () => {
    if (!device.connected) {
      alert('Please connect your radio first.');
      setActiveTab('device');
      return;
    }

    if (!dbFileData) {
      alert('Please select a CSV database file first.');
      return;
    }

    setFlashing(true);
    setFlashProgress(0);
    
    if (android16Mode) {
      console.log('Android 16 Compatibility Mode: Applying 50ms SPI buffer delay...');
    }

    const success = await flashDatabase(dbFileData, (progress) => {
      setFlashProgress(progress);
    }, android16Mode);

    if (success) {
      setDevice({
        ...device,
        connected: false,
        lastSync: new Date().toLocaleString()
      });
      alert('Successfully flashed the User Database! The radio is now restarting.');
    } else {
      alert('Database flashing failed. Please check your connection.');
    }
    
    setFlashing(false);
  };

  const filteredUsers = users.filter(u => 
    u.callsign.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.id.toString().includes(searchQuery)
  );

  const statsData = [
    { name: 'USA', count: 1200 },
    { name: 'UK', count: 800 },
    { name: 'Germany', count: 600 },
    { name: 'France', count: 450 },
    { name: 'Japan', count: 300 },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#121212] text-[#e4e3e0]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#333333] flex flex-col">
        <div className="p-6 border-b border-[#333333]">
          <div className="flex items-center gap-3 mb-2">
            <Radio className="w-6 h-6 text-[#ffb000]" />
            <h1 className="text-lg font-bold tracking-tighter uppercase">MD380 Tool</h1>
          </div>
          <p className="text-[10px] uppercase tracking-widest opacity-50">Web Management Suite</p>
        </div>

        <nav className="flex-1 py-4">
          {[
            { id: 'device', icon: Usb, label: 'Device Status' },
            { id: 'features', icon: Activity, label: 'Features' },
            { id: 'database', icon: Database, label: 'User Database' },
            { id: 'firmware', icon: Cpu, label: 'Firmware' },
            { id: 'android', icon: Smartphone, label: 'Android 16 Patch' },
            { id: 'resources', icon: Info, label: 'Resources' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors",
                activeTab === item.id 
                  ? "bg-[#ffb000] text-[#121212]" 
                  : "hover:bg-[#1a1a1a] text-[#e4e3e0]/70"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-[#333333]">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-50 mb-4">
            <Settings className="w-3 h-3" />
            System Config
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-[11px]">
              <span>API Status</span>
              <span className="text-emerald-500">ONLINE</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span>WebUSB</span>
              <span className="text-emerald-500">SUPPORTED</span>
            </div>
          </div>
          <a 
            href="https://github.com/RE3CON/MD380Tool-Android-16" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2 text-xs text-[#e4e3e0]/70 hover:text-[#ffb000] transition-colors"
          >
            <Github className="w-4 h-4" />
            View on GitHub
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-[#333333] flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <Activity className="w-4 h-4 text-[#ffb000]" />
            <span className="text-xs font-mono uppercase tracking-widest opacity-50">
              {activeTab === 'device' && 'Hardware Interface v1.0.4'}
              {activeTab === 'features' && 'MD380Tools Enhanced Feature Set'}
              {activeTab === 'database' && 'DMR User Registry Sync'}
              {activeTab === 'firmware' && 'Binary Management & Flashing'}
              {activeTab === 'android' && 'Mobile Compatibility Layer'}
              {activeTab === 'resources' && 'Documentation & Archives'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {device.connected ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-500 text-[10px] font-bold uppercase">
                <CheckCircle2 className="w-3 h-3" />
                Connected: {device.model}
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded text-red-500 text-[10px] font-bold uppercase">
                <AlertCircle className="w-3 h-3" />
                Disconnected
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          <AnimatePresence>
            {flashing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-[#121212]/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="w-full max-w-md space-y-6">
                  <div className="relative w-32 h-32 mx-auto">
                    <Cpu className="w-full h-full text-[#ffb000] animate-pulse" />
                    <div className="absolute inset-0 border-4 border-[#ffb000]/20 rounded-full animate-ping" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">Flashing Firmware...</h2>
                    <p className="text-sm opacity-60 italic">Do not disconnect your radio or close this tab.</p>
                  </div>
                  <div className="w-full bg-[#333333] h-2 rounded-full overflow-hidden">
                    <motion.div 
                      className="bg-[#ffb000] h-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${flashProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-[#ffb000]">
                    <span>{Math.round(flashProgress)}% Complete</span>
                    <span>Writing Blocks...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {activeTab === 'device' && (
              <motion.div
                key="device"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-3 gap-6">
                  <div className="widget-container p-6 col-span-2">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <Usb className="w-5 h-5 text-[#ffb000]" />
                      Radio Connection
                    </h3>
                    <div className="flex items-center justify-between p-8 border border-dashed border-[#333333] rounded-lg bg-[#121212]">
                      <div className="space-y-2">
                        <p className="text-sm opacity-70">Connect your Tytera MD-380 via USB cable and put it in DFU mode (PTT + Top Button while powering on).</p>
                        <p className="text-[10px] font-mono text-[#ffb000]">READY FOR WEBUSB HANDSHAKE</p>
                      </div>
                      <button 
                        onClick={handleConnect}
                        disabled={loading || device.connected}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50"
                      >
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Usb className="w-4 h-4" />}
                        {device.connected ? 'Device Paired' : 'Connect Radio'}
                      </button>
                    </div>
                  </div>

                  <div className="widget-container p-6">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-[#ffb000]" />
                      Status
                    </h3>
                    <div className="space-y-4">
                      <div className="pb-4 border-b border-[#333333]">
                        <p className="text-[10px] uppercase opacity-50 mb-1">Model</p>
                        <p className="font-mono text-sm">{device.model}</p>
                      </div>
                      <div className="pb-4 border-b border-[#333333]">
                        <p className="text-[10px] uppercase opacity-50 mb-1">Firmware</p>
                        <p className="font-mono text-sm">{device.firmware}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase opacity-50 mb-1">Last Sync</p>
                        <p className="font-mono text-sm">{device.lastSync || 'Never'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="widget-container p-6">
                  <h3 className="text-lg font-bold mb-6">Regional Distribution</h3>
                  <div className="w-full h-[300px] relative overflow-hidden">
                    <ResponsiveContainer id="regional-distribution-chart" width="99%" height={300} minWidth={0} minHeight={0}>
                      <BarChart data={statsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333333" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          stroke="#e4e3e0" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                          dy={10}
                        />
                        <YAxis 
                          stroke="#e4e3e0" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333333', fontSize: '12px' }}
                          itemStyle={{ color: '#ffb000' }}
                          cursor={{ fill: '#ffffff05' }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {statsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#ffb000' : '#444444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'features' && (
              <motion.div
                key="features"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="widget-container p-6 border-t-2 border-t-[#ffb000]">
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-[#ffb000]" />
                      Application Menu
                    </h3>
                    <p className="text-sm opacity-70 mb-4 leading-relaxed">
                      A custom menu system accessible directly from the radio's keypad. 
                      Allows for real-time configuration of experimental features without a PC.
                    </p>
                    <div className="text-[10px] font-mono opacity-50 uppercase tracking-wider">
                      Access: Red Button + Menu
                    </div>
                  </div>

                  <div className="widget-container p-6 border-t-2 border-t-[#ffb000]">
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-[#ffb000]" />
                      Promiscuous Mode
                    </h3>
                    <p className="text-sm opacity-70 mb-4 leading-relaxed">
                      Listen to all traffic on the current time slot, regardless of Talkgroup or Color Code. 
                      Essential for monitoring busy repeaters or finding active traffic.
                    </p>
                    <div className="text-[10px] font-mono opacity-50 uppercase tracking-wider">
                      Status: Toggle via Menu
                    </div>
                  </div>

                  <div className="widget-container p-6 border-t-2 border-t-[#ffb000]">
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-[#ffb000]" />
                      Network Monitor
                    </h3>
                    <p className="text-sm opacity-70 mb-4 leading-relaxed">
                      Real-time display of DMR network activity. Shows active Talkgroups, 
                      Caller IDs, and signal strength in a dedicated monitoring view.
                    </p>
                    <div className="text-[10px] font-mono opacity-50 uppercase tracking-wider">
                      View: NetMon 1, 2, and 3
                    </div>
                  </div>

                  <div className="widget-container p-6 border-t-2 border-t-[#ffb000]">
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#ffb000]" />
                      Caller ID (CSV Database)
                    </h3>
                    <p className="text-sm opacity-70 mb-4 leading-relaxed">
                      Displays the name, callsign, and location of the person talking by 
                      matching their DMR ID against a local CSV database stored in the radio.
                    </p>
                    <div className="text-[10px] font-mono opacity-50 uppercase tracking-wider">
                      Capacity: ~100,000+ Users
                    </div>
                  </div>

                  <div className="widget-container p-6 border-t-2 border-t-[#ffb000]">
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#ffb000]" />
                      Call Log
                    </h3>
                    <p className="text-sm opacity-70 mb-4 leading-relaxed">
                      Maintains a history of the last received calls, including timestamps, 
                      Talkgroups, and Caller IDs for later review.
                    </p>
                    <div className="text-[10px] font-mono opacity-50 uppercase tracking-wider">
                      Feature: Persistent History
                    </div>
                  </div>

                  <div className="widget-container p-6 border-t-2 border-t-[#ffb000]">
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                      <Info className="w-5 h-5 text-[#ffb000]" />
                      Morse Narration
                    </h3>
                    <p className="text-sm opacity-70 mb-4 leading-relaxed">
                      Accessibility feature that narrates menu items and radio status 
                      using Morse code audio prompts.
                    </p>
                    <div className="text-[10px] font-mono opacity-50 uppercase tracking-wider">
                      Target: Visually Impaired Users
                    </div>
                  </div>

                  <div className="widget-container p-6 border-t-2 border-t-[#ffb000]">
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 text-[#ffb000]" />
                      Quick TG Change
                    </h3>
                    <p className="text-sm opacity-70 mb-4 leading-relaxed">
                      Rapidly switch between Talkgroups without navigating the main menu. 
                      Supports manual entry and quick-select lists.
                    </p>
                    <div className="text-[10px] font-mono opacity-50 uppercase tracking-wider">
                      Shortcut: Keyboard Entry
                    </div>
                  </div>

                  <div className="widget-container p-6 border-t-2 border-t-[#ffb000]">
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-[#ffb000]" />
                      Test & Setup
                    </h3>
                    <p className="text-sm opacity-70 mb-4 leading-relaxed">
                      Advanced diagnostic tools for testing radio hardware, 
                      calibrating mic gain, and verifying firmware integrity.
                    </p>
                    <div className="text-[10px] font-mono opacity-50 uppercase tracking-wider">
                      Mode: Experimental Diagnostics
                    </div>
                  </div>
                </div>

                <div className="widget-container p-8 bg-[#1a1a1a] border border-[#333333]">
                  <h3 className="text-xl font-bold mb-4">How to Enable Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="font-bold text-[#ffb000] uppercase text-xs tracking-widest">Step 1: Flash Firmware</h4>
                      <p className="text-sm opacity-70">
                        Most features require the patched community firmware (KD4Z or Travis Goodspeed builds). 
                        Use the <button onClick={() => setActiveTab('firmware')} className="text-[#ffb000] underline">Firmware</button> tab to flash your device.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-bold text-[#ffb000] uppercase text-xs tracking-widest">Step 2: Configure Menu</h4>
                      <p className="text-sm opacity-70">
                        Once flashed, press the <strong>Red Button</strong> followed by the <strong>Menu Button</strong> on your radio 
                        to open the "Application Menu" and toggle specific enhancements.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'database' && (
              <motion.div
                key="database"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="relative w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                    <input 
                      type="text"
                      placeholder="Search by Callsign, Name or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-[#333333] rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#ffb000] transition-colors"
                    />
                  </div>
                  <div className="flex gap-3">
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept=".csv,.bin"
                      className="hidden"
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      {dbFile ? dbFile.name : 'Select CSV File'}
                    </button>
                    <button className="btn-secondary flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Download Latest CSV
                    </button>
                    <button 
                      onClick={handleFlashDatabase}
                      disabled={flashing || !dbFileData}
                      className="btn-primary flex items-center gap-2 disabled:opacity-50"
                    >
                      <Database className="w-4 h-4" />
                      {flashing ? `Flashing ${Math.round(flashProgress)}%` : 'Flash to Radio'}
                    </button>
                  </div>
                </div>

                <div className="widget-container overflow-hidden">
                  <div className="data-row bg-[#222222] border-b-2 border-[#333333] cursor-default hover:bg-[#222222] hover:text-[#e4e3e0]">
                    <span className="col-header">DMR ID</span>
                    <span className="col-header">Callsign</span>
                    <span className="col-header">Name</span>
                    <span className="col-header">Location</span>
                    <span className="col-header">Country</span>
                  </div>
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="data-row">
                      <span className="data-value text-[#ffb000]">{user.id}</span>
                      <span className="font-bold">{user.callsign}</span>
                      <span className="opacity-80">{user.name}</span>
                      <span className="opacity-60 text-xs">{user.city}, {user.state}</span>
                      <span className="opacity-60 text-xs">{user.country}</span>
                    </div>
                  ))}
                  {filteredUsers.length === 0 && (
                    <div className="p-12 text-center opacity-30 italic">No users found matching criteria</div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'android' && (
              <motion.div
                key="android"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="widget-container p-8 border-l-4 border-l-[#ffb000]">
                  <div className="flex items-start gap-4">
                    <Info className="w-6 h-6 text-[#ffb000] shrink-0" />
                    <div>
                      <h2 className="text-xl font-bold mb-2">Android 16 & S24 Ultra Compatibility</h2>
                      <p className="text-sm opacity-70 leading-relaxed">
                        The latest Android versions introduce strict Scoped Storage and USB permission requirements. 
                        The S24 Ultra specifically requires optimized serial buffer handling due to its high-speed USB implementation.
                        Apply the patches below to your Android source code to ensure full compatibility.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {androidPatches.map((patch, idx) => (
                    <div key={idx} className="widget-container p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-[#ffb000]/10 flex items-center justify-center text-[#ffb000] font-bold">
                            {idx + 1}
                          </div>
                          <h3 className="font-bold">{patch.title}</h3>
                        </div>
                        <span className="text-[10px] font-bold uppercase px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/30">
                          {patch.status}
                        </span>
                      </div>
                      <p className="text-sm opacity-60 mb-4">{patch.description}</p>
                      <div className="bg-[#0a0a0a] p-4 rounded font-mono text-xs overflow-x-auto border border-[#333333]">
                        <pre className="text-emerald-400">
                          {patch.codeSnippet}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'firmware' && (
              <motion.div
                key="firmware"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="widget-container p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <Cpu className="w-8 h-8 text-[#ffb000]" />
                    <div>
                      <h2 className="text-xl font-bold">Firmware Management</h2>
                      <p className="text-sm opacity-60">Select a firmware binary to flash to your MD-380 device.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    <div className="p-6 border border-[#ffb000] rounded-lg bg-[#1a1a1a] hover:bg-[#222222] transition-colors group relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-[#ffb000] text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-tighter">
                        Latest Working Build
                      </div>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-[#ffb000] text-lg">Foxhollow Experimental (2025)</h3>
                        <span className="text-[10px] opacity-50 font-mono">Released: 2025-01-13</span>
                      </div>
                      <p className="text-sm opacity-70 mb-6">The most up-to-date experimental firmware (v2025-01-13). Includes all latest patches, DMR database support, and UI enhancements.</p>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleFlash('Foxhollow Experimental (2025)')}
                          disabled={flashing}
                          className="btn-primary text-xs py-2 px-6 disabled:opacity-50"
                        >
                          {flashing ? `Flashing ${Math.round(flashProgress)}%` : 'Flash Latest'}
                        </button>
                        <a 
                          href="https://web1.foxhollow.ca/DMR/TYT/Firmware/Experimental/" 
                          target="_blank" 
                          rel="noreferrer"
                          className="btn-secondary text-xs py-2 flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" /> Directory
                        </a>
                      </div>
                    </div>

                    <div className="p-6 border border-[#333333] rounded-lg bg-[#1a1a1a] hover:border-[#ffb000] transition-colors group">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-[#ffb000]">KD4Z md380tools (Non-GPS)</h3>
                        <div className="text-right">
                          <span className="text-[10px] bg-[#ffb000]/10 text-[#ffb000] px-2 py-1 rounded font-bold uppercase block mb-1">Community Stable</span>
                          <span className="text-[9px] opacity-40 font-mono">Released: 2024-11-20</span>
                        </div>
                      </div>
                      <p className="text-xs opacity-60 mb-6">The definitive community firmware with promiscuous mode, mic gain, and enhanced UI. Highly stable for daily use.</p>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleFlash('KD4Z md380tools (Non-GPS)')}
                          disabled={flashing}
                          className="btn-primary text-xs py-2 disabled:opacity-50"
                        >
                          {flashing ? `Flashing ${Math.round(flashProgress)}%` : 'Flash Now'}
                        </button>
                        <a 
                          href="https://github.com/DMR-Database/md380tools/blob/master/firmware-noGPS.bin" 
                          target="_blank" 
                          rel="noreferrer"
                          className="btn-secondary text-xs py-2 flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" /> Source
                        </a>
                      </div>
                    </div>

                    <div className="p-6 border border-[#333333] rounded-lg bg-[#1a1a1a] hover:border-indigo-500 transition-colors group">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-indigo-400">OpenRTX (Alternative)</h3>
                        <div className="text-right">
                          <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded font-bold uppercase block mb-1">Open Source</span>
                          <span className="text-[9px] opacity-40 font-mono">Released: 2025-02-01</span>
                        </div>
                      </div>
                      <p className="text-xs opacity-60 mb-6">A free and open-source firmware for digital ham radios. Supports M17 and offers a completely different UI experience.</p>
                      <div className="flex gap-3">
                        <a 
                          href="https://openrtx.org/" 
                          target="_blank" 
                          rel="noreferrer"
                          className="btn-primary text-xs py-2"
                        >
                          Visit OpenRTX
                        </a>
                        <a 
                          href="https://github.com/OpenRTX/OpenRTX" 
                          target="_blank" 
                          rel="noreferrer"
                          className="btn-secondary text-xs py-2 flex items-center gap-1"
                        >
                          <Github className="w-3 h-3" /> GitHub
                        </a>
                      </div>
                    </div>

                    <div className="p-6 border border-[#333333] rounded-lg bg-[#1a1a1a] hover:border-red-500/50 transition-colors group">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-red-400">Stock Firmware (v03.13.19)</h3>
                        <div className="text-right">
                          <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-1 rounded font-bold uppercase block mb-1">Last Resort</span>
                          <span className="text-[9px] opacity-40 font-mono">Released: 2019-03-13</span>
                        </div>
                      </div>
                      <p className="text-xs opacity-60 mb-6">Factory original firmware for MD-380. Use this ONLY to revert to stock settings or for emergency recovery.</p>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleFlash('Stock Firmware (v03.13.19)')}
                          disabled={flashing}
                          className="btn-primary text-xs py-2 border-red-500/50 hover:bg-red-500/20 disabled:opacity-50"
                        >
                          {flashing ? `Flashing ${Math.round(flashProgress)}%` : 'Recovery Flash'}
                        </button>
                        <a 
                          href="https://www.miklor.com/DMR/Toolz/nongps_fw_031319.bin" 
                          target="_blank" 
                          rel="noreferrer"
                          className="btn-secondary text-xs py-2 flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" /> Binary
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-6 border border-dashed border-[#333333] rounded-lg flex items-center justify-between bg-[#1a1a1a]/50">
                    <div className="text-left">
                      <h4 className="text-sm font-bold flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-[#ffb000]" />
                        Android 16 Compatibility Mode
                      </h4>
                      <p className="text-xs opacity-50">Enables 5ms serial buffer delay and Scoped Storage permission flow for Android 16 / S24 Ultra.</p>
                    </div>
                    <button 
                      onClick={() => setAndroid16Mode(!android16Mode)}
                      className={cn(
                        "px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all",
                        android16Mode 
                          ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                          : "bg-[#333333] text-white/50 hover:bg-[#444444]"
                      )}
                    >
                      {android16Mode ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  <div className="mt-8 p-6 border border-dashed border-[#333333] rounded-lg text-center">
                    <p className="text-sm opacity-50 mb-4">Have a custom binary? Upload it here to apply patches manually.</p>
                    <button className="btn-secondary inline-flex items-center gap-2">
                      <Download className="w-4 h-4" /> Upload Custom Firmware (.bin)
                    </button>
                  </div>
                </div>

                <div className="widget-container p-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest opacity-50 mb-4">Alternative Versions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <a 
                      href="https://md380.org/firmware/orig/" 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-4 border border-[#333333] rounded bg-[#121212] hover:bg-[#1a1a1a] transition-colors flex items-center justify-between"
                    >
                      <span className="text-xs">MD380.org Archive</span>
                      <Download className="w-3 h-3 opacity-30" />
                    </a>
                    <div className="p-4 border border-[#333333] rounded bg-[#121212] opacity-50 cursor-not-allowed flex items-center justify-between">
                      <span className="text-xs">GPS Patched v2.1</span>
                      <AlertCircle className="w-3 h-3 opacity-30" />
                    </div>
                    <div className="p-4 border border-[#333333] rounded bg-[#121212] opacity-50 cursor-not-allowed flex items-center justify-between">
                      <span className="text-xs">Experimental Core</span>
                      <AlertCircle className="w-3 h-3 opacity-30" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'resources' && (
              <motion.div
                key="resources"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="widget-container p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Database className="w-6 h-6 text-[#ffb000]" />
                      <h3 className="text-lg font-bold">KG5RKI Download Archive</h3>
                    </div>
                    <p className="text-sm opacity-70 mb-6 leading-relaxed">
                      Known as the <span className="text-[#ffb000] font-bold italic">Gold Standard</span> for DMR binaries. 
                      KG5RKI maintains a comprehensive collection of firmware versions, tools, and drivers for the MD-380/390 series.
                    </p>
                    <a 
                      href="https://kg5rki.com/new2/index.php" 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      Visit KG5RKI Archive
                    </a>
                  </div>

                  <div className="widget-container p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Info className="w-6 h-6 text-[#ffb000]" />
                      <h3 className="text-lg font-bold">Documentation</h3>
                    </div>
                    <p className="text-sm opacity-70 mb-6 leading-relaxed">
                      Comprehensive guide for Tytera MD-380 Toolz. Covers installation, features, and advanced configuration.
                    </p>
                    <a 
                      href="https://www.miklor.com/DMR/pdf/TyMD380Toolz.pdf" 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-secondary w-full flex items-center justify-center gap-2 mb-4"
                    >
                      <Download className="w-4 h-4" /> Download PDF Guide
                    </a>
                    <a 
                      href="https://www.qsl.net/dl4yhf/RT3/md380_fw.html" 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-secondary w-full flex items-center justify-center gap-2 mb-4"
                    >
                      <Info className="w-4 h-4" /> DL4YHF Firmware Info
                    </a>
                    <a 
                      href="https://evoham.com/dmr-programming-software-firmware/" 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-secondary w-full flex items-center justify-center gap-2 mb-4"
                    >
                      <Smartphone className="w-4 h-4" /> EvoHam Programming Guide
                    </a>
                    <a 
                      href="https://www.darc.de/fileadmin/filemounts/distrikte/n/ortsverbaende/20/Downloads/DMR-Software/Installation-und-Benutzung-MD380-Toolz.pdf" 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-secondary w-full flex items-center justify-center gap-2 mb-4"
                    >
                      <Download className="w-4 h-4" /> DARC MD380-Toolz Guide (DE)
                    </a>
                    <a 
                      href="http://firac.at/oe7bsh/QSP_04-2017_md380fw.pdf" 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-secondary w-full flex items-center justify-center gap-2 mb-4"
                    >
                      <Download className="w-4 h-4" /> QSP 04-2017: MD380 Firmware (DE)
                    </a>
                    <a 
                      href="https://www.media2000.org/1203/" 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-secondary w-full flex items-center justify-center gap-2 mb-4"
                    >
                      <Info className="w-4 h-4" /> Media2000 MD-380 Resource
                    </a>
                    <a 
                      href="https://www.media2000.org/1197/" 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-secondary w-full flex items-center justify-center gap-2 mb-4"
                    >
                      <Info className="w-4 h-4" /> Media2000 Tools & Guides
                    </a>
                    <a 
                      href="https://www.tyt888.com/download.html" 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-secondary w-full flex items-center justify-center gap-2 mb-4"
                    >
                      <Download className="w-4 h-4" /> TYT Official Downloads
                    </a>
                    <a 
                      href="https://dc7jzb.de/tutorials/funkgeraete/tytera-md380/funktionen-der-md380tools/" 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-secondary w-full flex items-center justify-center gap-2 mb-4"
                    >
                      <Info className="w-4 h-4" /> DC7JZB Tools Tutorial (DE)
                    </a>
                    <a 
                      href="https://github.com/travisgoodspeed/md380tools/blob/master/README.de.md" 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-secondary w-full flex items-center justify-center gap-2 mb-4"
                    >
                      <Github className="w-4 h-4" /> md380tools README (DE)
                    </a>
                    <a 
                      href="https://dl-nordwest.com/index.php/2025/03/23/modifikation-eines-tyt-md380-retevis-rt3-fuer-m17-erfahrungsbericht/" 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-secondary w-full flex items-center justify-center gap-2 mb-4"
                    >
                      <Info className="w-4 h-4" /> DL-Nordwest M17 Mod (DE)
                    </a>
                    <a 
                      href="https://www.ok1pmp.eu/tyt-md-380-firmware/" 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-secondary w-full flex items-center justify-center gap-2 mb-4"
                    >
                      <Info className="w-4 h-4" /> OK1PMP Firmware Guide (CZ)
                    </a>
                    <a 
                      href="https://www.radiofouine.net/downloads/Public/DMR/Tytera/MD-380/Firmwares/" 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-secondary w-full flex items-center justify-center gap-2 mb-4"
                    >
                      <Folder className="w-4 h-4" /> RadioFouine Firmware Archive
                    </a>
                    <a 
                      href="https://www.qsl.net/kb9mwr/projects/dv/dmr/Reverse%20Engineering%20the%20Tytera%20MD380.pdf" 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-secondary w-full flex items-center justify-center gap-2 mb-4"
                    >
                      <Download className="w-4 h-4" /> Reverse Engineering Report (KB9MWR)
                    </a>
                    <a 
                      href="https://kg5rki.com/MD380_AIO/TyteraFlashToolv1_05.zip" 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-secondary w-full flex items-center justify-center gap-2 mb-4"
                    >
                      <Download className="w-4 h-4" /> Tytera Flash Tool v1.05
                    </a>
                    <a 
                      href="https://kg5rki.com/MD380_BETA/TyteraFlashTool_v1_08c_BETA.zip" 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-secondary w-full flex items-center justify-center gap-2 mb-4"
                    >
                      <Download className="w-4 h-4" /> Tytera Flash Tool v1.08c BETA
                    </a>
                    <a 
                      href="https://kg5rki.com/MD380_AIO/TyMD380Toolz.apk" 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-secondary w-full flex items-center justify-center gap-2 mb-4"
                    >
                      <Download className="w-4 h-4" /> MD380Toolz Android App
                    </a>
                    <a 
                      href="https://wiki.brandmeister.network/index.php/MD380_Support" 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-secondary w-full flex items-center justify-center gap-2 mb-4"
                    >
                      <Info className="w-4 h-4" /> BrandMeister MD380 Support
                    </a>
                    <a 
                      href="https://www.sbarc.org/Downloads/DMR/Firmware/DMR%20MD380%20Toolz%20Made%20Easy.pdf" 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-secondary w-full flex items-center justify-center gap-2 mb-4"
                    >
                      <FileText className="w-4 h-4" /> MD380 Toolz Made Easy (SBARC)
                    </a>
                    <a 
                      href="https://www.darc.de/der-club/distrikte/e/ortsverbaende/29/download/" 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-secondary w-full flex items-center justify-center gap-2 mb-4"
                    >
                      <Download className="w-4 h-4" /> DARC District E29 Downloads (DE)
                    </a>
                    <a 
                      href="http://firac.at/oe7bsh/QSP_04-2017_md380fw.pdf" 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-secondary w-full flex items-center justify-center gap-2 mb-4"
                    >
                      <FileText className="w-4 h-4" /> QSP 04-2017 MD380 Firmware (DE)
                    </a>
                    <a 
                      href="https://www.facebook.com/groups/KD4ZToolkit/" 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-secondary w-full flex items-center justify-center gap-2 mb-4"
                    >
                      <Users className="w-4 h-4" /> KD4Z Toolkit Facebook Group
                    </a>
                    <a 
                      href="https://www.buytwowayradios.com/tyt-md-uv380.html" 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-secondary w-full flex items-center justify-center gap-2 mb-4"
                    >
                      <Download className="w-4 h-4" /> BuyTwoWayRadios (Drivers/SW)
                    </a>
                    <a 
                      href="https://kg5rki.com/MD380_AIO/experiment.bin" 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-secondary w-full flex items-center justify-center gap-2 mb-4"
                    >
                      <Download className="w-4 h-4" /> MD380Tools F/W V01.34
                    </a>
                    <a 
                      href="https://cdn-learn.adafruit.com/downloads/pdf/tytera-md-380-dmr.pdf" 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-secondary w-full flex items-center justify-center gap-2 mb-4"
                    >
                      <FileText className="w-4 h-4" /> Adafruit MD-380 DMR Guide
                    </a>
                    <a 
                      href="https://sq9jdo.com.pl/MD-380/MD-380_Tools/md380tools_1.html" 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-secondary w-full flex items-center justify-center gap-2 mb-4"
                    >
                      <Info className="w-4 h-4" /> SQ9JDO MD-380 Tools Guide (PL)
                    </a>
                    <a 
                      href="https://web1.foxhollow.ca/DMR/Files/Firmware/MD380-MD390-Windows-Radio-Updater.zip" 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-secondary w-full flex items-center justify-center gap-2 mb-4"
                    >
                      <Download className="w-4 h-4" /> Windows Radio Updater (Zip)
                    </a>
                    <a 
                      href="https://md380.org/releases/daily/" 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-secondary w-full flex items-center justify-center gap-2 mb-4"
                    >
                      <Download className="w-4 h-4" /> MD380 Daily Releases
                    </a>
                    <a 
                      href="https://swissdmr.ch/download/tytera/CPS-TYT-setup_v1_37.zip" 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-secondary w-full flex items-center justify-center gap-2 mb-4"
                    >
                      <Download className="w-4 h-4" /> CPS v1.37 (SwissDMR)
                    </a>
                    <a 
                      href="https://einstein.amsterdam/?page_id=316" 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-secondary w-full flex items-center justify-center gap-2 mb-4"
                    >
                      <Info className="w-4 h-4" /> Einstein.amsterdam Firmware Info
                    </a>
                    <a 
                      href="https://learn.adafruit.com/tytera-md-380-dmr/updating-md-380-firmware" 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-secondary w-full flex items-center justify-center gap-2 mb-4"
                    >
                      <Info className="w-4 h-4" /> Adafruit Firmware Update Guide
                    </a>
                    <a 
                      href="https://github.com/KD4Z/md380tools-vm" 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-secondary w-full flex items-center justify-center gap-2"
                    >
                      <Github className="w-4 h-4" /> KD4Z md380tools-vm
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="widget-container p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Settings className="w-6 h-6 text-[#ffb000]" />
                      <h3 className="text-lg font-bold">Hardware Mods & Tech Info (F4BQN)</h3>
                    </div>
                    <div className="space-y-3">
                      <a 
                        href="http://f4bqn.free.fr/Mods-MD-380/micro.htm" 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 border border-[#333333] rounded hover:border-[#ffb000] transition-colors"
                      >
                        <span className="text-xs">Mic/Speaker Connector Pinout</span>
                        <Info className="w-3 h-3 opacity-30" />
                      </a>
                      <a 
                        href="http://radioaficion.com/cms/md-380-dmr/" 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 border border-[#333333] rounded hover:border-[#ffb000] transition-colors"
                      >
                        <span className="text-xs">Internal Hardware View</span>
                        <Info className="w-3 h-3 opacity-30" />
                      </a>
                      <a 
                        href="http://f4bqn.free.fr/Mods-MD-380/MD-380UHF_RF_schematic.pdf" 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 border border-[#333333] rounded hover:border-[#ffb000] transition-colors"
                      >
                        <span className="text-xs">RF Schematic (PDF)</span>
                        <Download className="w-3 h-3 opacity-30" />
                      </a>
                      <a 
                        href="http://f4bqn.free.fr/Mods-MD-380/Reverse%20Engineering%20the%20Tytera%20MD380.pdf" 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 border border-[#333333] rounded hover:border-[#ffb000] transition-colors"
                      >
                        <span className="text-xs">Reverse Engineering Report (PDF)</span>
                        <Download className="w-3 h-3 opacity-30" />
                      </a>
                    </div>
                  </div>

                  <div className="widget-container p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Cpu className="w-6 h-6 text-[#ffb000]" />
                      <h3 className="text-lg font-bold">Build Environments</h3>
                    </div>
                    <p className="text-sm opacity-70 mb-4 leading-relaxed">
                      For developers wanting to build their own firmware patches.
                    </p>
                    <div className="space-y-3">
                      <div className="p-4 border border-[#333333] rounded bg-[#1a1a1a]">
                        <h4 className="text-xs font-bold text-[#ffb000] mb-2">KD4Z md380tools-vm</h4>
                        <p className="text-[10px] opacity-60 mb-3">
                          A pre-configured VirtualBox VM that provides a complete Linux build environment for md380tools. 
                          Includes all necessary compilers and scripts.
                        </p>
                        <a 
                          href="https://github.com/KD4Z/md380tools-vm" 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[10px] text-[#ffb000] hover:underline flex items-center gap-1"
                        >
                          <Github className="w-3 h-3" /> View Repository
                        </a>
                      </div>
                      <div className="p-4 border border-[#333333] rounded bg-[#1a1a1a]">
                        <h4 className="text-xs font-bold text-[#ffb000] mb-2">SwissDMR Resources</h4>
                        <p className="text-[10px] opacity-60 mb-3">
                          Experimental firmware D13 (MD380/390) and S13 (GPS) along with official CPS software.
                        </p>
                        <a 
                          href="https://swissdmr.ch/wordpress/?page_id=1759" 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[10px] text-[#ffb000] hover:underline flex items-center gap-1"
                        >
                          <Info className="w-3 h-3" /> SwissDMR MD380/390 Page
                        </a>
                      </div>
                      <div className="p-4 border border-[#333333] rounded bg-[#1a1a1a]">
                        <h4 className="text-xs font-bold text-[#ffb000] mb-2">DL4YHF Firmware Overview</h4>
                        <p className="text-[10px] opacity-60 mb-3">
                          Deep technical analysis of the MD380 firmware, including source code overview, diagnostic functions, and disassembly guides.
                        </p>
                        <a 
                          href="https://www.qsl.net/dl4yhf/RT3/md380_fw.html" 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[10px] text-[#ffb000] hover:underline flex items-center gap-1"
                        >
                          <Info className="w-3 h-3" /> Technical Deep Dive
                        </a>
                      </div>
                      <div className="p-4 border border-[#333333] rounded bg-[#1a1a1a]">
                        <h4 className="text-xs font-bold text-[#ffb000] mb-2">Foxhollow Experimental Firmware</h4>
                        <p className="text-[10px] opacity-60 mb-3">
                          Latest experimental firmware (2025-01-13) for MD380/390 and RT3/RT8. Includes patched features and daily updates.
                        </p>
                        <a 
                          href="https://web1.foxhollow.ca/DMR/?menu=experimental" 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[10px] text-[#ffb000] hover:underline flex items-center gap-1 mb-2"
                        >
                          <Download className="w-3 h-3" /> Latest Experimental Build
                        </a>
                        <a 
                          href="https://web1.foxhollow.ca/DMR/TYT/Firmware/Experimental/" 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[10px] text-[#ffb000] hover:underline flex items-center gap-1"
                        >
                          <Info className="w-3 h-3" /> Direct Directory Listing
                        </a>
                      </div>
                      <div className="p-4 border border-[#333333] rounded bg-[#1a1a1a]">
                        <h4 className="text-xs font-bold text-[#ffb000] mb-2">IK6DIO Backup Repository</h4>
                        <p className="text-[10px] opacity-60 mb-3">
                          A comprehensive backup of various firmware versions for MD380/390 and RT3/RT8, including older stable releases and tools.
                        </p>
                        <a 
                          href="https://www.ik6dio.it/download-2/windows/backup-firmware-for-md380390-rt38/" 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[10px] text-[#ffb000] hover:underline flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" /> View Backup Archive
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="widget-container p-6 mb-8">
                  <h3 className="text-sm font-bold uppercase tracking-widest opacity-50 mb-4">Quick Setup Guide (SQ9JDO)</h3>
                  <div className="space-y-4 text-xs opacity-70 leading-relaxed">
                    <p>1. **Download Tools**: Get the Windows Radio Updater from the Resources section.</p>
                    <p>2. **DFU Mode**: Turn radio OFF. Hold **PTT** + **Top Orange Button** and turn ON. LED should flash red/green.</p>
                    <p>3. **Connect**: Use a standard MD-380 USB programming cable to connect to your PC.</p>
                    <p>4. **Flash**: Run the updater, select your firmware (e.g., V01.34), and click Update.</p>
                    <p className="text-[10px] italic mt-2 opacity-50">Note: Ensure drivers are installed from BuyTwoWayRadios for Windows 10 Pro users.</p>
                  </div>
                </div>

                <div className="widget-container p-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest opacity-50 mb-4">External Repositories</h3>
                  <div className="space-y-4">
                    <a 
                      href="https://github.com/DMR-Database/md380tools.git" 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center justify-between p-4 border border-[#333333] rounded hover:border-[#ffb000] transition-colors mb-4"
                    >
                      <div className="flex items-center gap-3">
                        <Github className="w-4 h-4 opacity-50" />
                        <div>
                          <p className="text-sm font-bold">DMR-Database / md380tools</p>
                          <p className="text-[10px] opacity-50">Main firmware repository and build environment</p>
                        </div>
                      </div>
                      <Download className="w-4 h-4 opacity-30" />
                    </a>
                    <a 
                      href="https://github.com/travisgoodspeed/md380tools.git" 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center justify-between p-4 border border-[#333333] rounded hover:border-[#ffb000] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Github className="w-4 h-4 opacity-50" />
                        <div>
                          <p className="text-sm font-bold">Travis Goodspeed / md380tools</p>
                          <p className="text-[10px] opacity-50">The pioneering repository for MD-380 firmware reverse engineering and C5000 baseband research.</p>
                        </div>
                      </div>
                      <Download className="w-4 h-4 opacity-30" />
                    </a>
                    <a 
                      href="https://github.com/wh6av/win380-390-tools.git" 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center justify-between p-4 border border-[#333333] rounded hover:border-[#ffb000] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Github className="w-4 h-4 opacity-50" />
                        <div>
                          <p className="text-sm font-bold">wh6av / win380-390-tools</p>
                          <p className="text-[10px] opacity-50">Windows-based tools for MD-380/390 firmware management and user database updates.</p>
                        </div>
                      </div>
                      <Download className="w-4 h-4 opacity-30" />
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
