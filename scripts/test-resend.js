#!/usr/bin/env node
/**
 * Smoke-test Resend: inline HTML or your dashboard template (RESEND_NOTIFY_TEMPLATE_ID).
 * Usage: npm run test:resend
 * Requires RESEND_API_KEY + EMAIL_FROM in .env; set RESEND_TEST_TO for the recipient.
 */

const path = require('path');
const fs = require('fs');

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile();

const apiKey = process.env.RESEND_API_KEY || '';
const from = process.env.EMAIL_FROM || 'mxstermind <onboarding@resend.dev>';
const templateId = String(process.env.RESEND_NOTIFY_TEMPLATE_ID || '').trim();
const to = String(process.env.RESEND_TEST_TO || '').trim();

async function main() {
  if (!apiKey) {
    console.error('Missing RESEND_API_KEY in .env');
    process.exit(1);
  }
  if (!to) {
    console.error('Set RESEND_TEST_TO in .env to the inbox you want to hit (Resend sandbox only allows your account email).');
    process.exit(1);
  }

  const subject = '[mxstermind] Resend test';
  const message =
    'If you see this, the integration works. Template variables NOTIFICATION_TITLE / NOTIFICATION_MESSAGE map from notification title + body.';

  const body = templateId
    ? {
        from,
        to: [to],
        subject,
        template: {
          id: templateId,
          variables: {
            NOTIFICATION_TITLE: subject,
            NOTIFICATION_MESSAGE: message.slice(0, 2000),
          },
        },
      }
    : {
        from,
        to: [to],
        subject,
        html: `<p><strong>${subject}</strong></p><p>${message}</p>`,
        text: `${subject}\n\n${message}`,
      };

  console.log(
    templateId
      ? `Sending via template "${templateId}" → ${to}`
      : `Sending inline HTML (set RESEND_NOTIFY_TEMPLATE_ID to test your dashboard template) → ${to}`,
  );

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('Resend error', res.status, JSON.stringify(payload, null, 2));
    if (res.status === 403) {
      const msg = String(payload?.message || '');
      const m = msg.match(/your own email address \(([^)]+)\)/i);
      if (m) {
        const allowed = m[1].trim();
        console.error('');
        console.error('Resend test mode: `to` must match the email on your Resend account exactly.');
        console.error(`  Allowed:  ${allowed}`);
        console.error(`  You used: ${to}`);
        if (allowed.toLowerCase() !== to.toLowerCase()) {
          console.error('');
          console.error(`Fix: set RESEND_TEST_TO=${allowed} in .env (or verify a domain at resend.com/domains and use that FROM).`);
        }
      } else {
        console.error(
          'Hint: unverified domain / test mode — use onboarding@resend.dev as FROM and set RESEND_TEST_TO to your Resend account email exactly.',
        );
      }
    }
    if (payload?.message && String(payload.message).includes('variable')) {
      console.error(
        'Hint: your template must expose variables exactly named NOTIFICATION_TITLE and NOTIFICATION_MESSAGE (Resend dashboard).',
      );
    }
    process.exit(1);
  }

  console.log('OK', JSON.stringify(payload, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
