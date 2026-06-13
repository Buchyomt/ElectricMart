const PDFDocument = require('pdfkit');

// ─── Color Palette ───────────────────────────────────────────────────────────
const BLUE = '#2563EB';
const DARK = '#0F172A';
const SLATE = '#64748B';
const LIGHT_BG = '#F8FAFC';
const BORDER = '#E2E8F0';

/**
 * Generate an Invoice PDF for a completed order
 * @param {Object} order - Mongoose Order document
 * @param {Object} user  - Mongoose User document
 * @returns {Promise<Buffer>} PDF buffer
 */
function generateInvoicePDF(order, user) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageWidth = doc.page.width - 100; // accounting for margins

    // ── Header ───────────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 90).fill(DARK);
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#FFFFFF').text('⚡ ELECTRICMART', 50, 28);
    doc.fontSize(10).font('Helvetica').fillColor('#94A3B8').text('Professional Electrical Wholesaler · Lagos, Nigeria', 50, 58);

    doc.fillColor(BLUE).fontSize(18).font('Helvetica-Bold')
      .text('INVOICE', 50, 110);

    // ── Invoice Meta ─────────────────────────────────────────────────────────
    const meta = [
      [`Invoice #`, `INV-${order._id.toString().slice(-8).toUpperCase()}`],
      [`Date`, new Date(order.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })],
      [`Status`, order.paymentStatus.toUpperCase()],
    ];
    let y = 110;
    meta.forEach(([label, value]) => {
      doc.fillColor(SLATE).font('Helvetica').fontSize(9).text(label, 380, y, { width: 80, align: 'right' });
      doc.fillColor(DARK).font('Helvetica-Bold').fontSize(9).text(value, 465, y, { width: 80, align: 'right' });
      y += 16;
    });

    // ── Bill To ───────────────────────────────────────────────────────────────
    doc.roundedRect(50, 155, 240, 85, 6).fill(LIGHT_BG);
    doc.fillColor(SLATE).fontSize(8).font('Helvetica-Bold').text('BILL TO', 65, 168);
    doc.fillColor(DARK).fontSize(10).font('Helvetica-Bold').text(order.shippingAddress.fullName, 65, 182);
    doc.fillColor(SLATE).fontSize(9).font('Helvetica')
      .text(order.shippingAddress.address || '', 65, 196)
      .text(order.shippingAddress.phone || '', 65, 210)
      .text(order.shippingAddress.email || user.email || '', 65, 224);

    doc.roundedRect(310, 155, 240, 85, 6).fill(LIGHT_BG);
    doc.fillColor(SLATE).fontSize(8).font('Helvetica-Bold').text('SHIP TO', 325, 168);
    doc.fillColor(DARK).fontSize(10).font('Helvetica-Bold').text(order.shippingAddress.fullName, 325, 182);
    doc.fillColor(SLATE).fontSize(9).font('Helvetica')
      .text(order.deliveryOption || 'Site Delivery', 325, 196)
      .text(order.shippingAddress.zone || '', 325, 210);

    // ── Items Table ───────────────────────────────────────────────────────────
    const tableTop = 260;
    doc.rect(50, tableTop, pageWidth, 24).fill(DARK);
    doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold')
      .text('MATERIAL DESCRIPTION', 60, tableTop + 8)
      .text('QTY', 360, tableTop + 8, { width: 40, align: 'center' })
      .text('UNIT PRICE', 410, tableTop + 8, { width: 80, align: 'right' })
      .text('TOTAL', 500, tableTop + 8, { width: 90, align: 'right' });

    let rowY = tableTop + 24;
    order.items.forEach((item, i) => {
      if (i % 2 === 0) doc.rect(50, rowY, pageWidth, 22).fill('#F1F5F9');
      doc.fillColor(DARK).font('Helvetica').fontSize(9)
        .text(item.name, 60, rowY + 7, { width: 290, ellipsis: true })
        .text(item.quantity, 360, rowY + 7, { width: 40, align: 'center' })
        .text(`₦${item.price.toLocaleString()}`, 410, rowY + 7, { width: 80, align: 'right' })
        .text(`₦${(item.price * item.quantity).toLocaleString()}`, 500, rowY + 7, { width: 90, align: 'right' });
      rowY += 22;
    });

    // ── Totals ────────────────────────────────────────────────────────────────
    rowY += 10;
    const totals = [
      ['Subtotal', `₦${(order.subtotal || 0).toLocaleString()}`],
      ['Delivery Fee', `₦${(order.shippingFee || 0).toLocaleString()}`],
      ['VAT (7.5%)', `₦${(order.vat || 0).toLocaleString()}`],
    ];
    totals.forEach(([label, value]) => {
      doc.fillColor(SLATE).fontSize(9).font('Helvetica').text(label, 410, rowY, { width: 80, align: 'right' });
      doc.fillColor(DARK).font('Helvetica-Bold').text(value, 500, rowY, { width: 90, align: 'right' });
      rowY += 18;
    });

    // Grand total
    doc.rect(390, rowY, pageWidth - 340, 28).fill(BLUE);
    doc.fillColor('#FFFFFF').fontSize(11).font('Helvetica-Bold')
      .text('GRAND TOTAL', 400, rowY + 8, { width: 90, align: 'right' })
      .text(`₦${(order.total || 0).toLocaleString()}`, 500, rowY + 8, { width: 90, align: 'right' });
    rowY += 50;

    // ── Footer ────────────────────────────────────────────────────────────────
    doc.rect(50, rowY, pageWidth, 1).fill(BORDER);
    rowY += 12;
    doc.fillColor(SLATE).fontSize(8).font('Helvetica')
      .text('Thank you for your business. For enquiries call +234 800 ELECTRIC or email help@electricmart.ng', 50, rowY, { align: 'center', width: pageWidth })
      .text('ElectricMart Nigeria · Professional Electrical Wholesaler · Alaba to Lekki', 50, rowY + 14, { align: 'center', width: pageWidth });

    doc.end();
  });
}

