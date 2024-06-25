const express = require('express');
const path = require('path');
const app = express();

app.get('/image/:imageName', (req, res) => {
    const imageName = req.params.imageName;
    const imgPath = path.join(__dirname, 'src/assets/img', imageName);

    res.sendFile(imgPath, err => {
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