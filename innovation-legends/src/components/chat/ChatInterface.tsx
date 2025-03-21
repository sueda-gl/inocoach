import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatInterfaceProps {
  onSendMessage: (message: string) => void;
  messages: Message[];
  isTyping?: boolean;
  placeholder?: string;
  buttonText?: string;
}

const ChatInterface = ({ 
  onSendMessage, 
  messages, 
  isTyping = false, 
  placeholder = "Type your message...",
  buttonText = "Send"
}: ChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Messages container with scroll */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-cosmic-slate scrollbar-track-midnight-navy">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === 'user' 
                    ? 'bg-electric-blue text-pure-white rounded-tr-none' 
                    : 'bg-midnight-navy border border-cosmic-slate/40 text-soft-silver rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.text}</p>
                <div className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-pure-white/70' : 'text-ghost-gray'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* AI typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-midnight-navy border border-cosmic-slate/40 text-soft-silver rounded-lg rounded-tl-none p-3">
                <div className="flex space-x-2">
                  <motion.div 
                    className="w-2 h-2 bg-ghost-gray rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.7, repeat: Infinity, repeatType: "loop", delay: 0 }}
                  />
                  <motion.div 
                    className="w-2 h-2 bg-ghost-gray rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.7, repeat: Infinity, repeatType: "loop", delay: 0.2 }}
                  />
                  <motion.div 
                    className="w-2 h-2 bg-ghost-gray rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.7, repeat: Infinity, repeatType: "loop", delay: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="border-t border-cosmic-slate/30 p-4 bg-midnight-navy/50">
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            className="flex-grow bg-cosmic-slate/30 text-pure-white border border-cosmic-slate/40 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-electric-blue"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={isTyping || !inputValue.trim()}
            className="bg-electric-blue hover:bg-electric-blue/80 text-pure-white px-4 py-2 rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {buttonText}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface; 