/**
 * Generate a Waybill PDF for order dispatch
 */
function generateWaybillPDF(order) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageWidth = doc.page.width - 100;

    // ── Header ───────────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 90).fill(DARK);
    doc.fontSize(22).font('Helvetica-Bold').fillColor('#FFFFFF').text('⚡ ELECTRICMART', 50, 28);
    doc.fontSize(10).font('Helvetica').fillColor('#94A3B8').text('Lagos, Nigeria · +234 800 ELECTRIC', 50, 58);
    doc.fillColor(BLUE).fontSize(16).font('Helvetica-Bold').text('OFFICIAL DELIVERY WAYBILL', 300, 35, { width: 250, align: 'right' });
    doc.fillColor('#94A3B8').fontSize(9).text(`Date: ${new Date().toLocaleDateString('en-NG')}`, 300, 58, { width: 250, align: 'right' });

    // ── Shipment Details ──────────────────────────────────────────────────────
    doc.rect(50, 105, 240, 90).lineWidth(1).strokeColor(BORDER).stroke();
    doc.fillColor(SLATE).fontSize(8).font('Helvetica-Bold').text('SHIP FROM', 65, 115);
    doc.fillColor(DARK).fontSize(10).font('Helvetica-Bold').text('ElectricMart Nigeria', 65, 128);
    doc.fillColor(SLATE).fontSize(9).font('Helvetica')
      .text('Alaba International Market, Lagos', 65, 142)
      .text('+234 800 ELECTRIC', 65, 156)
      .text('help@electricmart.ng', 65, 170);

    doc.rect(310, 105, 240, 90).lineWidth(1).strokeColor(BORDER).stroke();
    doc.fillColor(SLATE).fontSize(8).font('Helvetica-Bold').text('SHIP TO', 325, 115);
    doc.fillColor(DARK).fontSize(10).font('Helvetica-Bold').text(order.shippingAddress.fullName, 325, 128);
    doc.fillColor(SLATE).fontSize(9).font('Helvetica')
      .text(order.shippingAddress.address || '', 325, 142)
      .text(order.shippingAddress.phone || '', 325, 156)
      .text(`Zone: ${order.shippingAddress.zone || ''}`, 325, 170);

    // ── Order Reference ───────────────────────────────────────────────────────
    const refBoxY = 210;
    doc.rect(50, refBoxY, pageWidth, 35).fill(BLUE);
    doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica')
      .text('ORDER REF:', 65, refBoxY + 12)
      .text('DELIVERY TYPE:', 240, refBoxY + 12)
      .text('PAYMENT:', 440, refBoxY + 12);
    doc.font('Helvetica-Bold')
      .text(`#${order._id.toString().slice(-10).toUpperCase()}`, 130, refBoxY + 12)
      .text(order.deliveryOption || 'Site Delivery', 330, refBoxY + 12)
      .text(order.paymentStatus.toUpperCase(), 490, refBoxY + 12);

    // ── Items Table ───────────────────────────────────────────────────────────
    const tableTop = 262;
    doc.rect(50, tableTop, pageWidth, 24).fill('#1E293B');
    doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold')
      .text('ITEM DESCRIPTION', 60, tableTop + 8)
      .text('QTY', 400, tableTop + 8, { width: 50, align: 'center' })
      .text('AMOUNT', 460, tableTop + 8, { width: 90, align: 'right' });

    let rowY = tableTop + 24;
    order.items.forEach((item, i) => {
      if (i % 2 === 0) doc.rect(50, rowY, pageWidth, 22).fill('#F8FAFC');
      doc.fillColor(DARK).font('Helvetica').fontSize(9)
        .text(item.name, 60, rowY + 7, { width: 335, ellipsis: true })
        .text(item.quantity, 400, rowY + 7, { width: 50, align: 'center' })
        .text(`₦${(item.price * item.quantity).toLocaleString()}`, 460, rowY + 7, { width: 90, align: 'right' });
      rowY += 22;
    });

    rowY += 10;
    doc.rect(390, rowY, pageWidth - 340, 28).fill(DARK);
    doc.fillColor('#FFFFFF').fontSize(11).font('Helvetica-Bold')
      .text('TOTAL VALUE', 400, rowY + 8, { width: 60, align: 'right' })
      .text(`₦${(order.total || 0).toLocaleString()}`, 470, rowY + 8, { width: 80, align: 'right' });

    // ── Signature Boxes ───────────────────────────────────────────────────────
    rowY += 60;
    doc.rect(50, rowY, 220, 60).lineWidth(1).strokeColor(BORDER).stroke();
    doc.fillColor(SLATE).fontSize(8).text('DISPATCHED BY (SIGNATURE & STAMP)', 60, rowY + 8);
    doc.fillColor(DARK).fontSize(9).text('Name: ______________________', 60, rowY + 32);

    doc.rect(330, rowY, 220, 60).lineWidth(1).strokeColor(BORDER).stroke();
    doc.fillColor(SLATE).fontSize(8).text("RECEIVER'S SIGNATURE & DATE", 340, rowY + 8);
    doc.fillColor(DARK).fontSize(9)
      .text('Name: ______________________', 340, rowY + 28)
      .text('Date: ______________________', 340, rowY + 44);

    // ── Footer ────────────────────────────────────────────────────────────────
    rowY += 80;
    doc.rect(50, rowY, pageWidth, 1).fill(BORDER);
    doc.fillColor(SLATE).fontSize(8).font('Helvetica')
      .text('This waybill confirms dispatch of the listed materials. Any discrepancy must be reported within 24 hours.', 50, rowY + 10, { align: 'center', width: pageWidth })
      .text('ElectricMart Nigeria — help@electricmart.ng — +234 800 ELECTRIC', 50, rowY + 22, { align: 'center', width: pageWidth });

    doc.end();
  });
}

