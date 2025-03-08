const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const sharp = require('sharp');

const app = express();
const port = process.env.PORT || 4003;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Konfiguracja multer dla przesyłania plików
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '../images', req.body.listingId);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const imageNumber = req.body.imageNumber || '1';
        cb(null, `${imageNumber}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

// Endpoint do przesyłania zdjęć
app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nie przesłano pliku' });
        }

        const { listingId, imageNumber } = req.body;
        if (!listingId || !imageNumber) {
            return res.status(400).json({ error: 'Brak wymaganych parametrów' });
        }

        // Optymalizacja zdjęcia
        const optimizedImagePath = req.file.path.replace(path.extname(req.file.path), '_opt.jpg');
        await sharp(req.file.path)
            .resize(1600, 1600, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 80 })
            .toFile(optimizedImagePath);

        // Usunięcie oryginalnego pliku
        fs.unlinkSync(req.file.path);

        // Generowanie URL do zdjęcia
        const imageUrl = `https://images.aihub.ovh/${listingId}/${imageNumber}_opt.jpg`;
        const htmlTag = `<img src="${imageUrl}" alt="Zdjęcie ${imageNumber}">`;

        res.json({
            success: true,
            imageUrl,
            htmlTag
        });
    } catch (error) {
        console.error('Błąd podczas przetwarzania zdjęcia:', error);
        res.status(500).json({ error: 'Wystąpił błąd podczas przetwarzania zdjęcia' });
    }
});

// Endpoint do pobierania listy zdjęć
app.get('/images/:listingId', (req, res) => {
    const listingId = req.params.listingId;
    const dir = path.join(__dirname, '../images', listingId);

    if (!fs.existsSync(dir)) {
        return res.json({ images: [] });
    }

    const files = fs.readdirSync(dir)
        .filter(file => file.endsWith('_opt.jpg'))
        .map(file => {
            const number = file.split('_')[0];
            return {
                number,
                url: `https://images.aihub.ovh/${listingId}/${file}`,
                htmlTag: `<img src="https://images.aihub.ovh/${listingId}/${file}" alt="Zdjęcie ${number}">`
            };
        });

    res.json({ images: files });
});

app.listen(port, () => {
    console.log(`Serwer uruchomiony na porcie ${port}`);
});