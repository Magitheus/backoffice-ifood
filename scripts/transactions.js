function carregarTransacoes() {
  fetch("../scripts/dados.json")
    .then((response) => response.json())
    .then((data) => {
      renderizarTransacoes(data.transacoes); // Chama a função de renderização e passa as transações
    })
    .catch((error) => console.error("Erro ao carregar o JSON:", error));
}

function renderizarTransacoes(transacoes) {
  const tableBody = document.querySelector("table tbody");
  tableBody.innerHTML = ""; // Limpa o conteúdo atual
  let diasMarcados = {};

  // Ordena de forma decrescente com base na data
  transacoes.sort((a, b) => new Date(b.data) - new Date(a.data));

  transacoes.forEach((transacao) => {
    const row = document.createElement("tr");

    // Coluna Dia
    const dia = document.createElement("th");
    dia.textContent = transacao.dia;
    row.appendChild(dia);

    // Coluna Descrição
    const descricaoTd = document.createElement("td");
    const descricaoP = document.createElement("p");
    descricaoP.textContent = transacao.descricao;
    const pagoParaP = document.createElement("p");
    if (transacao.tipo == "entrada") {
      dia.style.color = "#128900";
      row.style.borderColor = "#128900";
      pagoParaP.textContent = `Pago por : ${transacao.pagoPara}`;
    } else {
      dia.style.color = "var(--bs-red)";
      pagoParaP.textContent = `Pago para: ${transacao.pagoPara}`;
    }
    descricaoTd.appendChild(descricaoP);
    descricaoTd.appendChild(pagoParaP);

    if (transacao.promocao) {
      const imgPromo = document.createElement("img");
      imgPromo.src = transacao.promocao.imagem;
      descricaoTd.appendChild(imgPromo);

      const promocaoSpan = document.createElement("span");
      promocaoSpan.textContent = transacao.promocao.mensagem;
      descricaoTd.appendChild(promocaoSpan);
    }

    if (transacao.alerta) {
      const imgAlerta = document.createElement("img");
      imgAlerta.src = transacao.alerta.imagem;
      descricaoTd.appendChild(imgAlerta);

      const alertaSpan = document.createElement("span");
      alertaSpan.textContent = transacao.alerta.mensagem;
      descricaoTd.appendChild(alertaSpan);
    }

    row.appendChild(descricaoTd);

    // Colunas Loja, Categoria, Conta, Valor
    const loja = document.createElement("td");
    loja.textContent = transacao.loja;
    row.appendChild(loja);

    const categoria = document.createElement("td");
    categoria.textContent = transacao.categoria;
    row.appendChild(categoria);

    const conta = document.createElement("td");
    conta.textContent = transacao.conta;
    row.appendChild(conta);

    const valor = document.createElement("td");
    let valorFormatado = transacao.valor.toFixed(2).replace(".", ",");
    valor.textContent = `R$ ${valorFormatado}`;
    row.appendChild(valor);

    // Coluna Status
    const statusTd = document.createElement("td");
    const statusBtn = document.createElement("button");
    const statusIcon = document.createElement("i");
    statusIcon.classList.add("bi");
    statusIcon.classList.add(
      transacao.status === "on" ? "bi-toggle-on" : "bi-toggle-off"
    );
    statusBtn.appendChild(statusIcon);
    statusTd.appendChild(statusBtn);

    const optionsBtn = document.createElement("button");
    const optionsIcon = document.createElement("i");
    optionsIcon.classList.add("bi", "bi-three-dots-vertical");
    optionsBtn.appendChild(optionsIcon);
    statusTd.appendChild(optionsBtn);

    row.appendChild(statusTd);

    tableBody.appendChild(row);
  });
}

function filtrarTransacoes() {
  const searchInput = document
    .querySelector(".search-input")
    .value.toLowerCase();
  const rows = document.querySelectorAll("table tbody tr");

  rows.forEach((row) => {
    const dia = row.querySelector("th").textContent.toLowerCase();
    const descricao = row.querySelector("td p").textContent.toLowerCase();
    const loja = row.querySelectorAll("td")[1].textContent.toLowerCase();
    const categoria = row.querySelectorAll("td")[2].textContent.toLowerCase();
    const conta = row.querySelectorAll("td")[3].textContent.toLowerCase();
    const valor = row.querySelectorAll("td")[4].textContent.toLowerCase();

    const textoCompleto = `${dia} ${descricao} ${loja} ${categoria} ${conta} ${valor}`;

    // Verifica se o valor do input está contido no texto da linha
    if (textoCompleto.includes(searchInput)) {
      row.style.display = ""; // Mostra a linha
    } else {
      row.style.display = "none"; // Esconde a linha
    }
  });
}

// Adiciona um evento de escuta para detectar mudanças no input e chamar o filtro
document
  .querySelector(".search-input")
  .addEventListener("input", filtrarTransacoes);