/**
 * Generate a Quote PDF for a formal RFQ
 */
function generateQuotePDF(quote, user) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageWidth = doc.page.width - 100;
    const itemsToShow = (quote.adminResponse && quote.adminResponse.adjustedItems && quote.adminResponse.adjustedItems.length > 0)
      ? quote.adminResponse.adjustedItems
      : quote.items;

    // Header
    doc.rect(0, 0, doc.page.width, 90).fill(DARK);
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#FFFFFF').text('⚡ ELECTRICMART', 50, 28);
    doc.fontSize(10).font('Helvetica').fillColor('#94A3B8').text('Professional Electrical Wholesaler · Lagos, Nigeria', 50, 58);
    doc.fillColor(BLUE).fontSize(18).font('Helvetica-Bold').text('PROJECT QUOTE', 300, 35, { width: 250, align: 'right' });

    const validDate = new Date(quote.validUntil).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });

    let y = 110;
    [
      ['Quote Ref', `QT-${quote._id.toString().slice(-8).toUpperCase()}`],
      ['Issued', new Date(quote.createdAt).toLocaleDateString('en-NG')],
      ['Valid Until', validDate],
      ['Status', quote.status.toUpperCase()],
    ].forEach(([label, value]) => {
      doc.fillColor(SLATE).font('Helvetica').fontSize(9).text(label, 380, y, { width: 80, align: 'right' });
      doc.fillColor(DARK).font('Helvetica-Bold').fontSize(9).text(value, 465, y, { width: 80, align: 'right' });
      y += 16;
    });

    doc.roundedRect(50, 175, pageWidth, 55, 6).fill(LIGHT_BG);
    doc.fillColor(SLATE).fontSize(8).font('Helvetica-Bold').text('PROJECT DETAILS', 65, 185);
    doc.fillColor(DARK).fontSize(11).font('Helvetica-Bold').text(quote.projectName, 65, 198);
    doc.fillColor(SLATE).fontSize(9).font('Helvetica')
      .text(`Delivery Zone: ${quote.location}`, 65, 213)
      .text(`Client: ${user.name} — ${user.email}`, 300, 198)
      .text(`Company: ${user.companyName || 'N/A'}`, 300, 213);

    if (quote.adminResponse && quote.adminResponse.message) {
      doc.roundedRect(50, 242, pageWidth, 35, 6).fill('#EFF6FF');
      doc.fillColor(BLUE).fontSize(8).font('Helvetica-Bold').text('ADMIN NOTE:', 65, 252);
      doc.fillColor(DARK).fontSize(9).font('Helvetica').text(quote.adminResponse.message, 140, 252, { width: pageWidth - 100 });
    }

    const tableTop = 292;
    doc.rect(50, tableTop, pageWidth, 24).fill(DARK);
    doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold')
      .text('MATERIAL DESCRIPTION', 60, tableTop + 8)
      .text('BRAND', 320, tableTop + 8)
      .text('QTY', 400, tableTop + 8, { width: 40, align: 'center' })
      .text('UNIT PRICE', 450, tableTop + 8, { width: 70, align: 'right' })
      .text('TOTAL', 530, tableTop + 8, { width: 70, align: 'right' });

    let rowY = tableTop + 24;
    itemsToShow.forEach((item, i) => {
      if (i % 2 === 0) doc.rect(50, rowY, pageWidth, 22).fill(LIGHT_BG);
      doc.fillColor(DARK).font('Helvetica').fontSize(9)
        .text(item.name, 60, rowY + 7, { width: 255, ellipsis: true })
        .text(item.brand || '', 320, rowY + 7, { width: 75 })
        .text(item.quantity, 400, rowY + 7, { width: 40, align: 'center' })
        .text(`₦${(item.unitPrice || 0).toLocaleString()}`, 450, rowY + 7, { width: 70, align: 'right' })
        .text(`₦${((item.unitPrice || 0) * item.quantity).toLocaleString()}`, 530, rowY + 7, { width: 70, align: 'right' });
      rowY += 22;
    });

    rowY += 10;
    const finalTotal = (quote.adminResponse && quote.adminResponse.adjustedTotal) || quote.total;
    [
      ['Materials Subtotal', `₦${(quote.subtotal || 0).toLocaleString()}`],
      ['Delivery Fee', `₦${(quote.deliveryFee || 0).toLocaleString()}`],
      ['VAT (7.5%)', `₦${(quote.vat || 0).toLocaleString()}`],
    ].forEach(([label, value]) => {
      doc.fillColor(SLATE).fontSize(9).font('Helvetica').text(label, 410, rowY, { width: 110, align: 'right' });
      doc.fillColor(DARK).font('Helvetica-Bold').text(value, 530, rowY, { width: 70, align: 'right' });
      rowY += 18;
    });

    doc.rect(390, rowY, pageWidth - 340, 30).fill(BLUE);
    doc.fillColor('#FFFFFF').fontSize(12).font('Helvetica-Bold')
      .text('GRAND TOTAL', 400, rowY + 9, { width: 120, align: 'right' })
      .text(`₦${(finalTotal || 0).toLocaleString()}`, 530, rowY + 9, { width: 70, align: 'right' });

    rowY += 50;
    doc.fillColor(SLATE).fontSize(8).font('Helvetica-Oblique')
      .text('This quote is valid for 30 days from the date of issue. Prices are subject to market conditions. Contact us to confirm availability.', 50, rowY, { width: pageWidth })
      .text('ElectricMart Nigeria — help@electricmart.ng — +234 800 ELECTRIC', 50, rowY + 20, { align: 'center', width: pageWidth });

    doc.end();
  });
}

module.exports = { generateInvoicePDF, generateWaybillPDF, generateQuotePDF };
