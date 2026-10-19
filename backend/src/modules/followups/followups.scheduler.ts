import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { config } from '../../config';

const prisma = new PrismaClient();

export async function processDueFollowUps() {
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
        if (config.isDemoMode) {
          console.log(`[KAJIOU DEMO OUTBOUND] Dispatched follow-up to ${recipientPhone} | Template: ${task.templateKey}`);
        } else {
          await axios.post(`${config.whatsapp.baseUrl}/${config.whatsapp.phoneNumberId}/messages`, {
            messaging_product: 'whatsapp',
            to: recipientPhone,
            type: 'template',
            template: { name: task.templateKey, language: { code: 'en_US' } }
          }, {
            headers: { Authorization: `Bearer ${config.whatsapp.accessToken}` }
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
    } catch (err: any) {
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

