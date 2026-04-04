const { getEnv } = require('./env');

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/**
 * After a notification row is inserted, optionally email the user via Resend.
 * Requires RESEND_API_KEY; EMAIL_FROM should be a verified sender (or Resend onboarding domain for tests).
 */
async function sendNotificationEmailForRow(adminClient, row) {
  const env = getEnv();
  if (!env.resendApiKey || !adminClient || !row?.user_id) return;

  const { data: prefs } = await adminClient
    .from('user_settings')
    .select('notification_settings')
    .eq('user_id', row.user_id)
    .maybeSingle();
  if (prefs?.notification_settings?.emailNotifications === false) return;

  const { data, error } = await adminClient.auth.admin.getUserById(String(row.user_id));
  if (error || !data?.user?.email) return;

  const to = data.user.email;
  const from = env.emailFrom || 'mxstermind <onboarding@resend.dev>';
  const subject = String(row.title || 'mxstermind').slice(0, 200);
  const bodyText = String(row.message || '').slice(0, 8000);
  const text = `${subject}\n\n${bodyText}`;
  const html = `<p><strong>${escapeHtml(subject)}</strong></p><p>${escapeHtml(bodyText).replace(/\n/g, '<br/>')}</p>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
      html,
    }),
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.warn('[resend]', res.status, payload);
  }
}

module.exports = { sendNotificationEmailForRow };
