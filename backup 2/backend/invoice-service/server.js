const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Invoice } = require("./invoice.model");
const NodeCache = require('node-cache');

const app = express();
const port = 3007;

// Initialize cache with 60 second TTL
const invoiceCache = new NodeCache({ stdTTL: 60 });

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Increase payload limit for PDFs

// Generate an 8-character random string for ID
function generateRandomId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result;
}

// Create invoice
app.post('/invoices', async (req, res) => {
  try {
    const { order_id, filename, pdfData } = req.body;
    
    // Create the invoice record
    const invoice = await Invoice.create({
      id: generateRandomId(),
      order_id,
      filename,
      file: Buffer.from(pdfData, 'base64')
    });

    // Generate the invoice URL
    const invoiceUrl = `/invoices/${order_id}`;

    res.status(201).json({ 
      message: 'Invoice created successfully',
      invoiceId: invoice.id,
      invoiceUrl
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get invoice by order ID
app.get('/invoices/:order_id', async (req, res) => {
  try {
    const cachedInvoice = invoiceCache.get(req.params.order_id);
    if (cachedInvoice) {
      return sendInvoiceResponse(res, cachedInvoice, req.query.embed);
    }
    
    const invoice = await Invoice.findOne({
      where: { order_id: req.params.order_id }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (!invoice.file || !(invoice.file instanceof Buffer)) {
      return res.status(500).json({ error: 'Invalid PDF data' });
    }

    const cleanInvoice = invoice.get({ plain: true });
    invoiceCache.set(req.params.order_id, cleanInvoice);
    
    sendInvoiceResponse(res, cleanInvoice, req.query.embed);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Helper function to send invoice response
function sendInvoiceResponse(res, invoice, embed) {
  const headers = {
    'Content-Type': 'application/pdf',
    'Content-Length': invoice.file.length,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Content-Type-Options': 'nosniff',
    'Access-Control-Allow-Origin': '*'
  };

  // If embedded in iframe, use inline disposition
  if (embed) {
    headers['Content-Disposition'] = 'inline';
    headers['X-Frame-Options'] = 'ALLOW-FROM *';
    headers['Content-Security-Policy'] = "frame-ancestors 'self' *";
  } else {
    headers['Content-Disposition'] = `inline; filename="${encodeURIComponent(invoice.filename)}"`;
  }

  res.set(headers);
  res.send(invoice.file);
}
app.listen(port, () => {
  console.log(`Invoice service is running on http://localhost:${port}`);
});