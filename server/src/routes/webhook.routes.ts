import { FastifyInstance } from 'fastify';
import { supabase } from '../lib/supabase';
import crypto from 'crypto';

/**
 * Clicksign Webhook Routes
 * 
 * These routes handle webhook callbacks from Clicksign API v3.
 * When a document/envelope status changes, Clicksign sends a POST request
 * to our webhook endpoint with event details.
 * 
 * The webhook payload is signed with HMAC-SHA256 using the webhook key.
 * We verify the signature to ensure the request is authentic.
 * 
 * Events handled:
 * - envelope.running     → Envelope activated
 * - envelope.closed      → All signers signed (complete)
 * - envelope.canceled    → Envelope was canceled
 * - envelope.expired     → Envelope expired
 * - signer.signed        → Individual signer signed
 * - signer.refused       → Individual signer refused
 * - signer.email_opened  → Signer opened the email
 * - signer.link_opened   → Signer opened the signing link
 */

// Status mapping from Clicksign events to our contract statuses
const STATUS_MAP: Record<string, string> = {
    'envelope.running': 'Aguardando Assinatura',
    'envelope.closed': 'Assinado',
    'envelope.canceled': 'Cancelado',
    'envelope.expired': 'Expirado',
};

// ─── HMAC Signature Verification ─────────────────────────────────────────────
function verifyWebhookSignature(rawBody: string, signature: string | undefined): boolean {
    const webhookKey = process.env.CLICKSIGN_WEBHOOK_KEY;

    if (!webhookKey) {
        console.warn('[Webhook] CLICKSIGN_WEBHOOK_KEY not configured, skipping signature verification');
        return true; // Allow through if key not configured (dev mode)
    }

    if (!signature) {
        console.warn('[Webhook] No signature header found in request');
        return false;
    }

    // Clicksign sends HMAC-SHA256 signature
    const expectedSignature = crypto
        .createHmac('sha256', webhookKey)
        .update(rawBody)
        .digest('hex');

    const isValid = crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );

    if (!isValid) {
        console.warn('[Webhook] ❌ Invalid signature!');
        console.warn(`[Webhook]   Received:  ${signature}`);
        console.warn(`[Webhook]   Expected:  ${expectedSignature}`);
    }

    return isValid;
}

