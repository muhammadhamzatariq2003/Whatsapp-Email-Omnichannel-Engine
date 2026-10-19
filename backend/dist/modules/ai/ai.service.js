"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const config_1 = require("../../config");
class AIService {
    static async analyzeIncoming(content, senderName) {
        if (config_1.config.isDemoMode || !config_1.config.ai.apiKey || config_1.config.ai.apiKey === 'DEMO_KEY') {
            return this.deterministicFallback(content, senderName);
        }
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config_1.config.ai.apiKey}` },
                body: JSON.stringify({
                    model: config_1.config.ai.model,
                    response_format: { type: 'json_object' },
                    messages: [
                        {
                            role: 'system',
                            content: `You are the lead intelligence engine for Kajiou AI. Return strictly valid JSON with keys: intent (INQUIRY|SALES|SUPPORT|URGENT_DEAL|SPAM), priority (LOW|MEDIUM|HIGH|URGENT), extractedService (short string), summary (1 sentence), confidenceScore (0.0-1.0), draftReply (concise professional reply).`
                        },
                        { role: 'user', content: `Sender: ${senderName}\nMessage: ${content}` }
                    ]
                })
            });
            const data = await response.json();
            if (!data.choices?.[0]?.message?.content) {
                return this.deterministicFallback(content, senderName);
            }
            const parsed = JSON.parse(data.choices[0].message.content);
            if (parsed.confidenceScore < config_1.config.ai.confidenceThreshold) {
                return this.deterministicFallback(content, senderName);
            }
            return parsed;
        }
        catch {
            console.warn('AI provider failed or not configured. Using Kajiou deterministic rule fallback.');
            return this.deterministicFallback(content, senderName);
        }
    }
    static deterministicFallback(content, senderName) {
        const text = (content || '').toLowerCase();
        let intent = 'INQUIRY';
        let priority = 'MEDIUM';
        let extractedService = 'General Consultation';
        if (/urgent|asap|price quote|pricing|proposal|quote/.test(text)) {
            intent = 'URGENT_DEAL';
            priority = 'URGENT';
            extractedService = 'High-Value Engagement';
        }
        else if (/demo|hire|marketing|software|build|develop/.test(text)) {
            intent = 'SALES';
            priority = 'HIGH';
            extractedService = 'Custom Implementation';
        }
        else if (/help|issue|error|bug|problem/.test(text)) {
            intent = 'SUPPORT';
            extractedService = 'Technical Assistance';
        }
        const name = senderName || 'Valued Client';
        return {
            intent,
            priority,
            extractedService,
            summary: `Inquiry regarding ${extractedService}. Customer interest identified via autonomous intake.`,
            confidenceScore: 0.95,
            draftReply: `Hello ${name}, thank you for reaching out to Kajiou. We have received your inquiry regarding ${extractedService} and a senior specialist is reviewing your request.`
        };
    }
}
exports.AIService = AIService;
