
let pagina = 1;
let editarID = null;

async function carregar() {
    const res = await fetch(`/imagens?page=${pagina}`);
    const dados = await res.json();

    const galeria = document.getElementById("galeria");
    galeria.innerHTML = "";

    dados.imagens.forEach(img => {
        const div = document.createElement("div");
        div.classList.add("item");
        div.innerHTML = `
            <img src="${img.imagem}">
            <p><b>${img.nome}</b></p>
            <button onclick="abrirModal(${img.id}, '${img.nome}')">Editar nome</button>
            <button onclick="excluir(${img.id})" style="background:red;color:white">Excluir</button>
        `;
        galeria.appendChild(div);
    });

    document.getElementById("infoPagina").textContent =
        `Página ${dados.pagina} de ${dados.totalPaginas}`;

    document.getElementById("anterior").disabled = dados.pagina === 1;
    document.getElementById("proximo").disabled = dados.pagina === dados.totalPaginas;
}

carregar();

document.getElementById("anterior").onclick = () => { pagina--; carregar(); };
document.getElementById("proximo").onclick = () => { pagina++; carregar(); };

document.getElementById("formImg").onsubmit = async e => {
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const file = document.getElementById("imgInput").files[0];

    const fd = new FormData();
    fd.append("nome", nome);
    fd.append("imagem", file);

    await fetch("/upload", { method: "POST", body: fd });
    document.getElementById("formImg").reset();

    carregar();
};

function abrirModal(id, nomeAtual) {
    editarID = id;
    document.getElementById("editNome").value = nomeAtual;
    document.getElementById("modal").style.display = "flex";
}

document.getElementById("fecharModal").onclick = () =>
    document.getElementById("modal").style.display = "none";

document.getElementById("salvarEdit").onclick = async () => {
    const novoNome = document.getElementById("editNome").value;

    await fetch("/imagem/" + editarID, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: novoNome })
    });

    document.getElementById("modal").style.display = "none";
    carregar();
};

async function excluir(id) {
    if (!confirm("Deseja excluir?")) return;
    await fetch("/imagem/" + id, { method: "DELETE" });
    carregar();
}
