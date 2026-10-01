const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'frontend')));

// cria pasta uploads se não existir
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });
}
if (!fs.existsSync(path.join(__dirname, 'frontend', 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'frontend', 'uploads'), { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10
});
console.log('DEBUG USER:', process.env.DB_USER);
console.log('DEBUG HOST:', process.env.DB_HOST);


// ===== SUAS ROTAS DE API - MANTIVE O EXEMPLO, NÃO APAGA AS SUAS =====
// Exemplo: app.get('/api/produtos', ...)
// COLE SUAS ROTAS AQUI SE TIVER, ANTES DO CÓDIGO DE BAIXO

// Rota de upload exemplo
app.post('/api/upload', upload.single('imagem'), (req, res) => {
  res.json({ filename: req.file.filename });
});

// ===== SERVIR O FRONTEND - ISSO CONSERTA O Cannot GET / =====
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Essa tem que ser a ULTIMA rota
app.get('/{*any}', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Rota da API não encontrada' });
  }
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));