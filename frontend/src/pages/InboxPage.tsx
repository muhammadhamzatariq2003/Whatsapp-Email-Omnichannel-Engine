import React, { useState } from 'react';
import { MessageSquare, Mail, Send, Bot, CheckCircle2, User, Phone } from 'lucide-react';

interface ChatThread {
  id: string;
  senderName: string;
  contactInfo: string;
  channel: 'WHATSAPP' | 'GMAIL';
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  messages: Array<{
    id: string;
    sender: 'client' | 'ai' | 'agent';
    text: string;
    time: string;
  }>;
  aiDraft: string;
}

export const InboxPage: React.FC = () => {
  const [threads, setThreads] = useState<ChatThread[]>([
    {
      id: '1',
      senderName: 'Global Logistics Corp',
      contactInfo: '+92 300 1234567',
      channel: 'WHATSAPP',
      lastMessage: 'Looking for autonomous WhatsApp dispatching and driver notifications.',
      timestamp: '2m ago',
      unread: true,
      messages: [
        {
          id: 'm1',
          sender: 'client',
          text: 'Hello, we manage 250+ trucks across the region. Looking for autonomous WhatsApp dispatching and driver notifications. What is the pricing and setup timeline?',
          time: '11:42 PM'
        },
        {
          id: 'm2',
          sender: 'ai',
          text: 'Hello Global Logistics team, thank you for contacting Kajiou. We have received your inquiry. A senior fleet automation representative is reviewing your details right now.',
          time: '11:43 PM'
        }
      ],
      aiDraft: 'Our enterprise fleet tier accommodates unlimited drivers with sub-second message dispatching. Would you like to schedule an engineering walkthrough this week?'
    },
    {
      id: '2',
      senderName: 'Apex Wealth Advisory',
      contactInfo: 'contact@apexwealth.co',
      channel: 'GMAIL',
      lastMessage: 'Need automated Gmail lead processing with CRM persistence.',
      timestamp: '14m ago',
      unread: false,
      messages: [
        {
          id: 'm3',
          sender: 'client',
          text: 'Subject: Automation Inquiry. We are exploring AI tools to triage inbound high-net-worth client emails and persist them into PostgreSQL.',
          time: '11:30 PM'
        }
      ],
      aiDraft: 'Hello Apex Wealth team, our engine is purpose-built for financial and wealth advisory inbound intake with complete audit compliance.'
    }
  ]);

  const [activeThreadId, setActiveThreadId] = useState<string>('1');
  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];
  const [replyText, setReplyText] = useState(activeThread?.aiDraft || '');

  const handleSelectThread = (t: ChatThread) => {
    setActiveThreadId(t.id);
    setReplyText(t.aiDraft);
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    const newMessage = {
      id: `m_${Date.now()}`,
      sender: 'agent' as const,
      text: replyText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThread.id
          ? { ...t, messages: [...t.messages, newMessage], lastMessage: replyText }
          : t
      )
    );
    setReplyText('');
  };

  return (
    <div className="space-y-4 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Omnichannel Inbox</h2>
          <p className="text-xs text-slate-400">Live conversation routing across WhatsApp Cloud & Gmail.</p>
        </div>
        <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
          2 Active Channels
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {/* Left thread list */}
        <div className="border-r border-slate-800 flex flex-col min-h-0 bg-slate-950/50">
          <div className="p-3 border-b border-slate-800 text-xs font-semibold text-slate-400 font-mono uppercase">
            Inbound Messages
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {threads.map((t) => {
              const isActive = t.id === activeThread.id;
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectThread(t)}
                  className={`p-3.5 cursor-pointer transition-all ${
                    isActive ? 'bg-indigo-600/15 border-l-2 border-indigo-500' : 'hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`p-1 rounded text-[10px] ${
                        t.channel === 'GMAIL' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {t.channel === 'GMAIL' ? <Mail size={12} /> : <MessageSquare size={12} />}
                      </span>
                      <span className="text-xs font-bold text-slate-200 truncate">{t.senderName}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{t.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{t.lastMessage}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right chat thread & reply composer */}
        <div className="md:col-span-2 flex flex-col min-h-0 bg-slate-950">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                {activeThread.senderName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100">{activeThread.senderName}</h4>
                <p className="text-[10px] text-slate-500 font-mono">{activeThread.contactInfo} via {activeThread.channel}</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Autonomous Auto-Reply Ready
            </span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeThread.messages.map((m) => {
              const isClient = m.sender === 'client';
              const isAi = m.sender === 'ai';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isClient ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-500 font-mono">
                    {isAi && <Bot size={11} className="text-indigo-400" />}
                    <span>{isClient ? activeThread.senderName : isAi ? 'Kajiou AI' : 'Agent'}</span>
                    <span>• {m.time}</span>
                  </div>
                  <div
                    className={`max-w-lg p-3 rounded-xl text-xs leading-relaxed ${
                      isClient
                        ? 'bg-slate-900 border border-slate-800 text-slate-200'
                        : isAi
                        ? 'bg-indigo-950/40 border border-indigo-500/30 text-indigo-100'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Draft Reply Area */}
          <div className="p-3 border-t border-slate-800 bg-slate-900/60 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 text-indigo-400 font-medium">
                <Bot size={13} /> AI Suggested Contextual Reply
              </span>
              <button
                onClick={() => setReplyText(activeThread.aiDraft)}
                className="text-[10px] text-slate-400 hover:text-slate-200 underline font-mono"
              >
                Reset to AI Draft
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type response or send AI draft..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendReply();
                }}
              />
              <button
                onClick={handleSendReply}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all"
              >
                <Send size={13} />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
