import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { Search, FileText, Users, MessageSquare, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const CommandPalette = ({ open, setOpen }: { open: boolean, setOpen: (v: boolean) => void }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{documents: any[], teams: any[]}>({ documents: [], teams: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, setOpen]);

  useEffect(() => {
    if (!query) {
      setResults({ documents: [], teams: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-background/50 backdrop-blur-sm" 
            onClick={() => setOpen(false)} 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.96, y: -10 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="w-full max-w-2xl bg-card border shadow-2xl rounded-xl overflow-hidden z-10 relative"
          >
            <Command label="Global Command Menu" className="w-full" shouldFilter={false}>
              <div className="flex items-center border-b px-4 py-4 space-x-3">
                <Search className="w-5 h-5 text-primary" />
                <Command.Input 
                  placeholder="Search knowledge base, teams, or ask AI..." 
                  className="w-full bg-transparent border-0 focus:ring-0 outline-none text-foreground placeholder:text-muted-foreground/60 text-lg"
                  value={query}
                  onValueChange={setQuery}
                  autoFocus
                />
                <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border bg-muted px-2 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">ESC</span>
                </kbd>
              </div>
              
              <Command.List className="max-h-[60vh] overflow-y-auto p-2">
                <Command.Empty className="py-10 text-center flex flex-col items-center justify-center space-y-3">
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm text-muted-foreground font-medium">Searching across workspace...</p>
                    </>
                  ) : (
                    <>
                      <Search className="w-10 h-10 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground font-medium">No results found for "{query}"</p>
                    </>
                  )}
                </Command.Empty>

                {results.documents.length > 0 && (
                  <Command.Group heading="Documents" className="px-2 py-1.5 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                    {results.documents.map((doc, i) => (
                      <Command.Item key={i} className="flex flex-col items-start px-3 py-3 rounded-lg hover:bg-muted/60 aria-selected:bg-muted/80 cursor-pointer transition-colors mt-1">
                        <div className="flex items-center text-foreground font-medium text-sm">
                          <FileText className="w-4 h-4 mr-3 text-blue-500" />
                          <span>{doc.title}</span>
                        </div>
                        <span className="text-xs text-muted-foreground mt-1.5 line-clamp-1 pl-7">{doc.snippet}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {results.teams.length > 0 && (
                  <Command.Group heading="Teams" className="px-2 py-1.5 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mt-4">
                    {results.teams.map((team, i) => (
                      <Command.Item key={i} className="flex items-center px-3 py-2.5 rounded-lg hover:bg-muted/60 aria-selected:bg-muted/80 cursor-pointer transition-colors mt-1 text-sm">
                        <Users className="w-4 h-4 mr-3 text-green-500" />
                        <span className="text-foreground font-medium">{team.name}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
                
                {query && (
                  <Command.Group heading="AI Intelligence" className="px-2 py-1.5 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mt-4">
                    <Command.Item 
                      onSelect={() => {
                        setOpen(false);
                        navigate('/chat', { state: { initialQuery: query } });
                      }}
                      className="flex items-center px-3 py-3 rounded-lg bg-primary/5 border border-primary/10 hover:bg-primary/10 aria-selected:bg-primary/10 cursor-pointer transition-colors mt-1 text-sm group"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="text-primary font-medium">Ask AI to synthesize answers for "{query}"</span>
                    </Command.Item>
                  </Command.Group>
                )}
              </Command.List>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
