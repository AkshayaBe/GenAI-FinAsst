import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chat } from '@google/genai';
import { initializeChat } from '../services/geminiService';
import type { Message } from '../types';
import { UserIcon, BotIcon, SendIcon } from './Icons';
import { StarterPrompt } from './StarterPrompt';

const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  const isModel = message.role === 'model';

  return (
    <div className={`flex items-start gap-4 my-4 ${isModel ? '' : 'flex-row-reverse'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isModel ? 'bg-cyan-500' : 'bg-indigo-500'}`}>
        {isModel ? <BotIcon /> : <UserIcon />}
      </div>
      <div className={`p-4 rounded-lg w-full max-w-lg ${isModel ? 'bg-slate-800 rounded-tl-none' : 'bg-indigo-600 rounded-tr-none'}`}>
        <p className="text-white whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
};

const ChatInterface: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chatInstance = initializeChat();
    if (chatInstance) {
      setChat(chatInstance);
    } else {
      setError("Failed to initialize the AI. Please check the API key.");
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  const sendChatMessage = useCallback(async (prompt: string) => {
    if (!prompt.trim() || isLoading || !chat) return;

    setIsLoading(true);
    setError(null);
    const userMessage: Message = { role: 'user', content: prompt };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const stream = await chat.sendMessageStream({ message: prompt });
      let modelResponse = '';
      setMessages(prev => [...prev, { role: 'model', content: '' }]);

      for await (const chunk of stream) {
        modelResponse += chunk.text;
        setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].content = modelResponse;
            return newMessages;
        });
      }
    } catch (e) {
      console.error("Error sending message:", e);
      setError("Sorry, I couldn't process your request. Please try again.");
       setMessages(prev => [...prev, { role: 'model', content: "Sorry, I couldn't process your request. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, chat]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendChatMessage(input);
  };

  const starterPrompts = [
    { text: "What are mutual funds?" },
    { text: "Explain ETFs in simple terms." },
    { text: "What is the difference between stocks and bonds?" },
    { text: "How does a Fixed Deposit (FD) work in India?" }
  ];

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div id="chat-container" className="flex-1 overflow-y-auto p-4 md:p-6">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="p-6 bg-slate-800 rounded-full mb-4">
              <BotIcon className="w-12 h-12 text-cyan-400"/>
            </div>
            <h2 className="text-2xl font-bold mb-2">Welcome! How can I help you invest better?</h2>
            <p className="text-slate-400 mb-6">Ask me anything or choose one of the options below to get started.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
              {starterPrompts.map(({text}) => (
                <StarterPrompt key={text} prompt={text} onClick={() => sendChatMessage(text)} />
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, index) => <ChatMessage key={index} message={msg} />)}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
             <div className="flex items-start gap-4 my-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-cyan-500">
                    <BotIcon />
                </div>
                <div className="p-4 rounded-lg max-w-lg bg-slate-800 rounded-tl-none">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse delay-0"></div>
                        <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse delay-200"></div>
                        <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse delay-400"></div>
                    </div>
                </div>
            </div>
        )}
        {error && messages[messages.length-1]?.content !== error && <p className="text-red-400 text-center my-4">{error}</p>}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 md:p-6 bg-slate-900 border-t border-slate-700">
        <form onSubmit={handleFormSubmit} className="flex items-center gap-4 bg-slate-800 rounded-lg p-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about stocks, mutual funds, and more..."
            className="flex-1 bg-transparent text-white placeholder-slate-400 focus:outline-none px-2"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-indigo-600 text-white rounded-md p-2 hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
          >
            <SendIcon />
          </button>
        </form>
        <p className="text-xs text-slate-500 text-center mt-3 px-4">
            GenAI can make mistakes. This is not financial advice. Consider checking important information.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
