import "server-only";
import { Resend } from "resend";
import { siteUrl } from "@/lib/site";

/**
 * Transactional email via Resend.
 *
 * Every send is best-effort: a mail failure must never roll back the write that
 * triggered it (a contact message is still saved if the notification bounces),
 * so `send` swallows errors and reports them through its return value instead.
 */

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM || "B.E. Janko Jnr <onboarding@resend.dev>";
const ADMIN = process.env.CONTACT_EMAIL || "hello@bejanko.com";

export { siteUrl };

// ── Templating ────────────────────────────────────────

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

interface LayoutOptions {
  heading: string;
  intro?: string;
  bodyHtml: string;
  cta?: { label: string; url: string };
  footnote?: string;
}

/**
 * Inline-styled shell shared by every message — mail clients strip <style>
 * blocks and have no CSS-variable support, so the palette is duplicated here
 * rather than imported from the app's design tokens.
 */
function layout({ heading, intro, bodyHtml, cta, footnote }: LayoutOptions) {
  const url = siteUrl();

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#F2F4F1;font-family:ui-sans-serif,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:#141916;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F2F4F1;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FBFCFA;border:1px solid #DCE1DA;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px 0;">
                <a href="${url}" style="text-decoration:none;color:#141916;font-size:15px;font-weight:700;letter-spacing:-0.01em;">B.E. Janko Jnr</a>
                <div style="height:2px;width:28px;background:#8A2B2B;margin-top:12px;"></div>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 8px;">
                <h1 style="margin:0;font-size:21px;line-height:1.3;font-weight:700;color:#141916;">${escapeHtml(heading)}</h1>
                ${
                  intro
                    ? `<p style="margin:10px 0 0;font-size:15px;line-height:1.65;color:#5A635E;">${escapeHtml(intro)}</p>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td style="padding:12px 32px 0;font-size:15px;line-height:1.65;color:#141916;">
                ${bodyHtml}
              </td>
            </tr>
            ${
              cta
                ? `<tr><td style="padding:24px 32px 4px;">
                     <a href="${cta.url}" style="display:inline-block;background:#8A2B2B;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 22px;border-radius:8px;">${escapeHtml(cta.label)}</a>
                     <p style="margin:14px 0 0;font-size:12px;line-height:1.6;color:#8A9188;word-break:break-all;">Or paste this into your browser:<br/>${cta.url}</p>
                   </td></tr>`
                : ""
            }
            <tr>
              <td style="padding:28px 32px 30px;">
                <div style="border-top:1px solid #DCE1DA;padding-top:16px;font-size:12px;line-height:1.6;color:#8A9188;">
                  ${footnote ? `${escapeHtml(footnote)}<br/><br/>` : ""}
                  Sent from <a href="${url}" style="color:#8A2B2B;text-decoration:none;">${url.replace(/^https?:\/\//, "")}</a>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** Renders a labelled block of user-supplied text, safely escaped. */
function field(label: string, value: string) {
  return `<p style="margin:0 0 14px;">
    <span style="display:block;font-size:11px;text-transform:uppercase;letter-spacing:0.09em;color:#8A9188;margin-bottom:3px;">${escapeHtml(label)}</span>
    <span style="white-space:pre-wrap;">${escapeHtml(value)}</span>
  </p>`;
}

// ── Transport ─────────────────────────────────────────

interface SendArgs {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export async function send({
  to,
  subject,
  html,
  replyTo,
}: SendArgs): Promise<{ ok: boolean; error?: string }> {
  if (!resend) {
    // Local development without a key: log instead of failing the request.
    console.warn(`[email] RESEND_API_KEY not set — skipped "${subject}" to ${to}`);
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    });

    if (error) {
      console.error("[email] send failed:", error);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err) {
    console.error("[email] send threw:", err);
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// ── Messages ──────────────────────────────────────────

export async function sendContactEmails(data: {
  name: string;
  email: string;
  message: string;
}) {
  await Promise.allSettled([
    send({
      to: ADMIN,
      replyTo: data.email,
      subject: `New message from ${data.name}`,
      html: layout({
        heading: "New contact message",
        bodyHtml:
          field("From", data.name) +
          field("Email", data.email) +
          field("Message", data.message),
        cta: { label: "Open dashboard", url: `${siteUrl()}/dashboard/messages` },
      }),
    }),
    send({
      to: data.email,
      subject: "Thanks for reaching out",
      html: layout({
        heading: `Thanks, ${data.name}`,
        intro: "Your message landed safely. I read everything myself and will reply as soon as I can.",
        bodyHtml: field("What you sent", data.message),
        footnote: "You received this because you used the contact form on this site.",
      }),
    }),
  ]);
}

export async function sendGuestSubmissionEmails(data: {
  name: string;
  email: string;
  title: string;
  body: string;
}) {
  await Promise.allSettled([
    send({
      to: ADMIN,
      replyTo: data.email,
      subject: `Guest submission: ${data.title}`,
      html: layout({
        heading: "New guest submission",
        bodyHtml:
          field("Title", data.title) +
          field("Writer", data.name) +
          field("Email", data.email) +
          field("Opening", data.body.slice(0, 600) + (data.body.length > 600 ? "…" : "")),
        cta: { label: "Review submission", url: `${siteUrl()}/dashboard/guest-posts` },
      }),
    }),
    send({
      to: data.email,
      subject: `We received "${data.title}"`,
      html: layout({
        heading: "Submission received",
        intro: `Thank you for sending "${data.title}". Every piece is read by a human, which takes a little time — expect to hear back within two weeks.`,
        bodyHtml: field("Title", data.title) + field("Writer", data.name),
        footnote: "You received this because you submitted a piece for guest publication.",
      }),
    }),
  ]);
}

export async function sendGuestDecisionEmail(data: {
  name: string;
  email: string;
  title: string;
  slug: string;
  approved: boolean;
}) {
  if (data.approved) {
    return send({
      to: data.email,
      subject: `"${data.title}" has been published`,
      html: layout({
        heading: "Your piece is live",
        intro: `"${data.title}" is now published. Thank you for trusting this space with your writing.`,
        bodyHtml: field("Writer", data.name),
        cta: { label: "Read it", url: `${siteUrl()}/guest-writing/${data.slug}` },
      }),
    });
  }

  return send({
    to: data.email,
    subject: `About "${data.title}"`,
    html: layout({
      heading: "Thank you for submitting",
      intro: `I read "${data.title}" carefully, but it isn't the right fit for this space right now. That is a judgement about fit, not about your writing.`,
      bodyHtml: field("Writer", data.name),
      cta: { label: "Submit another piece", url: `${siteUrl()}/submit` },
    }),
  });
}

