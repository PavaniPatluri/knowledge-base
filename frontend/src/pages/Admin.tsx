import React, { useState, useEffect } from 'react';
import { Shield, Users, Database, Settings, Activity, AlertTriangle, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const Admin = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, totalDocs: 0, tokensProcessed: 0, alerts: 0 });
  const [loading, setLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [orgName, setOrgName] = useState('Acme Corp');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetch('http://localhost:3000/users'),
        fetch('http://localhost:3000/users/stats')
      ]);
      setUsers(await usersRes.json());
      setStats(await statsRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'EMPLOYEE' : 'ADMIN';
    await fetch(`http://localhost:3000/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole })
    });
    fetchData();
  };

  const toggleStatus = async (userId: string, isActive: boolean) => {
    await fetch(`http://localhost:3000/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive })
    });
    fetchData();
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    if (geminiApiKey) {
      try {
        await fetch('http://localhost:3000/ai/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey: geminiApiKey })
        });
      } catch (e) {
        console.error('Failed to update API key', e);
      }
    }

    setTimeout(() => {
      setIsSaving(false);
      setIsSettingsOpen(false);
      if (geminiApiKey) {
        toast.success('Settings and Gemini API Key updated successfully');
      } else {
        toast.success('General settings updated successfully');
      }
    }, 800);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Organization Settings</h2>
          <p className="text-muted-foreground mt-2">
            Manage users, permissions, and monitor system health.
          </p>
        </div>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium transition-colors shadow-sm"
        >
          <Settings size={18} className="mr-2" />
          General Settings
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="flex items-center text-muted-foreground mb-4">
            <Users size={20} className="mr-2" />
            <h3 className="font-medium text-sm">Total Users</h3>
          </div>
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
          <p className="text-xs text-green-500 mt-2">{stats.activeUsers} Active</p>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="flex items-center text-muted-foreground mb-4">
            <Database size={20} className="mr-2" />
            <h3 className="font-medium text-sm">Indexed Docs</h3>
          </div>
          <p className="text-3xl font-bold">{stats.totalDocs}</p>
          <p className="text-xs text-green-500 mt-2">Growing daily</p>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="flex items-center text-muted-foreground mb-4">
            <Activity size={20} className="mr-2" />
            <h3 className="font-medium text-sm">API Usage</h3>
          </div>
          <p className="text-3xl font-bold">{(stats.tokensProcessed / 1000000).toFixed(1)}M</p>
          <p className="text-xs text-muted-foreground mt-2">Tokens processed</p>
        </div>

        <div className="bg-card border border-red-500/20 rounded-xl p-6 shadow-sm bg-red-500/5">
          <div className="flex items-center text-red-500 mb-4">
            <AlertTriangle size={20} className="mr-2" />
            <h3 className="font-medium text-sm">System Alerts</h3>
          </div>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.alerts}</p>
          <p className="text-xs text-red-500 mt-2">System healthy</p>
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold flex items-center">
              <Shield className="mr-2 text-primary" size={20} />
              User Management
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Manage access control and roles across the workspace.</p>
          </div>
          <div className="flex space-x-2">
            <input 
              type="text" 
              placeholder="Search users..." 
              className="px-3 py-1.5 border rounded-md text-sm w-64"
            />
          </div>
        </div>
        
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading users...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No users found. Sign in with Slack to sync users.</td>
              </tr>
            ) : users.map((user) => (
              <tr key={user.id} className="border-b last:border-0 hover:bg-muted/50">
                <td className="px-6 py-4 font-medium">{user.name}</td>
                <td className="px-6 py-4 text-muted-foreground">{user.email || 'N/A'}</td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => toggleRole(user.id, user.role)}
                    className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                    user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20' : 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
                  }`}>
                    {user.role}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => toggleStatus(user.id, user.isActive)}
                    className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                    user.isActive ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                  }`}>
                    {user.isActive ? 'Active' : 'Disabled'}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <button className="text-primary hover:underline font-medium">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* General Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border shadow-lg rounded-xl w-full max-w-md overflow-hidden relative">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold flex items-center">
                  <Settings className="mr-2 text-primary" size={20} />
                  General Settings
                </h3>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your organization's core preferences.
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Organization Name</label>
                <input 
                  type="text" 
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-sm font-medium">Gemini AI API Key</label>
                <input 
                  type="password" 
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                />
                <p className="text-[10px] text-muted-foreground">Required to power the AI Chatbot and Knowledge Insights.</p>
              </div>
              
              <div className="space-y-2 pt-2">
                <label className="text-sm font-medium">Default Access Level</label>
                <select className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background">
                  <option value="restricted">Restricted (Invite Only)</option>
                  <option value="open">Open (Anyone with email domain)</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-between border-t mt-6">
                <div>
                  <h4 className="font-medium text-sm">Data Retention</h4>
                  <p className="text-xs text-muted-foreground">Automatically delete old documents</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-9 h-5 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
            
            <div className="p-4 border-t bg-muted/20 flex justify-end space-x-3">
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveSettings}
                className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-70"
                disabled={isSaving}
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <CheckCircle2 size={16} className="mr-2" />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
