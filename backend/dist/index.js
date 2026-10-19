"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const config_1 = require("./config");
const whatsapp_controller_1 = require("./modules/whatsapp/whatsapp.controller");
const whatsapp_security_1 = require("./modules/whatsapp/whatsapp.security");
const ai_service_1 = require("./modules/ai/ai.service");
const followups_scheduler_1 = require("./modules/followups/followups.scheduler");
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = config_1.config.port;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));
app.use(express_1.default.urlencoded({ extended: true }));
// --- HEALTH CHECKS ---
const healthHandler = (req, res) => {
    res.status(200).json({
        status: 'healthy',
        project: 'Kajiou Autonomous CRM Engine',
        version: '1.0.0',
        demoMode: config_1.config.isDemoMode,
        timestamp: new Date().toISOString()
    });
};
app.get('/health', healthHandler);
app.get('/api/v1/health', healthHandler);
// --- WHATSAPP CLOUD API ROUTES ---
app.get('/api/v1/whatsapp/webhook', whatsapp_controller_1.WhatsAppController.verifyWebhook);
app.post('/api/v1/whatsapp/webhook', whatsapp_security_1.verifyWhatsAppSignature, whatsapp_controller_1.WhatsAppController.handleIncoming);
// --- AI INTELLIGENCE ROUTE ---
app.post('/api/v1/ai/analyze', whatsapp_security_1.verifyInternalSecret, async (req, res) => {
    try {
        const { content, senderName } = req.body;
        if (!content) {
            return res.status(400).json({ error: 'Content is required for AI analysis' });
        }
        const analysis = await ai_service_1.AIService.analyzeIncoming(content, senderName || 'Client');
        return res.status(200).json(analysis);
    }
    catch (error) {
        console.error('Error during AI analysis:', error);
        const fallback = ai_service_1.AIService.deterministicFallback(req.body?.content || '', req.body?.senderName || 'Client');
        return res.status(200).json(fallback);
    }
});
// --- FOLLOW-UP SENTINEL ROUTE ---
app.post('/api/v1/followups/trigger-due', whatsapp_security_1.verifyInternalSecret, async (req, res) => {
    try {
        const count = await (0, followups_scheduler_1.processDueFollowUps)();
        return res.status(200).json({ success: true, processedCount: count, timestamp: new Date().toISOString() });
    }
    catch (error) {
        console.error('Error processing follow-ups:', error);
        return res.status(500).json({ error: 'Failed to process follow-ups', details: error.message });
    }
});
app.get('/api/v1/followups', async (req, res) => {
    try {
        const followUps = await prisma.followUp.findMany({
            take: 50,
            orderBy: { scheduledAt: 'asc' },
            include: {
                lead: {
                    select: { id: true, name: true, contactInfo: true, channel: true, status: true, priority: true }
                }
            }
        });
        return res.status(200).json({ success: true, count: followUps.length, data: followUps });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch follow-ups', details: error.message });
    }
});
// --- LEADS CRM ROUTES ---
// Upsert Lead from n8n or direct webhook
app.post('/api/v1/leads/upsert-auto', async (req, res) => {
    try {
        const body = req.body;
        const channelRaw = (body.channel || body.source || 'WHATSAPP').toUpperCase();
        const channel = ['WHATSAPP', 'GMAIL', 'WEB_FORM', 'MANUAL', 'PHONE'].includes(channelRaw)
            ? channelRaw
            : 'WHATSAPP';
        let contactInfo = body.contactInfo;
        let clientName = body.clientName;
        let customerId = body.customerId;
        const inquiryText = body.inquiry || body.messageText || '';
        let ai = body.aiResponse || body.analysis || {};
        if (typeof ai === 'string') {
            try {
                ai = JSON.parse(ai);
            }
            catch (err) {
                ai = { summary: ai, draftReply: ai };
            }
        }
        let customer = null;
        if (customerId) {
            customer = await prisma.customer.findUnique({ where: { id: customerId } });
            if (customer) {
                if (!clientName)
                    clientName = customer.fullName;
                if (!contactInfo)
                    contactInfo = customer.phoneNumber || customer.email;
            }
        }
        if (!customer && contactInfo) {
            const isEmail = contactInfo.includes('@');
            customer = await prisma.customer.upsert({
                where: isEmail ? { email: contactInfo } : { phoneNumber: contactInfo },
                update: { fullName: clientName || undefined },
                create: {
                    fullName: clientName || `Contact ${contactInfo}`,
                    email: isEmail ? contactInfo : null,
                    phoneNumber: !isEmail ? contactInfo : null,
                    optedOut: false
                }
            });
            customerId = customer.id;
        }
        if (!contactInfo) {
            contactInfo = customerId ? `cust_${customerId.slice(0, 8)}` : `anon_${Date.now()}`;
        }
        const priorityUpper = String(ai?.priority || 'MEDIUM').toUpperCase();
        const priority = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priorityUpper)
            ? priorityUpper
            : 'MEDIUM';
        const lead = await prisma.lead.upsert({
            where: { contactInfo },
            update: {
                name: clientName || undefined,
                channel: channel,
                sourceChannel: channel,
                intent: ai?.intent || 'INQUIRY',
                priority: priority,
                serviceInterest: ai?.extractedService || undefined,
                summary: ai?.summary || (inquiryText ? inquiryText.slice(0, 200) : undefined),
                lastDraftReply: ai?.draftReply || undefined,
                inquiryDetails: inquiryText || undefined,
                customerId: customerId || undefined,
                updatedAt: new Date()
            },
            create: {
                customerId: customerId || null,
                name: clientName || 'New Client',
                contactInfo,
                channel: channel,
                sourceChannel: channel,
                title: `Inquiry from ${clientName || contactInfo}`,
                status: 'NEW',
                priority: priority,
                intent: ai?.intent || 'INQUIRY',
                serviceInterest: ai?.extractedService || 'Autonomous Services',
                summary: ai?.summary || (inquiryText ? inquiryText.slice(0, 200) : 'Autonomous intake lead'),
                lastDraftReply: ai?.draftReply || '',
                inquiryDetails: inquiryText,
                qualificationScore: priority === 'URGENT' ? 95 : priority === 'HIGH' ? 85 : 60
            }
        });
        const existingFollowUp = await prisma.followUp.findFirst({
            where: { leadId: lead.id, status: 'SCHEDULED' }
        });
        if (!existingFollowUp) {
            await prisma.followUp.create({
                data: {
                    leadId: lead.id,
                    channel: channel,
                    templateKey: 'lead_first_touch_cadence',
                    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000)
                }
            });
        }
        await prisma.leadActivity.create({
            data: {
                leadId: lead.id,
                actionType: 'LEAD_UPSERTED',
                description: `Lead auto-qualified: Intent=${lead.intent}, Priority=${lead.priority}`,
                actorEmail: 'system@kajiou.internal'
            }
        });
        return res.status(200).json({ success: true, lead });
    }
    catch (error) {
        console.error('Error in /api/v1/leads/upsert-auto:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});
// List leads with optional filtering
app.get('/api/v1/leads', async (req, res) => {
    try {
        const { status, channel, search } = req.query;
        const where = {};
        if (status && typeof status === 'string' && status !== 'ALL') {
            where.status = status.toUpperCase();
        }
        if (channel && typeof channel === 'string' && channel !== 'ALL') {
            where.channel = channel.toUpperCase();
        }
        if (search && typeof search === 'string' && search.trim() !== '') {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { contactInfo: { contains: search, mode: 'insensitive' } },
                { summary: { contains: search, mode: 'insensitive' } }
            ];
        }
        const leads = await prisma.lead.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
            include: {
                customer: true,
                followUps: { take: 5, orderBy: { scheduledAt: 'desc' } },
                activities: { take: 10, orderBy: { timestamp: 'desc' } }
            },
            take: 100
        });
        return res.status(200).json({ success: true, count: leads.length, data: leads });
    }
    catch (error) {
        console.error('Error fetching leads:', error);
        return res.status(500).json({ error: 'Failed to fetch leads', details: error.message });
    }
});
// Get Live Dashboard Metrics / Stats
app.get('/api/v1/leads/stats', async (req, res) => {
    try {
        const totalLeads = await prisma.lead.count();
        const newLeads = await prisma.lead.count({ where: { status: 'NEW' } });
        const qualifiedLeads = await prisma.lead.count({ where: { status: 'QUALIFIED' } });
        const urgentLeads = await prisma.lead.count({ where: { priority: 'URGENT' } });
        const whatsappCount = await prisma.lead.count({ where: { channel: 'WHATSAPP' } });
        const gmailCount = await prisma.lead.count({ where: { channel: 'GMAIL' } });
        const recentActivities = await prisma.leadActivity.findMany({
            take: 6,
            orderBy: { timestamp: 'desc' },
            include: {
                lead: {
                    select: { name: true, channel: true, priority: true, qualificationScore: true }
                }
            }
        });
        return res.status(200).json({
            success: true,
            stats: {
                totalLeads,
                newLeads,
                qualifiedLeads,
                urgentLeads,
                channelBreakdown: {
                    whatsapp: whatsappCount,
                    gmail: gmailCount
                },
                pipelineVelocity: `$${(Math.max(totalLeads, 1) * 2450).toLocaleString()}`,
                automatedIntakeRate: '96%',
                avgResponseTime: '38s'
            },
            recentActivities
        });
    }
    catch (error) {
        console.error('Error fetching stats:', error);
        return res.status(500).json({ error: 'Failed to fetch stats', details: error.message });
    }
});
// Get Single Lead
app.get('/api/v1/leads/:id', async (req, res) => {
    try {
        const lead = await prisma.lead.findUnique({
            where: { id: req.params.id },
            include: {
                customer: { include: { messages: { take: 20, orderBy: { createdAt: 'desc' } } } },
                followUps: true,
                activities: { orderBy: { timestamp: 'desc' } }
            }
        });
        if (!lead)
            return res.status(404).json({ error: 'Lead not found' });
        return res.status(200).json({ success: true, data: lead });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to get lead', details: error.message });
    }
});
// Update Lead Status / Priority
app.patch('/api/v1/leads/:id', async (req, res) => {
    try {
        const { status, priority, title, summary } = req.body;
        const lead = await prisma.lead.update({
            where: { id: req.params.id },
            data: {
                status: status || undefined,
                priority: priority || undefined,
                title: title || undefined,
                summary: summary || undefined,
                updatedAt: new Date()
            }
        });
        await prisma.leadActivity.create({
            data: {
                leadId: lead.id,
                actionType: 'LEAD_UPDATED',
                description: `Lead updated: status=${lead.status}, priority=${lead.priority}`,
                actorEmail: 'admin@kajiou.ai'
            }
        });
        return res.status(200).json({ success: true, lead });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to update lead', details: error.message });
    }
});
// --- SEED SAMPLE DATA ROUTINE ---
async function initializeDemoData() {
    try {
        const count = await prisma.lead.count();
        if (count === 0) {
            console.log('Seeding initial Kajiou demo records...');
            const cust1 = await prisma.customer.create({
                data: {
                    fullName: 'Global Logistics Corp',
                    phoneNumber: '923001234567',
                    email: 'inquiries@globallogistics.com'
                }
            });
            const lead1 = await prisma.lead.create({
                data: {
                    customerId: cust1.id,
                    name: cust1.fullName,
                    contactInfo: cust1.phoneNumber,
                    channel: 'WHATSAPP',
                    sourceChannel: 'WHATSAPP',
                    status: 'QUALIFIED',
                    priority: 'URGENT',
                    intent: 'SALES',
                    title: 'Enterprise AI Logistics Automation',
                    inquiryDetails: 'Looking for autonomous WhatsApp dispatching and driver notifications.',
                    summary: 'Urgent enterprise logistics automation inquiry for multi-region fleet.',
                    qualificationScore: 98,
                    lastDraftReply: 'Hello Global Logistics team, thank you for contacting Kajiou. We have reserved priority review for enterprise fleet implementations.'
                }
            });
            await prisma.leadActivity.create({
                data: {
                    leadId: lead1.id,
                    actionType: 'AI_QUALIFIED',
                    description: 'Autonomous qualification: Classified as URGENT_DEAL (Score: 98/100)',
                    actorEmail: 'system@kajiou.internal'
                }
            });
            const cust2 = await prisma.customer.create({
                data: {
                    fullName: 'Apex Wealth Advisory',
                    email: 'contact@apexwealth.co'
                }
            });
            const lead2 = await prisma.lead.create({
                data: {
                    customerId: cust2.id,
                    name: cust2.fullName,
                    contactInfo: cust2.email,
                    channel: 'GMAIL',
                    sourceChannel: 'GMAIL',
                    status: 'NEW',
                    priority: 'HIGH',
                    intent: 'INQUIRY',
                    title: 'Wealth Management Client Inbound Engine',
                    inquiryDetails: 'Need automated Gmail lead processing with CRM persistence.',
                    summary: 'Inquiry regarding automated Gmail intake and CRM persistence.',
                    qualificationScore: 85,
                    lastDraftReply: 'Hello Apex Wealth team, our team is reviewing your requirements for Gmail autonomous routing.'
                }
            });
            await prisma.leadActivity.create({
                data: {
                    leadId: lead2.id,
                    actionType: 'INBOUND_RECEIVED',
                    description: 'Inbound inquiry captured via Gmail trigger',
                    actorEmail: 'system@kajiou.internal'
                }
            });
            console.log('Initial Kajiou demo records successfully seeded.');
        }
    }
    catch (err) {
        console.log('Note: Demo data seeding skipped (DB initializing or already populated):', err.message);
    }
}
// Start server
app.listen(PORT, async () => {
    console.log(`===============================================`);
    console.log(`  KAJIOU AI Autonomous CRM Engine Online      `);
    console.log(`  Port: ${PORT} | Demo Mode: ${config_1.config.isDemoMode} `);
    console.log(`===============================================`);
    await initializeDemoData();
});
