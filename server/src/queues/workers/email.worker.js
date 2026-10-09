const nodemailer = require('nodemailer');
const logger = require('../../utils/logger');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const emailTemplates = {
  booking_confirmation: (data) => ({
    subject: `Booking Confirmed - ${data.bookingId}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#1a56db">🚗 Booking Confirmation</h2>
        <p>Dear <strong>${data.customer.name}</strong>,</p>
        <p>Your booking has been created successfully.</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0">
          <tr style="background:#f3f4f6"><td style="padding:10px;font-weight:bold">Booking ID</td><td style="padding:10px">${data.bookingId}</td></tr>
          <tr><td style="padding:10px;font-weight:bold">Vehicle</td><td style="padding:10px">${data.vehicle.name} (${data.vehicle.category})</td></tr>
          <tr style="background:#f3f4f6"><td style="padding:10px;font-weight:bold">Pickup</td><td style="padding:10px">${data.trip.pickupLocation}</td></tr>
          <tr><td style="padding:10px;font-weight:bold">Drop</td><td style="padding:10px">${data.trip.dropLocation}</td></tr>
          <tr style="background:#f3f4f6"><td style="padding:10px;font-weight:bold">Date</td><td style="padding:10px">${new Date(data.schedule.startDateTime).toLocaleString('en-IN')}</td></tr>
          <tr><td style="padding:10px;font-weight:bold">Amount</td><td style="padding:10px">₹${data.pricing.finalAmount.toFixed(2)}</td></tr>
        </table>
        <p>Please complete the payment to confirm your booking.</p>
        <p style="color:#666;font-size:12px;margin-top:30px">Annasagar Travels | Contact: support@annasagartravels.com</p>
      </div>
    `,
  }),

  payment_confirmation: (data) => ({
    subject: `Payment Received - ${data.bookingId}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#16a34a">✅ Payment Confirmed</h2>
        <p>Dear <strong>${data.customer.name}</strong>,</p>
        <p>We have received your payment of <strong>₹${data.amount.toFixed(2)}</strong> for booking <strong>${data.bookingId}</strong>.</p>
        <p>Your booking is now confirmed. Thank you for choosing Annasagar Travels!</p>
        <p style="color:#666;font-size:12px;margin-top:30px">Annasagar Travels | Contact: support@annasagartravels.com</p>
      </div>
    `,
  }),
};

const processEmailJob = async (job) => {
  const { name, data } = job;

  const template = emailTemplates[name];
  if (!template) {
    logger.warn(`No email template found for: ${name}`);
    return;
  }

  const email = template(data);

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@annasagartravels.com',
      to: data.customer.email,
      subject: email.subject,
      html: email.html,
    });

    logger.info(`Email sent: ${name} to ${data.customer.email}`);
  } catch (error) {
    logger.error(`Email failed: ${name} to ${data.customer.email}`, error);
    throw error; // Retry via BullMQ
  }
};

module.exports = { processEmailJob };
