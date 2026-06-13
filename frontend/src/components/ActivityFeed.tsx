import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '../lib/socket';
import { Activity, FileText, MessageSquare, Users } from 'lucide-react';

export const ActivityFeed = () => {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    // Listen for real-time events from the server
    socket.on('activity.new', (activity) => {
      setActivities((prev) => [activity, ...prev].slice(0, 10)); // Keep last 10
    });

    return () => {
      socket.off('activity.new');
    };
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText size={16} className="text-blue-500" />;
      case 'chat': return <MessageSquare size={16} className="text-purple-500" />;
      case 'team': return <Users size={16} className="text-green-500" />;
      default: return <Activity size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col h-[400px]">
      <div className="p-4 border-b flex items-center justify-between bg-muted/20">
        <h3 className="font-semibold flex items-center">
          <Activity size={18} className="mr-2" />
          Real-time Activity Feed
        </h3>
        <div className="flex items-center">
          <span className="relative flex h-3 w-3 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {activities.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-sm text-muted-foreground text-center mt-10"
            >
              Waiting for activities...
            </motion.div>
          ) : (
            activities.map((activity, idx) => (
              <motion.div
                key={activity.id || idx}
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="flex gap-3 text-sm"
              >
                <div className="mt-0.5">{getIcon(activity.type)}</div>
                <div>
                  <p className="text-foreground">
                    <span className="font-medium">{activity.user}</span> {activity.action}{' '}
                    <span className="font-medium">{activity.target}</span>
                  </p>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
