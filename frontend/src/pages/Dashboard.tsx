import React from 'react';
import { Activity, FileText, Users, Search, ChevronUp, Sparkles, Network, Trophy, Star, BookOpen, UserCircle, Target } from 'lucide-react';
import { ActivityFeed } from '../components/ActivityFeed';
import { motion } from 'framer-motion';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const chartData = [
  { name: 'Mon', queries: 400, documents: 240, engagement: 2400 },
  { name: 'Tue', queries: 300, documents: 139, engagement: 2210 },
  { name: 'Wed', queries: 550, documents: 980, engagement: 2290 },
  { name: 'Thu', queries: 278, documents: 390, engagement: 2000 },
  { name: 'Fri', queries: 189, documents: 480, engagement: 2181 },
  { name: 'Sat', queries: 239, documents: 380, engagement: 2500 },
  { name: 'Sun', queries: 349, documents: 430, engagement: 2100 },
];

const leaderboard = [
  { id: 1, name: 'Sarah Chen', role: 'Engineering', points: 1250, badge: 'Wiki Master' },
  { id: 2, name: 'Alex Rivera', role: 'Product', points: 980, badge: 'Top Contributor' },
  { id: 3, name: 'Michael Chang', role: 'Support', points: 840, badge: 'Knowledge Star' },
  { id: 4, name: 'Emma Watson', role: 'Design', points: 720, badge: 'Active Helper' },
];

const recommendations = [
  { id: 1, title: '2026 Q3 Objectives', type: 'doc', context: 'Based on your recent searches' },
  { id: 2, title: 'Sarah Chen', type: 'expert', context: 'Expert in Frontend Architecture' },
  { id: 3, title: 'Design System Migration', type: 'thread', context: 'Trending discussion in your team' },
];

const StatCard = ({ title, value, trend, icon: Icon, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -5, scale: 1.02 }}
    className="glass-card p-6 rounded-2xl relative overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 border border-white/5"
  >
    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity duration-500 scale-150 group-hover:scale-110">
      <Icon size={80} />
    </div>
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
      <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="p-2 ai-gradient-bg text-white rounded-lg shadow-md ring-1 ring-white/20 group-hover:ring-white/40 transition-all">
        <Icon size={18} />
      </div>
    </div>
    <div className="pt-2 relative z-10">
      <div className="text-3xl font-bold tracking-tight">{value}</div>
      <p className="text-xs text-emerald-500 font-medium mt-1 flex items-center">
        <ChevronUp size={14} className="mr-1" />
        {trend} from last month
      </p>
    </div>
  </motion.div>
);

