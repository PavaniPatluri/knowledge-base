import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Chat } from './pages/Chat';
import { Documents } from './pages/Documents';
import { Teams } from './pages/Teams';
import { KnowledgeHealth } from './pages/KnowledgeHealth';
import { Admin } from './pages/Admin';
import { KnowledgeExplorer } from './pages/KnowledgeExplorer';
import { KnowledgeGraph } from './pages/KnowledgeGraph';
import { CommandPalette } from './components/CommandPalette';
import { LayoutDashboard, MessageSquare, FileText, Users, Search, Activity, Settings, ChevronLeft, ChevronRight, ChevronDown, Share2, Sun, Moon, Bell, Network } from 'lucide-react';
import { Toaster } from 'sonner';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { cn } from './lib/utils';

const SidebarLink = ({ to, icon: Icon, children, collapsed }: { to: string, icon: any, children: React.ReactNode, collapsed: boolean }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link 
      to={to} 
      className={cn(
        "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 group relative",
        isActive 
          ? "bg-primary text-primary-foreground shadow-sm" 
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
      title={collapsed ? String(children) : undefined}
    >
      <Icon size={18} className={cn("shrink-0", !collapsed && "mr-3")} />
      {!collapsed && (
        <motion.span 
          initial={{ opacity: 0, x: -10 }} 
          animate={{ opacity: 1, x: 0 }} 
          exit={{ opacity: 0, x: -10 }}
          className="whitespace-nowrap"
        >
          {children}
        </motion.span>
      )}
    </Link>
  );
};

const App = () => {
  const [cmdOpen, setCmdOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(o => !o);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Router>
      <Toaster position="top-right" richColors />
      <div className="flex h-screen bg-background text-foreground overflow-hidden selection:bg-primary/20">
        <CommandPalette open={cmdOpen} setOpen={setCmdOpen} />
        
        {/* Sidebar */}
        <motion.aside 
          initial={false}
          animate={{ width: collapsed ? 68 : 260 }}
          className="border-r border-white/5 bg-card/80 backdrop-blur-xl flex flex-col relative z-20 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)]"
        >
          <div className="h-14 border-b flex items-center px-4 justify-between shrink-0">
            {!collapsed && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                className="flex items-center space-x-3 cursor-pointer hover:bg-white/5 p-1.5 rounded-lg transition-all w-full"
              >
                <div className="w-7 h-7 ai-gradient-bg rounded-md shadow-lg flex items-center justify-center text-white font-bold text-xs ring-1 ring-white/20">
                  A
                </div>
                <span className="font-bold text-sm truncate flex-1 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Acme Corp</span>
                <ChevronDown size={14} className="text-muted-foreground" />
              </motion.div>
            )}
            {collapsed && (
              <div className="w-full flex justify-center">
                <div className="w-8 h-8 bg-primary rounded shadow-sm flex items-center justify-center text-primary-foreground font-bold text-sm">
                  A
                </div>
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1 scrollbar-none">
            <SidebarLink collapsed={collapsed} to="/" icon={LayoutDashboard}>Dashboard</SidebarLink>
            <SidebarLink collapsed={collapsed} to="/chat" icon={MessageSquare}>AI Copilot</SidebarLink>
            
            <div className="pt-4 pb-1">
              {!collapsed && <p className="px-3 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2">Knowledge Base</p>}
              <SidebarLink collapsed={collapsed} to="/documents" icon={FileText}>Documents</SidebarLink>
              <SidebarLink collapsed={collapsed} to="/graph" icon={Share2}>Knowledge Graph</SidebarLink>
              <SidebarLink collapsed={collapsed} to="/explorer" icon={Network}>Knowledge Explorer</SidebarLink>
              <SidebarLink collapsed={collapsed} to="/teams" icon={Users}>Teams</SidebarLink>
              <SidebarLink collapsed={collapsed} to="/health" icon={Activity}>Knowledge Health</SidebarLink>
            </div>
          </div>
          
          <div className="p-3 border-t shrink-0">
            <SidebarLink collapsed={collapsed} to="/admin" icon={Settings}>Settings</SidebarLink>
          </div>

          {/* Collapse Toggle Button */}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3.5 top-20 w-7 h-7 bg-background border shadow-sm rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all z-30"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto relative bg-background/50 flex flex-col">
          
          {/* Top Navigation Bar */}
          <header className="h-14 glass-panel flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
            <div className="flex items-center flex-1">
              <button 
                onClick={() => setCmdOpen(true)}
                className="group flex items-center text-sm text-muted-foreground bg-background/50 hover:bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 shadow-sm transition-all w-64 justify-between"
              >
                <div className="flex items-center group-hover:text-primary transition-colors">
                  <Search size={16} className="mr-2" />
                  Search workspace...
                </div>
                <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-white/10 bg-background/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 group-hover:border-primary/30 transition-colors">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-muted-foreground hover:text-primary transition-colors relative hover:scale-110 active:scale-95 duration-200">
                <Bell size={18} />
                <span className="absolute 1 top-0 right-0 w-2 h-2 bg-accent rounded-full border-2 border-background animate-pulse"></span>
              </button>
              
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 active:scale-95 duration-200"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <div className="w-8 h-8 rounded-full ai-gradient-bg border-2 border-background shadow-md cursor-pointer hover:shadow-lg hover:shadow-primary/20 transition-all hover:scale-105"></div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/graph" element={<KnowledgeGraph />} />
              <Route path="/explorer" element={<KnowledgeExplorer />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/health" element={<KnowledgeHealth />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
