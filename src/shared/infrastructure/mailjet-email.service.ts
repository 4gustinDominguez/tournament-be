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
		await this.client.post("send", { version: "v3.1" }).request({
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
	}
}
