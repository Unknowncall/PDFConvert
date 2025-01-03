const express = require('express');
const html2PDF = require('html2pdf-ts');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Replace with your secret API key
const SECRET_KEY = process.env.KEY || '5ae2819d-8fe0-4bdc-bc39-09307c53cc2d';

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

app.post('/convert', async (req, res) => {
	console.log('Request received:', req.body);
	const {html} = req.body;

	if (!html) {
		console.log('Bad Request: Missing HTML content');
		return res.status(400).json({error: 'Bad Request: Missing HTML content'});
	}

	try {
		const randomId = Math.random().toString(36).substring(7);

		// Ensure directory exists
		const dir = path.join(__dirname, 'tmp');
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}

		const absolutePath = path.join(dir, `${randomId}.pdf`);

		const options = {
			format: 'A4',
			filePath: absolutePath,
			landscape: false,
			resolution: {
				height: 1920,
				width: 1080,
			},
		};

		await html2PDF.html2pdf.createPDF(html, options);
		res.status(200).sendFile(absolutePath);

		res.on('finish', () => {
			fs.unlinkSync(absolutePath);
		});

	} catch (error) {
		console.error('Error generating PDF:', error);
		res.status(500).json({error: 'Internal Server Error'});
	}
});

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
