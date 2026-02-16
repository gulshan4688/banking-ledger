import dotenv from "dotenv";
import nodemailer from "nodemailer"

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
    },
});

// Verify the connection configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Error connecting to email server:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});



// Function to send email
const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
            to, // list of receivers
            subject, // Subject line
            text, // plain text body
            html, // html body
        });

        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

async function sendRegistrationEmail({ username, email }) {
    const subject = 'Welcome to Backend Ledger!';
    const text = `Hello ${username},\n\nThank you for registering at Backend Ledger. We're excited to have you on board!\n\nBest regards,\nThe Backend Ledger Team`;
    const html = `<p>Hello ${username},</p><p>Thank you for registering at Backend Ledger. We're excited to have you on board!</p><p>Best regards,<br>The Backend Ledger Team</p>`;

    await sendEmail(email, subject, text, html);
}

async function sendTransactionEmail({ userEmail, name, amount, toAccount }) {
    const subject = 'Transaction Alert - Backend Ledger';

    const text = `Hello ${name},

A transaction has been successfully processed from your account.

Amount: ₹${amount}
Transferred To: ${toAccount}

If you did not authorize this transaction, please contact support immediately.

Best regards,
The Backend Ledger Team`;
    const html = `
        <p>Hello ${name},</p>

        <p>A transaction has been <strong>successfully processed</strong> from your account.</p>

        <ul>
            <li><strong>Amount:</strong> ₹${amount}</li>
            <li><strong>Transferred To:</strong> ${toAccount}</li>
        </ul>

        <p>If you did not authorize this transaction, please contact support immediately.</p>

        <p>Best regards,<br>The Backend Ledger Team</p>`;

    await sendEmail(userEmail, subject, text, html);
}

async function sendFailedTransactionEmail({ userEmail, name, amount, toAccount, reason }) {

    const subject = '⚠️ Transaction Failed - Backend Ledger';

    const text = `Hello ${name},

We were unable to process your recent transaction.

Amount: ₹${amount}
Attempted To: ${toAccount}
Reason: ${reason}

No money has been deducted from your account.

You may retry the transaction. If the issue persists, please contact support.

Best regards,  
The Backend Ledger Team`;
    const html = `
        <p>Hello ${name},</p>

        <p style="color:red;"><strong>Your transaction could not be completed.</strong></p>

        <ul>
            <li><strong>Amount:</strong> ₹${amount}</li>
            <li><strong>Attempted To:</strong> ${toAccount}</li>
            <li><strong>Reason:</strong> ${reason}</li>
        </ul>

        <p><strong>No money has been deducted.</strong></p>

        <p>You may retry the transaction. If the issue persists, please contact support.</p>

        <p>Best regards,<br>The Backend Ledger Team</p>`;
    await sendEmail(userEmail, subject, text, html);
}

export default { sendRegistrationEmail, sendTransactionEmail, sendFailedTransactionEmail };