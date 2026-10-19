"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWhatsAppSignature = verifyWhatsAppSignature;
exports.verifyInternalSecret = verifyInternalSecret;
exports.checkIdempotency = checkIdempotency;
const crypto_1 = __importDefault(require("crypto"));
const client_1 = require("@prisma/client");
const config_1 = require("../../config");
const prisma = new client_1.PrismaClient();
function verifyWhatsAppSignature(req, res, next) {
    if (config_1.config.isDemoMode)
        return next();
    const signature = req.headers['x-hub-signature-256'];
    if (!signature)
        return res.status(401).json({ error: 'Missing x-hub-signature-256 header' });
    const rawBody = req.rawBody;
    if (!rawBody)
        return res.status(500).json({ error: 'Raw body not retained for HMAC' });
    const expected = 'sha256=' + crypto_1.default.createHmac('sha256', config_1.config.whatsapp.appSecret).update(rawBody).digest('hex');
    const a = Buffer.from(signature, 'utf8');
    const b = Buffer.from(expected, 'utf8');
    if (a.length !== b.length || !crypto_1.default.timingSafeEqual(a, b)) {
        return res.status(403).json({ error: 'Invalid HMAC signature' });
    }
    next();
}
function verifyInternalSecret(req, res, next) {
    if (config_1.config.isDemoMode)
        return next();
    const secretHeader = (req.headers['x-kajiou-secret'] || req.headers['x-hajiou-secret'] || req.headers['x-webhook-secret']);
    if (!secretHeader || secretHeader !== config_1.config.n8n.webhookSecret) {
        return res.status(401).json({ error: 'Unauthorized: Invalid internal secret header' });
    }
    next();
}
async function checkIdempotency(key, source) {
    try {
        const existing = await prisma.idempotencyRecord.findUnique({ where: { key } });
        if (existing)
            return false;
        await prisma.idempotencyRecord.create({
            data: { key, source, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) }
        });
        return true;
    }
    catch (err) {
        // If table doesn't exist yet or connection blip in demo, don't block
        return true;
    }
}
