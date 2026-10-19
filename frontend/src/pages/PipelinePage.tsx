import React, { useState, useEffect } from 'react';
import { DollarSign, MoreHorizontal, ArrowRight, CheckCircle2, MessageSquare, Mail } from 'lucide-react';

interface PipelineLead {
  id: string;
  name: string;
  contactInfo: string;
  channel: string;
  status: string;
  priority: string;
  score: number;
  value: number;
  summary: string;
}

export const PipelinePage: React.FC = () => {
  const [leads, setLeads] = useState<PipelineLead[]>([
    {
      id: '1',
      name: 'Global Logistics Corp',
      contactInfo: '+92 300 1234567',
      channel: 'WHATSAPP',
      status: 'QUALIFIED',
      priority: 'URGENT',
      score: 98,
      value: 45000,
      summary: 'Enterprise multi-region fleet WhatsApp dispatching automation.'
    },
    {
      id: '2',
      name: 'Apex Wealth Advisory',
      contactInfo: 'contact@apexwealth.co',
      channel: 'GMAIL',
      status: 'NEW',
      priority: 'HIGH',
      score: 85,
      value: 28000,
      summary: 'Inbound Gmail routing with autonomous draft generator.'
    },
    {
      id: '3',
      name: 'Nexus Retail Group',
      contactInfo: '+1 650 334 9912',
      channel: 'WHATSAPP',
      status: 'PROPOSAL_SENT',
      priority: 'HIGH',
      score: 91,
      value: 62000,
      summary: 'Omnichannel customer support triage & live escalations.'
    },
    {
      id: '4',
      name: 'Sarah Jenkins',
      contactInfo: '+1 415 889 2011',
      channel: 'WHATSAPP',
      status: 'CONTACTED',
      priority: 'MEDIUM',
      score: 78,
      value: 12500,
      summary: 'Agency tier autonomous lead qualification.'
    },
    {
      id: '5',
      name: 'Horizon Health Tech',
      contactInfo: 'hello@horizontech.io',
      channel: 'GMAIL',
      status: 'WON',
      priority: 'URGENT',
      score: 95,
      value: 80000,
      summary: 'Closed enterprise contract for autonomous patient intake.'
    }
  ]);

  const stages = [
    { key: 'NEW', label: 'New Intake', color: 'border-blue-500/30' },
    { key: 'CONTACTED', label: 'Contacted', color: 'border-indigo-500/30' },
    { key: 'QUALIFIED', label: 'AI Qualified', color: 'border-emerald-500/30' },
    { key: 'PROPOSAL_SENT', label: 'Proposal Sent', color: 'border-amber-500/30' },
    { key: 'WON', label: 'Deals Won', color: 'border-green-500/30' }
  ];

  const totalValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Revenue Pipeline</h2>
          <p className="text-xs text-slate-400">Autonomous deal progression from capture to conversion.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <span className="text-xs text-slate-400">Total Pipeline Value:</span>
            <span className="text-sm font-mono font-bold text-emerald-400">${totalValue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {stages.map((st) => {
          const stageLeads = leads.filter((l) => l.status === st.key);
          const stageValue = stageLeads.reduce((acc, curr) => acc + (curr.value || 0), 0);

          return (
            <div key={st.key} className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex flex-col min-w-[220px]">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{st.label}</h4>
                  <span className="text-[10px] font-mono text-slate-500">${stageValue.toLocaleString()}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                  {stageLeads.length}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-slate-900 border border-slate-800 p-3.5 rounded-lg hover:border-slate-700 transition-all cursor-pointer shadow-sm space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono border ${
                        lead.channel === 'GMAIL' ? 'bg-red-500/10 border-red-500/20 text-red-300' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                      }`}>
                        {lead.channel}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-200">
                        ${lead.value.toLocaleString()}
                      </span>
                    </div>

                    <h5 className="text-xs font-semibold text-slate-100 truncate">{lead.name}</h5>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{lead.summary}</p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] font-mono text-slate-500">
                      <span>Score: <span className="text-indigo-400 font-semibold">{lead.score}%</span></span>
                      <span className={`px-1.5 py-0.5 rounded ${
                        lead.priority === 'URGENT' ? 'text-red-400 bg-red-500/10' : 'text-slate-400'
                      }`}>
                        {lead.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
