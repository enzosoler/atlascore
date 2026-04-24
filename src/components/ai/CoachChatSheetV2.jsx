/**
 * Atlas Core Coach Chat Sheet v2.0
 * Premium AI coach chat interface with new design system
 * Built from scratch with the new design system
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  Paperclip,
  Smile,
  MoreVertical,
  User,
  Bot,
  Sparkles,
  CheckCircle,
  TrendingUp,
  Target,
  Zap,
  X,
  Phone,
  Video
} from 'lucide-react';

// Import design system classes
import '@/styles/design-system.css';

// Mock chat messages
const mockMessages = [
  {
    id: 1,
    type: 'bot',
    content: "Hey Alex! I noticed you crushed your upper body workout yesterday. How are you feeling today?",
    timestamp: new Date(Date.now() - 3600000),
    status: 'delivered'
  },
  {
    id: 2,
    type: 'user',
    content: "Pretty good! A bit sore but in a good way. Thinking about doing legs today.",
    timestamp: new Date(Date.now() - 3000000),
    status: 'delivered'
  },
  {
    id: 3,
    type: 'bot',
    content: "That's great! Since you're feeling good, let's push those legs today. I've updated your workout to include an extra set of squats. Make sure to get proper warm-up in - your knee tracking shows you could use some extra mobility work.",
    timestamp: new Date(Date.now() - 2400000),
    status: 'delivered',
    suggestions: [
      "Show me the updated workout",
      "What mobility work do you recommend?",
      "How's my form been looking?"
    ]
  },
  {
    id: 4,
    type: 'bot',
    content: "Also, your protein intake has been on point this week! Keep it up and you'll see great results.",
    timestamp: new Date(Date.now() - 1800000),
    status: 'delivered'
  }
];

// Message Component
function Message({ message, onSuggestionClick }) {
  const isBot = message.type === 'bot';
  
  return (
    <div className={`flex gap-3 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isBot 
          ? 'bg-gradient-to-br from-purple-500 to-blue-500' 
          : 'bg-gray-700'
      }`}>
        {isBot ? (
          <Bot className="w-4 h-4 text-white" />
        ) : (
          <User className="w-4 h-4 text-gray-300" />
        )}
      </div>
      
      <div className={`max-w-[70%] ${isBot ? 'order-first' : 'order-last'}`}>
        <div className={`rounded-2xl p-4 ${
          isBot 
            ? 'bg-gray-800 text-gray-100' 
            : 'bg-green-500 text-white'
        }`}>
          <p className="text-sm leading-relaxed">{message.content}</p>
          
          {message.suggestions && (
            <div className="mt-3 space-y-2">
              {message.suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onSuggestionClick(suggestion)}
                  className="w-full text-left p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors text-xs text-gray-300"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${
          isBot ? 'justify-start' : 'justify-end'
        }`}>
          <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {message.status === 'delivered' && isBot && (
            <CheckCircle className="w-3 h-3" />
          )}
        </div>
      </div>
    </div>
  );
}

// Chat Input Component
function ChatInput({ onSend, onVoiceStart, disabled = false }) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef(null);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      onVoiceStart?.();
    }
  };

  return (
    <div className="card p-4">
      <div className="flex items-end gap-3">
        <button className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
          <Paperclip className="w-4 h-4" />
        </button>
        
        <div className="flex-1">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={disabled}
            className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:border-green-500 focus:outline-none resize-none"
            rows={1}
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
        </div>
        
        <button className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
          <Smile className="w-4 h-4" />
        </button>
        
        <button
          onClick={handleVoiceToggle}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            isRecording 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          <Mic className="w-4 h-4" />
        </button>
        
        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      
      {isRecording && (
        <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
          <span>Recording...</span>
          <button onClick={() => setIsRecording(false)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// Chat Header Component
function ChatHeader({ coachName = "AI Coach", isOnline = true, onClose }) {
  return (
    <div className="card p-4 border-b border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900"></div>
            )}
          </div>
          <div>
            <h3 className="headline-sm text-white">{coachName}</h3>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-500'}`}></div>
              <span className="text-gray-400 text-xs">{isOnline ? 'Online' : 'Away'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <Phone className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <Video className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Quick Actions Component
function QuickActions({ onAction }) {
  const actions = [
    { icon: <Target className="w-4 h-4" />, label: "Today's Workout", color: 'green' },
    { icon: <TrendingUp className="w-4 h-4" />, label: "Progress Update", color: 'blue' },
    { icon: <Zap className="w-4 h-4" />, label: "Quick Tip", color: 'purple' },
    { icon: <Sparkles className="w-4 h-4" />, label: "Motivation", color: 'yellow' }
  ];

  return (
    <div className="p-4 border-t border-gray-700">
      <p className="text-gray-400 text-sm mb-3">Quick Actions</p>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => onAction(action.label)}
            className="flex items-center gap-2 p-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors text-left"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${action.color}-500/20 text-${action.color}-400`}>
              {action.icon}
            </div>
            <span className="text-gray-300 text-sm">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Main Coach Chat Sheet Component
function CoachChatSheetV2({ isOpen = true, onClose }) {
  const [messages, setMessages] = useState(mockMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (content) => {
    const newMessage = {
      id: messages.length + 1,
      type: 'user',
      content,
      timestamp: new Date(),
      status: 'sent'
    };
    
    setMessages(prev => [...prev, newMessage]);
    setIsTyping(true);
    
    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        type: 'bot',
        content: "I understand! Let me help you with that. Based on your current progress and goals, I'd recommend...",
        timestamp: new Date(),
        status: 'delivered'
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const handleVoiceStart = () => {
    // Voice recording logic
    setTimeout(() => {
      const voiceMessage = {
        id: messages.length + 1,
        type: 'user',
        content: "Voice message: Show me today's workout plan",
        timestamp: new Date(),
        status: 'sent'
      };
      setMessages(prev => [...prev, voiceMessage]);
    }, 2000);
  };

  const handleQuickAction = (action) => {
    handleSendMessage(action);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
      <div className="w-full max-w-2xl mx-auto bg-base-0 rounded-t-3xl max-h-[80vh] flex flex-col">
        <ChatHeader onClose={onClose} />
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <Message 
              key={message.id} 
              message={message} 
              onSuggestionClick={handleSuggestionClick}
            />
          ))}
          
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-800 rounded-2xl p-4">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <QuickActions onAction={handleQuickAction} />
        <ChatInput onSend={handleSendMessage} onVoiceStart={handleVoiceStart} />
      </div>
    </div>
  );
}

export default CoachChatSheetV2;
