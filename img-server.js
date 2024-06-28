const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');

// Use CORS middleware
app.use(cors());

app.get('/image/:imageName', (req, res) => {
    const imageName = req.params.imageName;
    const imgPath = path.join(__dirname, 'src/assets/img', imageName);

    res.sendFile(imgPath, err => {
        if (err) {
            res.status(404).send('Image not found');
        }
    });
});

app.get('/fonts/:fontName', (req, res) => {
    const fontName = req.params.fontName;
    const fontPath = path.join(__dirname, 'src/assets/fonts/appfont/font', fontName);

    res.sendFile(fontPath, err => {
        if (err) {
            res.status(404).send('Image not found');
        }
    });
});

const PORT = 1200;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}/`);
});