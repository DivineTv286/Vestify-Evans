export default async function handler(req, res) {
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

    const { email, fullName, planName, planAmount } = req.body;

    if (!email || !fullName) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const BREVO_API_KEY = process.env.BREVO_API_KEY; 

    const emailData = {
        sender: { name: "Vestify Support", email: "supportvestify@gmail.com" },
        to: [{ email: email, name: fullName }],
        subject: "Registration Successful - Pending Activation 🚀",
        htmlContent: `
            <div style="background-color: #0d0415; color: #ffffff; padding: 35px; font-family: Arial, sans-serif; border-radius: 20px; border: 1px solid #2e144d; max-width: 600px; margin: auto;">
                <div style="text-align: center; margin-bottom: 25px;">
                    <h2 style="color: #ffffff; margin: 0; font-size: 24px;">Vestify</h2>
                </div>
                
                <p style="color: #ffffff; font-size: 16px; line-height: 1.6;">
                    Dear ${fullName},
                </p>
                
                <p style="color: #9ca3af; font-size: 15px; line-height: 1.6;">
                    Thank you for choosing <strong>Vestify</strong> — Your Trusted Digital Earning Platform.
                </p>
                
                <p style="color: #9ca3af; font-size: 15px; line-height: 1.6;">
                    We’re pleased to inform you that your registration was successful. Your account is currently pending activation.
                </p>
                
                <div style="background: #160826; border: 1px solid #2e144d; border-radius: 14px; padding: 18px; margin: 20px 0;">
                    <p style="color: #ffffff; font-size: 14px; margin: 0 0 8px 0;">
                        <strong>Selected Plan:</strong> ${planName}
                    </p>
                    <p style="color: #f97316; font-size: 14px; margin: 0;">
                        <strong>Activation Fee:</strong> ₦${Number(planAmount).toLocaleString()}
                    </p>
                </div>

                <h3 style="color: #f97316; font-size: 16px; margin-top: 25px; margin-bottom: 10px;">Complete Your Activation</h3>
                
                <p style="color: #9ca3af; font-size: 15px; line-height: 1.6;">
                    To activate your account and gain full access to your selected plan, kindly complete the one-time activation payment through the official payment channel provided by Vestify.
                </p>
                
                <p style="color: #9ca3af; font-size: 15px; line-height: 1.6;">
                    Once your payment has been confirmed, your account will be activated.
                </p>
                
                <p style="color: #9ca3af; font-size: 15px; line-height: 1.6; margin-top: 25px;">
                    Thank you for choosing Vestify.<br><br>
                    <strong>Best regards,</strong><br>
                    Vestify Team
                </p>

                <hr style="border: none; border-top: 1px solid #2e144d; margin: 30px 0;">
                
                <p style="color: #6b7280; font-size: 12px; text-align: center; line-height: 1.5;">
                    This is an automated notification from Vestify. Please do not reply directly to this email!
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
