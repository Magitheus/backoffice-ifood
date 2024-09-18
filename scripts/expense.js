import { GoogleGenerativeAI } from "@google/generative-ai";
const API_KEY = "";
const genAI = new GoogleGenerativeAI(API_KEY);

function carregarTransacoes() {
  fetch("../scripts/dados.json")
    .then((response) => response.json())
    .then((data) => {
      const saida = data.transacoes.filter(
        (transacao) => transacao.tipo === "saida"
      );
      const dadosGemini = prepararDadosParaGemini(saida);
      // chamarGemini(dadosGemini);
      renderizarTransacoes(saida);
    })
    .catch((error) => console.error("Erro ao carregar o JSON:", error));
}

function prepararDadosParaGemini(transacoes) {
  const despesas = transacoes;

  const dadosFormatados = {
    despesas: despesas.map((despesa) => ({
      data: despesa.data,
      descricao: despesa.descricao,
      valor: despesa.valor,
      categoria: despesa.categoria,
    })),
  };

  return dadosFormatados;
}

function exibirInsights(insights) {
  const notificacoesDiv = document.querySelector(".notificacoes");

  // Limpar as notificações anteriores
  notificacoesDiv.innerHTML = "<h1>Notificações</h1>";

  // Adicionar cada insight como uma nova notificação
  insights.forEach((insight) => {
    const p = document.createElement("p");
    p.textContent = `${insight.tipo}: ${insight.mensagem}`;
    notificacoesDiv.appendChild(p);
  });
}

async function chamarGemini(dados) {
  // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
You are given the following financial transactions data:


[
  { "data": "2023-10-26", "valor": 100.00, "descricao": "Pagamento de conta de luz", "categoria": "Despesas" },
  { "data": "2023-10-27", "valor": 50.00, "descricao": "Compra de alimentos", "categoria": "Despesas" },
  { "data": "2023-10-28", "valor": 200.00, "descricao": "Salário", "categoria": "Renda" }
]

Generate financial insights based on these transactions. Each insight should include:
- "tipo" (the type of insight, e.g., "Aviso", "Informação", "Alerta").
- "mensagem" (a message describing the insight).

Return the insights in the following JSON format, and provide the response in Portuguese (Brazil):

[
  { "tipo": "Aviso", "mensagem": "Some warning based on the transaction data" },
  { "tipo": "Informação", "mensagem": "Some informational insight based on the transaction data" },
  { "tipo": "Alerta", "mensagem": "Some alert based on the transaction data" }
]
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  console.log(text);
  // Função para limpar a string JSON
  function cleanJsonString(jsonString) {
    // Remove os acentos graves e outras possíveis partes não desejadas
    const cleanedString = jsonString
      .replace(/```json/, "") // Remove a linha inicial ```json
      .replace(/```/, "") // Remove a linha final ```
      .trim(); // Remove espaços em branco extras

    return cleanedString;
  }

  // Limpar a string JSON
  const cleanJson = cleanJsonString(text);

  // Converter a string JSON limpa em um objeto JavaScript
  let insights;
  try {
    insights = JSON.parse(cleanJson);
    console.log(insights);
    // Chama a função para exibir os insights
    exibirInsights(insights);
  } catch (error) {
    console.error("Erro ao processar o JSON:", error);
  }
}

carregarTransacoes();

function renderizarTransacoes(transacoes) {
  const tableBody = document.querySelector("table tbody");
  tableBody.innerHTML = "";
  let diasMarcados = {};

  transacoes.sort((a, b) => new Date(b.data) - new Date(a.data));

  transacoes.forEach((transacao) => {
    const row = document.createElement("tr");

    const dia = document.createElement("th");
    dia.textContent = transacao.dia;
    if (!diasMarcados[transacao.dia]) {
      dia.style.color = "var(--bs-red)";
      diasMarcados[transacao.dia] = true;
    } else {
      dia.style.color = "var(--bs-red)";
    }
    row.appendChild(dia);

    const descricaoTd = document.createElement("td");
    const descricaoP = document.createElement("p");
    descricaoP.textContent = transacao.descricao;
    const pagoParaP = document.createElement("p");
    pagoParaP.textContent = `Pago para: ${transacao.pagoPara}`;
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

    function toggleOverlay(display) {
      document.querySelector(".edit-overlay").style.display = display
        ? "flex"
        : "none";
    }

    optionsBtn.addEventListener("click", () => toggleOverlay(true));
    document
      .querySelector(".edit-close-button")
      .addEventListener("click", () => toggleOverlay(false));

    window.addEventListener("click", (event) => {
      if (event.target.classList.contains("edit-overlay")) toggleOverlay(false);
    });

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

    if (textoCompleto.includes(searchInput)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

document
  .querySelector(".search-input")
  .addEventListener("input", filtrarTransacoes);
