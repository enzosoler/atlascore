import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Paperclip, Smile, Phone, Video, MoreVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';

const CONVERSATIONS = [
  { id: 1, name: 'Coach Mike', lastMessage: 'Great job on today\'s workout!', time: '2m', unread: 2, online: true },
  { id: 2, name: 'Nutritionist Sarah', lastMessage: 'Your meal plan is ready', time: '1h', unread: 0, online: false },
];

const MESSAGES = [
  { id: 1, sender: 'me', text: 'Hey, I had a question about the workout', time: '10:00 AM' },
  { id: 2, sender: 'them', text: 'Sure! What would you like to know?', time: '10:05 AM' },
  { id: 3, sender: 'me', text: 'Should I increase weight on the bench press?', time: '10:06 AM' },
  { id: 4, sender: 'them', text: 'Great job on today\'s workout! Yes, try adding 5lbs next session.', time: '10:10 AM' },
];

export default function MessagesChat() {
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');

  if (!selectedChat) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg))]">
        <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Messages</h1>
        </div>
        <div className="p-4 max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            {CONVERSATIONS.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className="w-full p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] flex items-center gap-3 hover:border-[hsl(var(--border-h))] transition-colors"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] flex items-center justify-center text-white font-semibold">
                    {chat.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  {chat.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-[hsl(var(--bg))]" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{chat.name}</p>
                    <span className="text-xs text-[hsl(var(--fg-3))]">{chat.time}</span>
                  </div>
                  <p className="text-sm text-[hsl(var(--fg-2))] truncate">{chat.lastMessage}</p>
                </div>
                {chat.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-[hsl(var(--accent-primary))] text-white text-xs flex items-center justify-center">
                    {chat.unread}
                  </div>
                )}
              </button>
            ))}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))] flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => setSelectedChat(null)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] flex items-center justify-center text-white text-sm font-semibold">
            {selectedChat.name.split(' ').map(n => n[0]).join('')}
          </div>
          {selectedChat.online && (
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[hsl(var(--bg))]" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-medium">{selectedChat.name}</p>
          <p className="text-xs text-[hsl(var(--fg-3))]">{selectedChat.online ? 'Online' : 'Offline'}</p>
        </div>
        <button className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg"><Phone className="w-5 h-5" /></button>
        <button className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg"><Video className="w-5 h-5" /></button>
        <button className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg"><MoreVertical className="w-5 h-5" /></button>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {MESSAGES.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] p-3 rounded-2xl ${
              msg.sender === 'me'
                ? 'bg-[hsl(var(--accent-primary))] text-white rounded-br-md'
                : 'bg-[hsl(var(--fill))] rounded-bl-md'
            }`}>
              <p className="text-sm">{msg.text}</p>
              <p className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-white/70' : 'text-[hsl(var(--fg-3))]'}`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-[hsl(var(--border))]">
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg"><Paperclip className="w-5 h-5 text-[hsl(var(--fg-3))]" /></button>
          <button className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg"><Smile className="w-5 h-5 text-[hsl(var(--fg-3))]" /></button>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <button className="p-2 bg-[hsl(var(--accent-primary))] rounded-lg text-white hover:opacity-90">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
