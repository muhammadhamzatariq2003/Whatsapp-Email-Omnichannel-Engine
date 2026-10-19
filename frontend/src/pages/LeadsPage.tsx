import React, { useState, useEffect } from 'react';
import { Search, Filter, MessageSquare, Mail, AlertCircle, CheckCircle, Clock, ChevronRight, X, ExternalLink } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  contactInfo: string;
  channel: string;
  intent: string;
  priority: string;
  status: string;
  summary: string;
  lastDraftReply?: string;
  qualificationScore?: number;
  updatedAt: string;
  customer?: {
    fullName: string;
    phoneNumber?: string;
    email?: string;
  };
  activities?: Array<{
    id: string;
    actionType: string;
    description: string;
    timestamp: string;
  }>;
}

export const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (channelFilter !== 'ALL') params.append('channel', channelFilter);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);

      const res = await fetch(`/api/v1/leads?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setLeads(json.data);
          return;
        }
      }
      throw new Error('Fallback to sample data');
    } catch {
      // Offline / Sample fallback
      setLeads([
        {
          id: '1',
          name: 'Global Logistics Corp',
          contactInfo: '+92 300 1234567',
          channel: 'WHATSAPP',
          intent: 'SALES',
          priority: 'URGENT',
          status: 'QUALIFIED',
          summary: 'Inquiry regarding autonomous WhatsApp dispatching and driver notifications across logistics fleet.',
          lastDraftReply: 'Hello Global Logistics team, thank you for contacting Kajiou. We have reserved priority review for enterprise fleet implementations.',
          qualificationScore: 98,
          updatedAt: new Date().toISOString(),
          customer: { fullName: 'Global Logistics Corp', phoneNumber: '+92 300 1234567' },
          activities: [
            { id: 'a1', actionType: 'AI_QUALIFIED', description: 'Autonomous qualification: Classified as URGENT_DEAL', timestamp: new Date().toISOString() }
          ]
        },
        {
          id: '2',
          name: 'Apex Wealth Advisory',
          contactInfo: 'contact@apexwealth.co',
          channel: 'GMAIL',
          intent: 'INQUIRY',
          priority: 'HIGH',
          status: 'NEW',
          summary: 'Wealth management client inbound engine requirements. Need automated Gmail intake.',
          lastDraftReply: 'Hello Apex Wealth team, our team is reviewing your requirements for Gmail autonomous routing.',
          qualificationScore: 85,
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
          customer: { fullName: 'Apex Wealth Advisory', email: 'contact@apexwealth.co' }
        },
        {
          id: '3',
          name: 'Sarah Jenkins',
          contactInfo: '+1 415 889 2011',
          channel: 'WHATSAPP',
          intent: 'SALES',
          priority: 'MEDIUM',
          status: 'CONTACTED',
          summary: 'Requesting pricing and demo for boutique agency lead qualification workflow.',
          lastDraftReply: 'Hi Sarah, thank you for reaching out to Kajiou. Here is the link to our self-guided interactive demo.',
          qualificationScore: 78,
          updatedAt: new Date(Date.now() - 7200000).toISOString(),
          customer: { fullName: 'Sarah Jenkins', phoneNumber: '+1 415 889 2011' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [channelFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads();
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'URGENT':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'HIGH':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'MEDIUM':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      default:
        return 'bg-slate-500/10 border-slate-500/30 text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Lead Operations</h2>
          <p className="text-xs text-slate-400">All inbound prospects captured and scored by Kajiou AI.</p>
        </div>
        <div className="text-xs font-mono text-slate-400">
          Showing {leads.length} records
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search leads by name, contact, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-all"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2">
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Channels</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="GMAIL">Gmail</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="WON">Won</option>
            <option value="LOST">Lost</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Client / Prospect</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Intent</th>
                <th className="py-3 px-4">Priority & Score</th>
                <th className="py-3 px-4">AI Summary</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-100">{lead.name || 'Anonymous Client'}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{lead.contactInfo}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono border ${
                      lead.channel === 'GMAIL' ? 'bg-red-500/10 border-red-500/20 text-red-300' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                    }`}>
                      {lead.channel === 'GMAIL' ? <Mail size={12} /> : <MessageSquare size={12} />}
                      {lead.channel}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-200">{lead.intent || 'INQUIRY'}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getPriorityBadge(lead.priority)}`}>
                        {lead.priority}
                      </span>
                      {lead.qualificationScore && (
                        <span className="font-mono text-indigo-400 font-bold text-[11px]">{lead.qualificationScore}%</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="truncate text-slate-400 text-[11px]">{lead.summary || 'No summary available'}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="text-slate-400 hover:text-slate-100 p-1">
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Slideover / Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-slate-950 border-l border-slate-800 h-full p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-100">{selectedLead.name}</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedLead.contactInfo}</p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500">Autonomous Classification</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getPriorityBadge(selectedLead.priority)}`}>
                    {selectedLead.priority} Priority
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                    {selectedLead.intent}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                    Score: {selectedLead.qualificationScore || 85}/100
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500">Inquiry Summary</span>
                <p className="mt-1 text-xs text-slate-300 bg-slate-900 border border-slate-800 p-3 rounded-lg leading-relaxed">
                  {selectedLead.summary}
                </p>
              </div>

              {selectedLead.lastDraftReply && (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-slate-500">AI Prepared Auto-Reply</span>
                    <span className="text-[10px] text-indigo-400 font-mono">Ready to dispatch</span>
                  </div>
                  <div className="mt-1 bg-indigo-950/20 border border-indigo-500/30 p-3 rounded-lg text-xs text-indigo-200 font-sans leading-relaxed">
                    {selectedLead.lastDraftReply}
                  </div>
                </div>
              )}

              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500">Pipeline Stage</span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'WON'].map((st) => (
                    <button
                      key={st}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono border transition-all ${
                        selectedLead.status === st
                          ? 'bg-indigo-600 border-indigo-500 text-white font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {selectedLead.activities && selectedLead.activities.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500">Activity Trail</span>
                  <div className="mt-2 space-y-2 border-l border-slate-800 pl-3">
                    {selectedLead.activities.map((act) => (
                      <div key={act.id} className="text-xs">
                        <div className="text-[10px] text-slate-500 font-mono">
                          {new Date(act.timestamp).toLocaleString()}
                        </div>
                        <div className="text-slate-300 font-medium">{act.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