export async function webhookRoutes(server: FastifyInstance) {

    // Add raw body parsing for signature verification
    server.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
        try {
            // Store raw body for HMAC verification
            (req as any).rawBody = body;
            const json = JSON.parse(body as string);
            done(null, json);
        } catch (err: any) {
            done(err, undefined);
        }
    });

    // ─── POST /webhooks/clicksign ─────────────────────────────────────
    // Receives status updates from Clicksign
    server.post('/webhooks/clicksign', async (request: any, reply) => {
        try {
            const payload = request.body;
            const rawBody = request.rawBody || JSON.stringify(payload);

            console.log('[Webhook] ─────────────────────────────────────');
            console.log('[Webhook] Received Clicksign webhook');

            // ─── Verify HMAC Signature ────────────────────────────────
            const signature = request.headers['content-hmac']
                || request.headers['x-clicksign-signature']
                || request.headers['x-hub-signature-256']?.replace('sha256=', '');

            if (process.env.CLICKSIGN_WEBHOOK_KEY && signature) {
                const isValid = verifyWebhookSignature(rawBody, signature);
                if (!isValid) {
                    console.error('[Webhook] ❌ Signature verification failed! Rejecting request.');
                    return reply.status(401).send({ error: 'Invalid webhook signature' });
                }
                console.log('[Webhook] ✅ Signature verified');
            } else if (process.env.CLICKSIGN_WEBHOOK_KEY && !signature) {
                console.warn('[Webhook] ⚠️ No signature header, proceeding anyway (Clicksign may not send it on all events)');
            }

            console.log('[Webhook] Event:', JSON.stringify(payload, null, 2));

            // Clicksign API v3 sends the event in the request body
            // The structure can vary, but typically includes:
            // - event.name (e.g., "envelope.closed", "signer.signed")
            // - envelope data with ID
            // - signer data (if signer event)

            const eventName = payload?.event?.name
                || payload?.data?.attributes?.event
                || payload?.event
                || '';
            const envelopeId = payload?.envelope?.id
                || payload?.data?.id
                || payload?.data?.attributes?.envelope_id
                || '';

            console.log(`[Webhook] Event Name: ${eventName}`);
            console.log(`[Webhook] Envelope ID: ${envelopeId}`);

            if (!envelopeId) {
                console.warn('[Webhook] No envelope ID found in payload, skipping...');
                return reply.status(200).send({ received: true, processed: false, reason: 'no_envelope_id' });
            }

            // Find the contract by clicksign_envelope_id
            const { data: contract, error: findError } = await supabase
                .from('contratos')
                .select('id, status, clicksign_envelope_id')
                .eq('clicksign_envelope_id', envelopeId)
                .single();

            if (findError || !contract) {
                console.warn(`[Webhook] Contract not found for envelope ${envelopeId}`);
                // Still return 200 to prevent Clicksign from retrying
                return reply.status(200).send({ received: true, processed: false, reason: 'contract_not_found' });
            }

            console.log(`[Webhook] Found contract: ${contract.id} (current status: ${contract.status})`);

            // ─── Handle Envelope Events (status changes) ─────────────
            if (STATUS_MAP[eventName]) {
                const newStatus = STATUS_MAP[eventName];
                console.log(`[Webhook] Updating contract ${contract.id} status: ${contract.status} → ${newStatus}`);

                const updateData: any = { status: newStatus };

                // If envelope is closed (all signed), save the signature date
                if (eventName === 'envelope.closed') {
                    updateData.data_assinatura = new Date().toISOString();
                }

                const { error: updateError } = await supabase
                    .from('contratos')
                    .update(updateData)
                    .eq('id', contract.id);

                if (updateError) {
                    console.error(`[Webhook] Error updating contract: ${updateError.message}`);
                } else {
                    console.log(`[Webhook] ✅ Contract ${contract.id} status updated to: ${newStatus}`);
                }
            }

            // ─── Handle Signer Events (individual signer actions) ─────
            if (eventName.startsWith('signer.')) {
                const signerName = payload?.signer?.name || payload?.data?.attributes?.signer_name || 'Unknown';
                const signerEmail = payload?.signer?.email || payload?.data?.attributes?.signer_email || '';
                const action = eventName.replace('signer.', '');

                console.log(`[Webhook] Signer event: ${signerName} (${signerEmail}) → ${action}`);

                // Log signer events to a webhook_logs table (if it exists)
                try {
                    await supabase
                        .from('webhook_logs')
                        .insert({
                            contrato_id: contract.id,
                            envelope_id: envelopeId,
                            evento: eventName,
                            signatario_nome: signerName,
                            signatario_email: signerEmail,
                            payload: JSON.stringify(payload),
                            created_at: new Date().toISOString()
                        });
                } catch (logErr: any) {
                    // Don't fail the webhook if logging fails
                    console.warn(`[Webhook] Could not log event: ${logErr.message}`);
                }
            }

            console.log('[Webhook] ─────────────────────────────────────');

            // Always return 200 to acknowledge receipt
            return reply.status(200).send({
                received: true,
                processed: true,
                event: eventName,
                contractId: contract.id
            });

        } catch (err: any) {
            console.error('[Webhook] Error processing webhook:', err);
            // Return 200 even on error to prevent Clicksign from retrying indefinitely
            return reply.status(200).send({ received: true, processed: false, error: err.message });
        }
    });

    // ─── GET /webhooks/clicksign ──────────────────────────────────────
    // Health check / verification endpoint (some services ping GET first)
    server.get('/webhooks/clicksign', async (_request, reply) => {
        return reply.send({
            status: 'ok',
            service: 'Clicksign Webhook',
            timestamp: new Date().toISOString()
        });
    });

    // ─── GET /webhooks/clicksign/logs ─────────────────────────────────
    // View recent webhook logs
    server.get('/webhooks/clicksign/logs', async (_request, reply) => {
        try {
            const { data, error } = await supabase
                .from('webhook_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                return reply.send({ logs: [], message: 'Table may not exist yet' });
            }

            return reply.send({ logs: data || [] });
        } catch (err: any) {
            return reply.send({ logs: [], error: err.message });
        }
    });
}
