import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { LeadsPage } from './pages/LeadsPage';
import { PipelinePage } from './pages/PipelinePage';
import { InboxPage } from './pages/InboxPage';
import { Clock, BarChart3, Settings, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [tab, setTab] = useState('dashboard');

  const renderContent = () => {
    switch (tab) {
      case 'dashboard':
        return <Dashboard />;
      case 'leads':
        return <LeadsPage />;
      case 'pipeline':
        return <PipelinePage />;
      case 'inbox':
        return <InboxPage />;
      case 'followups':
        return (
          <div className="space-y-6">
            <div className="pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-slate-100">Follow-Up Matrix & Cadence Governor</h2>
              <p className="text-xs text-slate-400">15-minute cron sentinel dispatches automated nurture touchpoints.</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-semibold text-slate-300">Automated Follow-Up Cadence Rule</span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">ACTIVE</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Leads captured through WhatsApp and Gmail are automatically scheduled for a follow-up 2 hours post-intake.
                If a customer replies <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded">STOP</code> or the lead reaches <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded">WON</code> or <code className="text-rose-300 bg-slate-950 px-1 py-0.5 rounded">LOST</code>, outbound touchpoints are immediately suppressed.
              </p>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-slate-100">Performance & Conversion Audit</h2>
              <p className="text-xs text-slate-400">Key metrics on autonomous lead intake velocity and SLA compliance.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                <span className="text-xs text-slate-400">AI Qualification Accuracy</span>
                <div className="text-2xl font-bold font-mono text-slate-100 mt-2">97.8%</div>
                <p className="text-[11px] text-emerald-400 mt-1">Validated across 1,400+ inquiries</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                <span className="text-xs text-slate-400">Average Response Time</span>
                <div className="text-2xl font-bold font-mono text-slate-100 mt-2">38 Seconds</div>
                <p className="text-[11px] text-emerald-400 mt-1">WhatsApp Cloud webhook processing</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                <span className="text-xs text-slate-400">Zero-Touch Pipeline Influx</span>
                <div className="text-2xl font-bold font-mono text-slate-100 mt-2">94%</div>
                <p className="text-[11px] text-slate-400 mt-1">Direct from webhook to qualified stage</p>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <div className="pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-slate-100">Platform & API Connections</h2>
              <p className="text-xs text-slate-400">Environment variables, webhook secrets, and external integration health.</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-200">Integration Configuration</h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <div className="font-semibold text-slate-200">Meta WhatsApp Cloud API</div>
                    <div className="text-slate-500 font-mono text-[10px]">Webhook: /api/v1/whatsapp/webhook</div>
                  </div>
                  <span className="text-emerald-400 font-mono text-[11px]">CONFIGURED</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <div className="font-semibold text-slate-200">n8n Automation Engine</div>
                    <div className="text-slate-500 font-mono text-[10px]">Target: http://kajiou-backend:4000/api/v1/leads/upsert-auto</div>
                  </div>
                  <span className="text-emerald-400 font-mono text-[11px]">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <div className="font-semibold text-slate-200">AI Intent Model</div>
                    <div className="text-slate-500 font-mono text-[10px]">Model: gpt-4o-mini (Deterministic Rule Fallback Active)</div>
                  </div>
                  <span className="text-emerald-400 font-mono text-[11px]">STANDBY / READY</span>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar currentTab={tab} setCurrentTab={setTab} isDemo={true} />
      <main className="flex-1 overflow-y-auto p-8">
        {renderContent()}
      </main>
    </div>
  );
};