export const Dashboard = () => {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-4xl font-extrabold tracking-tight ai-gradient-text drop-shadow-sm">
          Executive Insights Dashboard
        </h2>
        <p className="text-muted-foreground mt-2">
          Comprehensive overview of organizational knowledge health and engagement.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Documents" value="1,248" trend="+12%" icon={FileText} delay={0.1} />
        <StatCard title="Active Users" value="842" trend="+5%" icon={Users} delay={0.2} />
        <StatCard title="AI Queries" value="12,450" trend="+24%" icon={Search} delay={0.3} />
        <StatCard title="Knowledge Score" value="94/100" trend="+2%" icon={Activity} delay={0.4} />
      </div>

      <div className="grid gap-6 md:grid-cols-12 mt-8">
        {/* Main Analytics Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="col-span-12 lg:col-span-8 glass-panel rounded-3xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 ai-gradient-bg opacity-50"></div>
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg flex items-center">
                <Network className="mr-2 text-primary" size={20} />
                Knowledge Engagement Overview
              </h3>
              <p className="text-sm text-muted-foreground">Search volume vs Documentation created over time.</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area type="monotone" dataKey="queries" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorQueries)" />
                <Area type="monotone" dataKey="documents" stroke="hsl(var(--muted-foreground))" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Knowledge Health Gauge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="col-span-12 lg:col-span-4 glass-panel rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-50"></div>
          <div>
            <h3 className="font-semibold text-lg flex items-center">
              <Activity className="mr-2 text-emerald-500" size={20} />
              Organization Health Score
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Based on documentation coverage and freshness.</p>
          </div>
          
          <div className="flex flex-col items-center justify-center flex-1 my-6">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="88" fill="none" stroke="currentColor" strokeWidth="12" className="text-muted/30" />
                <circle cx="96" cy="96" r="88" fill="none" stroke="currentColor" strokeWidth="12" className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" strokeDasharray="552.9" strokeDashoffset="55.3" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-5xl font-bold text-foreground tracking-tighter">90<span className="text-2xl text-muted-foreground">%</span></span>
                <span className="text-sm font-medium text-emerald-500 mt-1 flex items-center"><ChevronUp size={14} /> +3%</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 rounded-lg bg-muted/50 border">
              <div className="text-sm font-medium text-muted-foreground">Search Success</div>
              <div className="text-lg font-bold">94.2%</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 border">
              <div className="text-sm font-medium text-muted-foreground">Freshness</div>
              <div className="text-lg font-bold">88.5%</div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-12 mt-8">
        {/* Knowledge Gap Detection */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="col-span-12 lg:col-span-4 glass-panel rounded-3xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-red-400 opacity-50"></div>
          <h3 className="font-semibold text-lg mb-6 flex items-center">
            <Target className="mr-2 text-orange-500" size={20} />
            AI Knowledge Gaps
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 transition-colors cursor-pointer group">
              <h4 className="text-orange-600 dark:text-orange-400 font-semibold text-sm flex justify-between items-center">
                Missing Policy
                <span className="text-xs bg-orange-500/20 px-2 py-0.5 rounded-full">High Priority</span>
              </h4>
              <p className="text-sm mt-2 text-muted-foreground leading-relaxed">Multiple failed searches for "2026 Remote Work Policy". <br/><span className="text-foreground font-medium group-hover:underline">Recommend creating this document.</span></p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors cursor-pointer group">
              <h4 className="text-red-600 dark:text-red-400 font-semibold text-sm flex justify-between items-center">
                Outdated Resource
                <span className="text-xs bg-red-500/20 px-2 py-0.5 rounded-full">Critical</span>
              </h4>
              <p className="text-sm mt-2 text-muted-foreground leading-relaxed">"API V1 Deprecation" hasn't been updated in 8 months.</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors cursor-pointer group">
              <h4 className="text-blue-600 dark:text-blue-400 font-semibold text-sm flex justify-between items-center">
                Trending Question
                <span className="text-xs bg-blue-500/20 px-2 py-0.5 rounded-full">Review</span>
              </h4>
              <p className="text-sm mt-2 text-muted-foreground leading-relaxed">"How to request hardware" asked 45 times this week. Consider adding to FAQ.</p>
            </div>
          </div>
        </motion.div>

        {/* Gamification Leaderboard */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="col-span-12 lg:col-span-4 glass-panel rounded-3xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-amber-500 opacity-50"></div>
          <h3 className="font-semibold text-lg mb-6 flex items-center">
            <Trophy className="mr-2 text-yellow-500" size={20} />
            Knowledge Champions
          </h3>
          <div className="space-y-4">
            {leaderboard.map((user, idx) => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    idx === 0 ? 'bg-yellow-500/20 text-yellow-600 border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]' : 
                    idx === 1 ? 'bg-slate-300/20 text-slate-400 border border-slate-300/30' : 
                    idx === 2 ? 'bg-amber-700/20 text-amber-600 border border-amber-700/30' : 
                    'bg-primary/10 text-primary'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">{user.name}</h4>
                    <p className="text-xs text-muted-foreground flex items-center">
                      {user.role} • <Star size={10} className="mx-1 text-yellow-500" /> {user.badge}
                    </p>
                  </div>
                </div>
                <div className="text-sm font-bold bg-muted px-2 py-1 rounded-md">
                  {user.points} <span className="text-muted-foreground text-xs font-medium">pts</span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 border rounded-xl text-sm font-medium hover:bg-muted transition-colors text-muted-foreground">
            View Full Leaderboard
          </button>
        </motion.div>

        {/* Personalized Recommendations */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9 }}
          className="col-span-12 lg:col-span-4 glass-panel rounded-3xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-500 opacity-50"></div>
          <h3 className="font-semibold text-lg mb-6 flex items-center">
            <Sparkles className="mr-2 text-purple-500" size={20} />
            Personalized Feed
          </h3>
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border cursor-pointer flex items-start space-x-3">
                <div className="p-2 bg-background rounded-lg border shadow-sm shrink-0">
                  {rec.type === 'doc' ? <BookOpen size={16} className="text-primary" /> : 
                   rec.type === 'expert' ? <UserCircle size={16} className="text-purple-500" /> : 
                   <Network size={16} className="text-emerald-500" />}
                </div>
                <div>
                  <h4 className="text-sm font-semibold group-hover:text-primary transition-colors">{rec.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{rec.context}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-medium hover:bg-primary/20 transition-colors">
            Ask AI Copilot
          </button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 mt-8">
        {/* Real-time Activity Feed */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <ActivityFeed />
        </motion.div>
      </div>
    </div>
  );
};
