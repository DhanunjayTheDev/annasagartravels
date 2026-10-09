const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Booking = require('../../models/Booking');
const logger = require('../../utils/logger');

const processInvoiceJob = async (job) => {
  const { bookingId } = job.data;

  const booking = await Booking.findById(bookingId).populate('vehicleId');
  if (!booking) {
    logger.warn(`Invoice generation skipped: booking ${bookingId} not found`);
    return;
  }

  const invoiceDir = path.join(process.cwd(), 'invoices');
  if (!fs.existsSync(invoiceDir)) {
    fs.mkdirSync(invoiceDir, { recursive: true });
  }

  const filePath = path.join(invoiceDir, `${booking.bookingId}.pdf`);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('ANNASAGAR TRAVELS', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text('Tax Invoice', { align: 'center' });
    doc.moveDown();

    doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke();
    doc.moveDown();

    // Booking info
    doc.fontSize(12).font('Helvetica-Bold').text('Booking Details');
    doc.fontSize(10).font('Helvetica');
    doc.text(`Booking ID: ${booking.bookingId}`);
    doc.text(`Date: ${new Date(booking.createdAt).toLocaleDateString('en-IN')}`);
    doc.text(`Status: ${booking.status.toUpperCase()}`);
    doc.moveDown();

    // Customer
    doc.fontSize(12).font('Helvetica-Bold').text('Customer');
    doc.fontSize(10).font('Helvetica');
    doc.text(`Name: ${booking.customer.name}`);
    doc.text(`Phone: ${booking.customer.phone}`);
    if (booking.customer.email) doc.text(`Email: ${booking.customer.email}`);
    doc.moveDown();

    // Vehicle
    doc.fontSize(12).font('Helvetica-Bold').text('Vehicle');
    doc.fontSize(10).font('Helvetica');
    doc.text(`${booking.vehicleSnapshot.name} (${booking.vehicleSnapshot.category})`);
    doc.text(`Type: ${booking.vehicleSnapshot.vehicleType}`);
    doc.text(`Capacity: ${booking.vehicleSnapshot.seatingCapacity} seats`);
    doc.moveDown();

    // Trip
    doc.fontSize(12).font('Helvetica-Bold').text('Trip Details');
    doc.fontSize(10).font('Helvetica');
    doc.text(`Pickup: ${booking.trip.pickupLocation}`);
    doc.text(`Drop: ${booking.trip.dropLocation}`);
    doc.text(`Trip Type: ${booking.trip.tripType}`);
    if (booking.trip.distance) doc.text(`Distance: ${booking.trip.distance} km`);
    doc.text(`Start: ${new Date(booking.schedule.startDateTime).toLocaleString('en-IN')}`);
    doc.text(`End: ${new Date(booking.schedule.endDateTime).toLocaleString('en-IN')}`);
    doc.moveDown();

    // Pricing
    doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke();
    doc.moveDown();
    doc.fontSize(12).font('Helvetica-Bold').text('Pricing Breakdown');
    doc.fontSize(10).font('Helvetica');

    const pricing = booking.pricing;
    doc.text(`Base Fare: ₹${pricing.baseFare.toFixed(2)}`, 50);
    doc.text(`Taxes (GST): ₹${pricing.taxes.toFixed(2)}`);
    if (pricing.extraCharges > 0) doc.text(`Extra Charges: ₹${pricing.extraCharges.toFixed(2)}`);
    if (pricing.discount > 0) doc.text(`Discount: -₹${pricing.discount.toFixed(2)}`);

    doc.moveDown();
    doc.fontSize(14).font('Helvetica-Bold')
      .text(`Total: ₹${pricing.finalAmount.toFixed(2)}`, { align: 'right' });

    // Payment
    doc.moveDown();
    doc.fontSize(10).font('Helvetica');
    doc.text(`Payment Status: ${booking.payment.status.toUpperCase()}`);
    if (booking.payment.transactionId) {
      doc.text(`Transaction ID: ${booking.payment.transactionId}`);
    }

    // Footer
    doc.moveDown(3);
    doc.fontSize(8).fillColor('#666')
      .text('Thank you for choosing Annasagar Travels!', { align: 'center' });
    doc.text('This is a computer-generated invoice.', { align: 'center' });

    doc.end();

    stream.on('finish', () => {
      logger.info(`Invoice generated: ${filePath}`);
      resolve(filePath);
    });
    stream.on('error', reject);
  });
};

module.exports = { processInvoiceJob };
