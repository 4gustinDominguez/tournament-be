export interface SendEmailParams {
	to: string;
	subject: string;
	html: string;
	locale?: string;
}

export interface EmailService {
	send(params: SendEmailParams): Promise<void>;
}