export async function sendContestEntryEmails(data: {
  entrantName: string;
  entrantEmail: string;
  entryTitle: string;
  contestTitle: string;
  contestSlug: string;
  wordCount: number;
}) {
  await Promise.allSettled([
    send({
      to: ADMIN,
      replyTo: data.entrantEmail,
      subject: `Contest entry: ${data.entryTitle}`,
      html: layout({
        heading: "New contest entry",
        bodyHtml:
          field("Contest", data.contestTitle) +
          field("Entry", data.entryTitle) +
          field("Entrant", `${data.entrantName} <${data.entrantEmail}>`) +
          field("Length", `${data.wordCount} words`),
        cta: { label: "Moderate entries", url: `${siteUrl()}/dashboard/contests` },
      }),
    }),
    send({
      to: data.entrantEmail,
      subject: `Entry received — ${data.contestTitle}`,
      html: layout({
        heading: "Your entry is in",
        intro: `"${data.entryTitle}" has been entered into ${data.contestTitle}. Entries are reviewed before they appear publicly; you'll be notified when voting opens.`,
        bodyHtml:
          field("Entry", data.entryTitle) + field("Length", `${data.wordCount} words`),
        cta: {
          label: "View the contest",
          url: `${siteUrl()}/contests/${data.contestSlug}`,
        },
        footnote: "You received this because you entered a writing contest on this site.",
      }),
    }),
  ]);
}

export async function sendVoteConfirmationEmail(data: {
  voterName: string;
  voterEmail: string;
  entryTitle: string;
  contestTitle: string;
  token: string;
}) {
  return send({
    to: data.voterEmail,
    subject: `Confirm your vote — ${data.contestTitle}`,
    html: layout({
      heading: "One click to confirm your vote",
      intro: `Thanks ${data.voterName}. Your vote for "${data.entryTitle}" isn't counted until you confirm it below — this keeps the results honest.`,
      bodyHtml: field("Contest", data.contestTitle) + field("Your pick", data.entryTitle),
      cta: {
        label: "Confirm my vote",
        url: `${siteUrl()}/vote/confirm?token=${data.token}`,
      },
      footnote:
        "If you didn't cast this vote, ignore this email and nothing will be counted.",
    }),
  });
}

export async function sendSubscriberConfirmationEmail(data: {
  email: string;
  token: string;
}) {
  return send({
    to: data.email,
    subject: "Confirm your subscription",
    html: layout({
      heading: "Confirm your subscription",
      intro:
        "Click below to start receiving new essays and notes. No more than a couple of emails a month, and you can leave at any time.",
      bodyHtml: "",
      cta: {
        label: "Confirm subscription",
        url: `${siteUrl()}/newsletter/confirm?token=${data.token}`,
      },
      footnote: "If you didn't request this, ignore this email — nothing will happen.",
    }),
  });
}
