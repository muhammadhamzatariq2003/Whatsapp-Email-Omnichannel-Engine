"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processDueFollowUps = processDueFollowUps;
const client_1 = require("@prisma/client");
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../../config");
const prisma = new client_1.PrismaClient();
async function processDueFollowUps() {
    const dueTasks = await prisma.followUp.findMany({
        where: {
            status: 'SCHEDULED',
            scheduledAt: { lte: new Date() },
            lead: {
                status: { notIn: ['WON', 'LOST'] },
                OR: [
                    { customer: { optedOut: false } },
                    { customerId: null }
                ]
            }
        },
        include: { lead: { include: { customer: true } } },
        take: 50
    });
    for (const task of dueTasks) {
        try {
            const recipientPhone = task.lead.customer?.phoneNumber || task.lead.contactInfo;
            if (task.channel === 'WHATSAPP' && recipientPhone) {
                if (config_1.config.isDemoMode) {
                    console.log(`[KAJIOU DEMO OUTBOUND] Dispatched follow-up to ${recipientPhone} | Template: ${task.templateKey}`);
                }
                else {
                    await axios_1.default.post(`${config_1.config.whatsapp.baseUrl}/${config_1.config.whatsapp.phoneNumberId}/messages`, {
                        messaging_product: 'whatsapp',
                        to: recipientPhone,
                        type: 'template',
                        template: { name: task.templateKey, language: { code: 'en_US' } }
                    }, {
                        headers: { Authorization: `Bearer ${config_1.config.whatsapp.accessToken}` }
                    });
                }
            }
            await prisma.followUp.update({
                where: { id: task.id },
                data: { status: 'SENT', attemptCount: { increment: 1 } }
            });
            await prisma.leadActivity.create({
                data: {
                    leadId: task.leadId,
                    actionType: 'FOLLOW_UP_SENT',
                    description: `Dispatched cadence follow-up [${task.templateKey}] via ${task.channel}`,
                    actorEmail: 'system@kajiou.internal'
                }
            });
        }
        catch (err) {
            console.error(`Error executing follow-up ${task.id}:`, err.message);
            await prisma.followUp.update({
                where: { id: task.id },
                data: {
                    attemptCount: { increment: 1 },
                    cancellationReason: `Execution Failure: ${err.message}`
                }
            });
        }
    }
    return dueTasks.length;
}
