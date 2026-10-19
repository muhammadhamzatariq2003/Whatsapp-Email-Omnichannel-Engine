import { Request, Response } from 'express';
import { config } from '../../config';
import { PrismaClient } from '@prisma/client';
import { checkIdempotency } from './whatsapp.security';
import axios from 'axios';

const prisma = new PrismaClient();

export class WhatsAppController {
  public static verifyWebhook(req: Request, res: Response) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token === config.whatsapp.verifyToken) {
      return res.status(200).send(challenge);
    }
    return res.status(403).json({ error: 'Verification token mismatched' });
  }

  public static async handleIncoming(req: Request, res: Response) {
    res.status(200).json({ status: 'ACCEPTED' });
    try {
      const value = req.body.entry?.[0]?.changes?.[0]?.value;
      if (!value) return;

      if (value.statuses?.length > 0) {
        const s = value.statuses[0];
        await prisma.message.updateMany({
          where: { externalId: s.id },
          data: { status: String(s.status).toUpperCase() as any }
        });
        return;
      }

      if (value.messages?.length > 0) {
        const msg = value.messages[0];
        const senderNumber = msg.from;
        const wamid = msg.id || `msg_${Date.now()}`;
        const textBody = msg.text?.body || '';
        const profileName = value.contacts?.[0]?.profile?.name;

        if (!(await checkIdempotency(wamid, 'WHATSAPP'))) return;

        if (/^(stop|unsubscribe|cancel|optout)$/i.test(textBody.trim())) {
          await prisma.customer.upsert({
            where: { phoneNumber: senderNumber },
            update: { optedOut: true, optedOutAt: new Date() },
            create: { phoneNumber: senderNumber, fullName: profileName || 'WhatsApp Contact', optedOut: true, optedOutAt: new Date() }
          });
          return;
        }

        const customer = await prisma.customer.upsert({
          where: { phoneNumber: senderNumber },
          update: { fullName: profileName || undefined },
          create: { phoneNumber: senderNumber, fullName: profileName || `Contact +${senderNumber}`, optedOut: false }
        });

        let conversation = await prisma.conversation.findFirst({
          where: { customerId: customer.id, channel: 'WHATSAPP', isOpen: true }
        });
        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: { customerId: customer.id, channel: 'WHATSAPP', isOpen: true }
          });
        }

        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            customerId: customer.id,
            direction: 'INBOUND',
            channel: 'WHATSAPP',
            externalId: wamid,
            senderIdentifier: senderNumber,
            body: textBody,
            status: 'DELIVERED',
            isSimulated: config.isDemoMode
          }
        });

        // Ensure Lead exists and link activity
        let lead = await prisma.lead.findFirst({
          where: {
            OR: [
              { contactInfo: senderNumber },
              { customerId: customer.id }
            ]
          }
        });

        if (!lead) {
          lead = await prisma.lead.create({
            data: {
              customerId: customer.id,
              name: customer.fullName,
              contactInfo: senderNumber,
              channel: 'WHATSAPP',
              sourceChannel: 'WHATSAPP',
              status: 'NEW',
              priority: 'MEDIUM',
              intent: 'INQUIRY',
              title: `WhatsApp Inquiry from ${customer.fullName}`,
              inquiryDetails: textBody,
              summary: textBody.slice(0, 160)
            }
          });
        }

        await prisma.leadActivity.create({
          data: {
            leadId: lead.id,
            actionType: 'MESSAGE_RECEIVED',
            description: `Inbound WhatsApp message: "${textBody.slice(0, 80)}"`,
            actorEmail: 'system@kajiou.internal'
          }
        });

        if (!conversation.humanTakeover) {
          await axios.post(`${config.n8n.baseUrl}/webhook/whatsapp-inbound`, {
            leadId: lead.id,
            customerId: customer.id,
            conversationId: conversation.id,
            phoneNumber: senderNumber,
            message: textBody,
            senderName: customer.fullName
          }, {
            headers: {
              'X-Kajiou-Secret': config.n8n.webhookSecret,
              'X-Hajiou-Secret': config.n8n.webhookSecret
            },
            timeout: 5000
          }).catch(err => console.error('Note: n8n webhook notification skipped or offline:', err.message));
        }
      }
    } catch (error: any) {
      console.error('Error handling WhatsApp payload:', error);
    }
  }
}

