import React, { useState, useEffect } from 'react';
import { Users, Shield, UserPlus, Settings, MoreVertical, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { API_URL } from '../lib/api';

export const Teams = () => {
  const [teams, setTeams] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [manageTeam, setManageTeam] = useState<any | null>(null);

  // OTP Verification State
  const [otpName, setOtpName] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    fetchTeams();
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`);
      setAllUsers(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await fetch(`${API_URL}/teams`);
      setTeams(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    const name = prompt('Enter team name:');
    if (!name) return;
    
    await fetch(`${API_URL}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    fetchTeams();
  };

  const handleDeleteTeam = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return;
    await fetch(`${API_URL}/teams/${id}`, { method: 'DELETE' });
    toast.success('Team deleted');
    fetchTeams();
  };

  const handleAddMember = async (teamId: string, userId: string) => {
    try {
      await fetch(`${API_URL}/teams/${teamId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      toast.success('Member added');
      fetchTeams();
      if (manageTeam) {
        setManageTeam({ 
          ...manageTeam, 
          members: [...(manageTeam.members || []), { userId: userId }] 
        });
      }
    } catch (e) {
      toast.error('Failed to add member');
    }
  };

  const handleRemoveMember = async (teamId: string, userId: string) => {
    try {
      await fetch(`http://localhost:3000/teams/${teamId}/members/${userId}`, { method: 'DELETE' });
      toast.success('Member removed');
      fetchTeams();
      if (manageTeam) {
        setManageTeam({ 
          ...manageTeam, 
          members: (manageTeam.members || []).filter((m: any) => m.userId !== userId) 
        });
      }
    } catch (e) {
      toast.error('Failed to remove member');
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpName || !otpEmail) {
      toast.error('Name and Email are required');
      return;
    }
    
    try {
      const res = await fetch(`http://localhost:3000/teams/${manageTeam.id}/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: otpName, email: otpEmail })
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        toast.success(`OTP Sent! Check your console. Simulated Code: ${data.simulatedOtp}`);
      } else {
        toast.error(data.error || 'Failed to send OTP');
      }
    } catch (e) {
      toast.error('Failed to send OTP');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      toast.error('OTP code is required');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/teams/${manageTeam.id}/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, code: otpCode })
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Member verified and added!');
        fetchTeams();
        fetchAllUsers(); // Refresh users list just in case
        
        // Reset state
        setOtpSent(false);
        setOtpName('');
        setOtpEmail('');
        setOtpCode('');
        
        if (manageTeam) {
          setManageTeam({ 
            ...manageTeam, 
            members: [...(manageTeam.members || []), { userId: data.user.id }] 
          });
        }
      } else {
        toast.error(data.error || 'Invalid OTP');
      }
    } catch (e) {
      toast.error('Failed to verify OTP');
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Team Management</h2>
          <p className="text-muted-foreground mt-2">
            Manage your organization's teams, roles, and knowledge access.
          </p>
        </div>
        <button 
          onClick={handleCreateTeam}
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <UserPlus size={18} className="mr-2" />
          Create Team
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading teams...</div>
      ) : teams.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">No teams found. Create one to get started!</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teams.map(team => (
          <div key={team.id} className="bg-card border rounded-xl shadow-sm p-6 flex flex-col transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Users size={24} />
              </div>
              <button 
                onClick={() => handleDeleteTeam(team.id)}
                className="text-muted-foreground hover:text-red-500 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
            
            <h3 className="text-xl font-semibold tracking-tight">{team.name}</h3>
            
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Members:</span>
                <span className="font-medium text-foreground">{team.members?.length || 0}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Documents:</span>
                <span className="font-medium text-foreground">{team.documents?.length || 0}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t flex justify-end">
              <button 
                onClick={() => setManageTeam(team)}
                className="text-sm font-medium text-primary hover:underline flex items-center"
              >
                <Settings size={14} className="mr-1" />
                Manage Access
              </button>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Manage Access Modal */}
      {manageTeam && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border shadow-lg rounded-xl w-full max-w-lg p-6 relative">
            <button 
              onClick={() => {
                setManageTeam(null);
                setOtpSent(false);
                setOtpName('');
                setOtpEmail('');
                setOtpCode('');
              }}
              className="absolute top-4 right-4 text-muted-foreground hover:bg-muted p-1 rounded-md transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold tracking-tight mb-1">Manage Access: {manageTeam.name}</h3>
            <p className="text-sm text-muted-foreground mb-6">Add or remove users from this team to grant them access to its knowledge base.</p>
            
            <div className="space-y-6">
              
              {/* Add New Member Section */}
              <div className="bg-muted/30 p-4 rounded-xl border">
                <h4 className="font-semibold text-sm mb-3">Add New Member</h4>
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name</label>
                      <input 
                        type="text" 
                        value={otpName}
                        onChange={(e) => setOtpName(e.target.value)}
                        placeholder="Alice Smith"
                        className="w-full text-sm rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Email Address</label>
                      <input 
                        type="email" 
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        placeholder="alice@company.com"
                        className="w-full text-sm rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
                    >
                      Send Verification Code
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-3">
                    <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs rounded-md border border-blue-500/20">
                      An OTP has been sent to <strong>{otpEmail}</strong>. Please enter the 6-digit code below.
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Verification Code</label>
                      <input 
                        type="text" 
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="123456"
                        maxLength={6}
                        className="w-full text-sm rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 text-center tracking-widest font-mono"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="w-1/3 py-2 bg-muted text-foreground text-sm font-medium rounded-md hover:bg-muted/80 transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="w-2/3 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
                      >
                        Verify & Add
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Current Members Section */}
              <div>
                <h4 className="font-semibold text-sm mb-3">Current Members</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {manageTeam.members?.map((member: any) => {
                    const user = allUsers.find(u => u.id === member.userId);
                    if (!user) return null;
                    return (
                      <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg bg-background">
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email || 'No email'}</p>
                        </div>
                        <button 
                          onClick={() => handleRemoveMember(manageTeam.id, user.id)}
                          className="px-3 py-1.5 text-xs font-medium border border-destructive/20 text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-md transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                  {(!manageTeam.members || manageTeam.members.length === 0) && (
                    <div className="text-center p-4 text-sm text-muted-foreground border border-dashed rounded-lg">
                      No members in this team yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
