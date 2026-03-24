import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Grid3X3, Heart, MessageSquare, Bookmark, BarChart3 } from 'lucide-react';

const TABS = [
  { id: 'posts', label: 'Posts', icon: Grid3X3 },
  { id: 'activity', label: 'Activity', icon: BarChart3 },
  { id: 'saved', label: 'Saved', icon: Bookmark },
];

const POSTS = [
  { id: 1, type: 'workout', title: 'Push Day Complete', date: '2h ago', likes: 24, comments: 3 },
  { id: 2, type: 'progress', title: 'New PR on Bench!', date: '1d ago', likes: 56, comments: 8 },
  { id: 3, type: 'photo', title: 'Week 4 Progress', date: '3d ago', likes: 42, comments: 5 },
];

export default function UserContent() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('posts');

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">My Content</h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-6 border-b border-[hsl(var(--border))]">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[hsl(var(--accent-primary))] text-[hsl(var(--accent-primary))]'
                    : 'border-transparent text-[hsl(var(--fg-2))]'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {POSTS.map((post) => (
              <div
                key={post.id}
                className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--fill))] text-[hsl(var(--fg-2))] capitalize">
                    {post.type}
                  </span>
                  <span className="text-xs text-[hsl(var(--fg-3))]">{post.date}</span>
                </div>
                <p className="font-medium mb-3">{post.title}</p>
                <div className="flex items-center gap-4 text-sm text-[hsl(var(--fg-2))]">
                  <button className="flex items-center gap-1 hover:text-[hsl(var(--accent-primary))]">
                    <Heart className="w-4 h-4" />
                    {post.likes}
                  </button>
                  <button className="flex items-center gap-1 hover:text-[hsl(var(--accent-primary))]">
                    <MessageSquare className="w-4 h-4" />
                    {post.comments}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
