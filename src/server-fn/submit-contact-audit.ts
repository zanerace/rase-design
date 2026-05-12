import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const CONTACT_TO = "racekipping@gmail.com";
/** Resend onboarding sender — must match an address/domain Resend accepts for your account. */
const DEFAULT_MAIL_FROM = "Race Digital <onboarding@resend.dev>";

const contactInput = z.object({
  name: z.string().trim().min(1).max(80),
  business: z.string().trim().min(1).max(120),
  links: z.string().trim().max(200),
  needs: z.string().trim().max(1200),
  contact: z.string().trim().min(3).max(120),
});

type ContactInput = z.infer<typeof contactInput>;

export type SubmitContactResult = { ok: true } | { ok: false; error: string };

type MailBindings = {
  RESEND_API_KEY?: string;
  CONTACT_MAIL_FROM?: string;
};

const FALLBACK_MAIL_ERROR = "Email could not be sent. Check Resend setup.";
const FALLBACK_VALIDATE_ERROR = "Please fix the highlighted fields and try again.";

const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  business: "Business name",
  links: "Website or social link",
  needs: "What you need help with",
  contact: "Email / phone",
};

const FORM_LABEL_GENERIC = "Form";

/**
 * NEVER import cloudflare:workers at module top-level — this file is referenced from route code
 * and can end up analyzed by the client bundle (full page crash in the browser).
 */
async function loadWorkerBindings(): Promise<Partial<MailBindings>> {
  try {
    const m = (await import("cloudflare:workers")) as Record<string, unknown>;
    const def = m.default;
    const env =
      typeof m.env === "object" && m.env !== null
        ? m.env
        : typeof def === "object" && def !== null && "env" in def
          ? (def as { env: Partial<MailBindings> }).env
          : undefined;
    return typeof env === "object" && env !== null ? env : {};
  } catch {
    return {};
  }
}

function processEnvTrim(key: keyof MailBindings): string | undefined {
  try {
    if (typeof process === "undefined" || !process.env) return undefined;
    const raw = process.env[key as keyof NodeJS.ProcessEnv];
    const s = typeof raw === "string" ? raw.trim() : undefined;
    return s?.length ? s : undefined;
  } catch {
    return undefined;
  }
}

function formatValidationIssues(err: z.ZodError): string {
  return err.issues
    .map((issue) => {
      const pathKey = typeof issue.path[0] === "string" ? issue.path[0] : undefined;
      const label = pathKey ? (FIELD_LABELS[pathKey] ?? pathKey) : FORM_LABEL_GENERIC;
      return `${label}: ${issue.message}`;
    })
    .join("; ");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function replyToFromContact(value: string): string | undefined {
  const m = value.trim().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  return m ? m[0] : undefined;
}

function buildBodies(data: ContactInput) {
  const text = [
    `New audit request (Race Digital site)`,
    ``,
    `Name: ${data.name}`,
    `Business: ${data.business}`,
    `Contact: ${data.contact}`,
    data.links ? `Link: ${data.links}` : `Link: (none)`,
    ``,
    `What they need:`,
    data.needs.trim() ? data.needs.trim() : `(not specified)`,
    ``,
    `— Sent from the Race Digital contact form`,
  ].join("\n");

  const htmlBody = `
    <p><strong>New audit request</strong> (Race Digital site)</p>
    <p><strong>Name:</strong> ${escapeHtml(data.name)}<br/>
    <strong>Business:</strong> ${escapeHtml(data.business)}<br/>
    <strong>Contact:</strong> ${escapeHtml(data.contact)}<br/>
    ${data.links ? `<strong>Link:</strong> ${escapeHtml(data.links)}` : ""}</p>
    <p><strong>What they need</strong></p>
    <p>${escapeHtml(data.needs.trim()) || "(not specified)"}</p>
    <p style="color:#888;font-size:12px;">Sent from the Race Digital contact form</p>`;

  return { text, html: htmlBody };
}

function summarizeResendHttpError(status: number, body: string): string {
  try {
    const j = JSON.parse(body) as { message?: unknown };
    const raw = j?.message;
    const msg =
      typeof raw === "string"
        ? raw
        : Array.isArray(raw) && typeof raw[0] === "string"
          ? raw[0]
          : undefined;
    if (msg) return `Email provider (${status}): ${msg}`;
  } catch {
    /* body not JSON */
  }
  return FALLBACK_MAIL_ERROR;
}

/**
 * Sends email via Resend. Never throws — always returns `{ ok }`.
 */
async function sendViaResend(
  data: ContactInput,
  bindings: Partial<MailBindings>,
): Promise<SubmitContactResult> {
  try {
    const apiKey = bindings.RESEND_API_KEY?.trim() || processEnvTrim("RESEND_API_KEY");

    const mailFrom =
      bindings.CONTACT_MAIL_FROM?.trim() ||
      processEnvTrim("CONTACT_MAIL_FROM") ||
      DEFAULT_MAIL_FROM;

    if (!apiKey?.length) {
      return {
        ok: false,
        error: "Missing RESEND_API_KEY in `.env.local` / `.dev.vars`. Restart dev after fixing.",
      };
    }

    const { text, html } = buildBodies(data);
    const subject = `Audit request · ${data.business}`;
    const payload: Record<string, unknown> = {
      from: mailFrom,
      to: [CONTACT_TO],
      subject,
      text,
      html,
    };

    const reply = replyToFromContact(data.contact);
    if (reply) payload.reply_to = reply;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return {
        ok: false,
        error: summarizeResendHttpError(res.status, errText),
      };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_MAIL_ERROR };
  }
}

export const submitContactAudit = createServerFn({ method: "POST" }).handler(
  async ({ data }): Promise<SubmitContactResult> => {
    try {
      const parsed = contactInput.safeParse(data ?? {});
      if (!parsed.success) {
        const msg = formatValidationIssues(parsed.error) || FALLBACK_VALIDATE_ERROR;
        return { ok: false, error: msg };
      }

      const bindings = await loadWorkerBindings();
      return await sendViaResend(parsed.data, bindings);
    } catch {
      return { ok: false, error: FALLBACK_MAIL_ERROR };
    }
  },
);
