import React, { useEffect, useState, useCallback } from 'react';
import { ShieldAlert, FileWarning, SearchX, Activity, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { socket } from '../lib/socket';

export const KnowledgeHealth = () => {
  const [gaps, setGaps] = useState<{ gap: string, recommendation: string }[]>([]);
  const [metrics, setMetrics] = useState({ searchFailureRate: '0.0', outdatedDocuments: 0, knowledgeScore: 100 });
  const [loading, setLoading] = useState(true);

  const [chartData, setChartData] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [gapsRes, chartRes] = await Promise.all([
        fetch('http://localhost:3000/ai/knowledge-gaps'),
        fetch('http://localhost:3000/analytics/searches')
      ]);
      const data = await gapsRes.json();
      const analytics = await chartRes.json();
      
      setGaps(data.gaps ? data.gaps : []);
      if (data.metrics) setMetrics(data.metrics);
      setChartData(analytics);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    socket.on('analytics-updated', () => {
      fetchData();
    });

    return () => {
      socket.off('analytics-updated');
    };
  }, [fetchData]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Knowledge Health</h2>
        <p className="text-muted-foreground mt-2">
          Monitor your organization's knowledge coverage and identify missing documentation.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-card border rounded-xl shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Search Failure Rate</p>
            <h3 className="text-3xl font-bold mt-2 text-foreground">{metrics.searchFailureRate}%</h3>
            <p className="text-xs text-muted-foreground mt-1">Based on recent searches</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
            <SearchX size={24} />
          </div>
        </div>
        
        <div className="bg-card border rounded-xl shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Outdated Documents</p>
            <h3 className="text-3xl font-bold mt-2 text-foreground">{metrics.outdatedDocuments}</h3>
            <p className="text-xs text-orange-500 mt-1">Not updated in 6+ months</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center">
            <FileWarning size={24} />
          </div>
        </div>

        <div className="bg-card border rounded-xl shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Knowledge Score</p>
            <h3 className="text-3xl font-bold mt-2 text-foreground">{metrics.knowledgeScore}/100</h3>
            <p className="text-xs text-muted-foreground mt-1">Based on workspace activity</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
            <Activity size={24} />
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Activity className="mr-2 text-primary" size={20} />
            Live Search Volume & Success
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Real-time tracking of employee searches across the knowledge base.</p>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line type="monotone" dataKey="successful" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Successful Searches" />
              <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Failed Searches" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold flex items-center">
              <ShieldAlert className="mr-2 text-primary" size={20} />
              AI Knowledge Gap Detection
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Based on recent failed searches and user queries, the AI has identified the following missing knowledge areas.
            </p>
          </div>
          <button 
            onClick={fetchData}
            className="p-2 border rounded-md hover:bg-accent text-muted-foreground transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="p-0">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground animate-pulse">
              Analyzing search patterns across the organization...
            </div>
          ) : gaps.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mb-4">
                <Activity size={24} />
              </div>
              No critical knowledge gaps detected! Your workspace is healthy.
            </div>
          ) : (
            <div className="divide-y">
              {gaps.map((gap, i) => (
                <div key={i} className="p-6 flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <h4 className="font-semibold text-orange-600 dark:text-orange-400">{gap.gap}</h4>
                    <p className="text-sm text-muted-foreground mt-2">{gap.recommendation}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="px-4 py-2 text-sm border rounded-md hover:bg-accent font-medium transition-colors">
                      Ignore
                    </button>
                    <button className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium transition-colors">
                      Assign to Team
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
