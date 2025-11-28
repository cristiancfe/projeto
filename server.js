
const express = require("express");
const fs = require("fs");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const storage = multer.memoryStorage();
const upload = multer({ storage });

function readJSON() {
    if (!fs.existsSync("dados.json")) {
        fs.writeFileSync("dados.json", JSON.stringify({ imagens: [] }, null, 2));
    }
    return JSON.parse(fs.readFileSync("dados.json"));
}

function saveJSON(data) {
    fs.writeFileSync("dados.json", JSON.stringify(data, null, 2));
}

app.post("/upload", upload.single("imagem"), (req, res) => {
    if (!req.file) return res.status(400).json({ erro: "Nenhuma imagem enviada" });

    const base64 = req.file.buffer.toString("base64");
    const json = readJSON();

    const nova = {
        id: Date.now(),
        nome: req.body.nome || "Sem nome",
        data: new Date().toLocaleString("pt-BR"),
        tipo: req.file.mimetype,
        imagem: `data:${req.file.mimetype};base64,${base64}`
    };

    json.imagens.push(nova);
    saveJSON(json);

    res.json({ mensagem: "Imagem salva!", imagem: nova });
});

app.get("/imagens", (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;

    const json = readJSON();
    const start = (page - 1) * limit;
    const end = start + limit;

    const totalPages = Math.ceil(json.imagens.length / limit);

    res.json({
        pagina: page,
        totalPaginas: totalPages,
        imagens: json.imagens.slice(start, end)
    });
});

app.put("/imagem/:id", (req, res) => {
    const id = Number(req.params.id);
    const novoNome = req.body.nome;

    const json = readJSON();
    const img = json.imagens.find(i => i.id === id);

    if (!img) return res.status(404).json({ erro: "Imagem não encontrada" });

    img.nome = novoNome;
    saveJSON(json);

    res.json({ mensagem: "Nome atualizado!" });
});

app.delete("/imagem/:id", (req, res) => {
    const id = Number(req.params.id);
    const json = readJSON();

    json.imagens = json.imagens.filter(i => i.id !== id);
    saveJSON(json);

    res.json({ mensagem: "Imagem removida!" });
});

app.listen(3000, () => console.log("Rodando em http://localhost:3000"));
