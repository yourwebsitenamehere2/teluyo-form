import { EmailMessage } from "cloudflare:email";

export default {
    async fetch(request, env) {
        if (request.method !== "POST") {
            return new Response("Method not allowed", { status: 405 });
        }

        try {
            const data = await request.json();

            // ✅ Format message for the email body
            const formatted = Object.entries(data)
                .map(([key, value]) => `${key}: ${value}`)
                .join("\n");

            const senderAddress = env.SENDER_EMAIL;       // e.g., "noreply@yourdomain.com"
            const recipientAddress = env.RECIPIENT_EMAIL; // e.g., "you@yourdomain.com"

            // ✅ Construct the raw RFC 2822 email message string
            // It requires standard email headers separated from the body by a blank line
            const rawEmail = [
                `From: "Website Form" <${senderAddress}>`,
                `To: ${recipientAddress}`,
                `Subject: 📩 New form submission!`,
                `Content-Type: text/plain; charset="utf-8"`,
                ``,
                formatted
            ].join("\r\n");

            // ✅ Create and send the message via Cloudflare Email Routing
            const message = new EmailMessage(senderAddress, recipientAddress, rawEmail);

            await env.EMAIL_SENDER.send(message);

            return new Response(JSON.stringify({ success: true }), { status: 200 });
        } catch (error) {
            console.error("Email sending error:", error);
            return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
        }
    }
};
