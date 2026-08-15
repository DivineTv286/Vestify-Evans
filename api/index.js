// api/index.js (Vercel Serverless Function for Vestify)
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-Type, Date, X-Api-Key');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, fullName, planName, planAmount, paymentLink } = req.body;

    if (!email || !fullName) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const BREVO_API_KEY = process.env.BREVO_API_KEY; // Set this in your Vercel/Hosting dashboard

    const emailData = {
        sender: { name: "Vestify Support", email: "no-reply@vestify.com" },
        to: [{ email: email, name: fullName }],
        subject: "Welcome to Vestify! Complete Your Plan Activation 🚀",
        htmlContent: `
            <div style="background-color: #0d0415; color: #ffffff; padding: 35px; font-family: Arial, sans-serif; border-radius: 20px; border: 1px solid #2e144d; max-width: 600px; margin: auto;">
                <div style="text-align: center; margin-bottom: 25px;">
                    <h2 style="color: #ffffff; margin: 0; font-size: 24px;">Vestify</h2>
                </div>
                <h3 style="color: #f97316; margin-top: 0; font-size: 20px;">Welcome aboard, ${fullName}! 🎉</h3>
                <p style="color: #9ca3af; font-size: 15px; line-height: 1.6;">
                    We are thrilled to have you join us. You have successfully selected the <strong>${planName}</strong> plan (₦${Number(planAmount).toLocaleString()}).
                </p>
                <p style="color: #9ca3af; font-size: 15px; line-height: 1.6;">
                    To unlock your dashboard and activate your full membership benefits, please complete your secure payment by clicking the button below:
                </p>
                <div style="text-align: center; margin: 35px 0;">
                    <a href="${paymentLink}" style="background: linear-gradient(to right, #f59e0b, #f97316, #db2777); color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block; box-shadow: 0 10px 20px rgba(249, 115, 22, 0.3);">
                        Complete Activation Now →
                    </a>
                </div>
                <hr style="border: none; border-top: 1px solid #2e144d; margin: 30px 0;">
                <p style="color: #6b7280; font-size: 12px; text-align: center; line-height: 1.5;">
                    This is an automated notification from Vestify. Please do not reply directly to this email.
                </p>
            </div>
        `
    };

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify(emailData)
        });

        if (!response.ok) {
            const errorRes = await response.text();
            return res.status(response.status).json({ error: errorRes });
        }

        const data = await response.json();
        return res.status(200).json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
