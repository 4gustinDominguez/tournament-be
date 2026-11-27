import Mailjet from "node-mailjet";

import { EmailService, SendEmailParams } from "../domain/email.service";

export class MailjetEmailService implements EmailService {
	private readonly client: Mailjet;
	private readonly fromEmail: string;
	private readonly fromName: string;

	constructor() {
		const apiKey = process.env.MJ_APIKEY_PUBLIC;
		const apiSecret = process.env.MJ_APIKEY_PRIVATE;
		this.fromEmail = process.env.EMAIL_FROM ?? "noreply@gtm.com";
		this.fromName = process.env.EMAIL_FROM_NAME ?? "GTM";

		if (!apiKey || !apiSecret) {
			throw new Error("MJ_APIKEY_PUBLIC and MJ_APIKEY_PRIVATE are required");
		}

		this.client = new Mailjet({ apiKey, apiSecret });
	}

	async send(params: SendEmailParams): Promise<void> {
		const recipient = maskEmail(params.to);

		try {
			const { body } = await this.client.post("send", { version: "v3.1" }).request({
				Messages: [
					{
						From: {
							Email: this.fromEmail,
							Name: this.fromName,
						},
						To: [{ Email: params.to }],
						Subject: params.subject,
						HTMLPart: params.html,
					},
				],
			});

			const response = body as unknown as MailjetSendResponse;
			const messageId = response.Messages?.[0]?.To?.[0]?.MessageID;
			console.log(`[mailjet] sent "${params.subject}" to ${recipient} messageId=${messageId}`);
		} catch (error: unknown) {
			const details = error as MailjetError;
			console.error(
				`[mailjet] failed to send "${params.subject}" to ${recipient}: status=${details.statusCode} ${details.message}`,
				details.response?.body ?? "",
			);
			throw error;
		}
	}
}

interface MailjetSendResponse {
	Messages?: { To?: { MessageID?: number | string }[] }[];
}

interface MailjetError {
	statusCode?: number;
	message?: string;
	response?: { body?: unknown };
}

function maskEmail(email: string): string {
	const [localPart, domain] = email.split("@");

	return `${localPart.slice(0, 2)}***@${domain}`;
}
