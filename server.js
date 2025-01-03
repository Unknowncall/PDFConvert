const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Replace with your secret API key
const SECRET_KEY = process.env.KEY || '5ae2819d-8fe0-4bdc-bc39-09307c53cc2d'

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Middleware to check the secret key
app.use((req, res, next) => {
	const apiKey = req.headers['x-api-key'];
	if (apiKey !== SECRET_KEY) {
		return res.status(403).json({error: 'Forbidden: Invalid API Key'});
	}
	next();
});

// Route to convert HTML to PDF
app.post('/convert', async (req, res) => {
	console.log('Request received, starting conversion...');
	const {html} = req.body;

	if (!html) {
		console.log('Bad Request: Missing HTML content');
		return res.status(400).json({error: 'Bad Request: Missing HTML content'});
	}

	try {
		const browser = await puppeteer.launch({
			args: ['--no-sandbox', '--disable-setuid-sandbox'],
		});

		const page = await browser.newPage();

		await page.setContent(html, {waitUntil: 'networkidle0'});
		const pdfBuffer = await page.pdf({
			format: 'A4',
			printBackground: true,
		});

		await browser.close();

		res.set({
			'Content-Type': 'application/pdf',
			'Content-Disposition': 'attachment; filename="output.pdf"',
		});

		res.send(pdfBuffer);
	} catch (error) {
		console.error('Error generating PDF:', error);
		res.status(500).json({error: 'Internal Server Error'});
	}
});

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
