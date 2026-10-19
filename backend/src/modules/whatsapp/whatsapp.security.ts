import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { config } from '../../config';

const prisma = new PrismaClient();

export function verifyWhatsAppSignature(req: Request, res: Response, next: NextFunction) {
  if (config.isDemoMode) return next();
  const signature = req.headers['x-hub-signature-256'] as string;
  if (!signature) return res.status(401).json({ error: 'Missing x-hub-signature-256 header' });
  const rawBody = (req as any).rawBody;
  if (!rawBody) return res.status(500).json({ error: 'Raw body not retained for HMAC' });

  const expected = 'sha256=' + crypto.createHmac('sha256', config.whatsapp.appSecret).update(rawBody).digest('hex');
  const a = Buffer.from(signature, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(403).json({ error: 'Invalid HMAC signature' });
  }
  next();
}

export function verifyInternalSecret(req: Request, res: Response, next: NextFunction) {
  if (config.isDemoMode) return next();
  const secretHeader = (req.headers['x-kajiou-secret'] || req.headers['x-hajiou-secret'] || req.headers['x-webhook-secret']) as string;
  if (!secretHeader || secretHeader !== config.n8n.webhookSecret) {
    return res.status(401).json({ error: 'Unauthorized: Invalid internal secret header' });
  }
  next();
}

export async function checkIdempotency(key: string, source: string): Promise<boolean> {
  try {
    const existing = await prisma.idempotencyRecord.findUnique({ where: { key } });
    if (existing) return false;
    await prisma.idempotencyRecord.create({
      data: { key, source, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) }
    });
    return true;
  } catch (err) {
    // If table doesn't exist yet or connection blip in demo, don't block
    return true;
  }
}

