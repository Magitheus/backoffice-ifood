import { GoogleGenerativeAI } from "@google/generative-ai";
const API_KEY = "AIzaSyAyWwERfpeUt6PMikP39bonItyH1izW_A8";
const genAI = new GoogleGenerativeAI(API_KEY);

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

async function chamarGemini(dados) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `
You are given the following financial transactions data:


${JSON.stringify(dados.despesas)}

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

  function cleanJsonString(jsonString) {
    const cleanedString = jsonString
      .replace(/```json/, "")
      .replace(/```/, "")
      .trim();

    return cleanedString;
  }
  const cleanJson = cleanJsonString(text);

  let insights;
  try {
    insights = JSON.parse(cleanJson);
    exibirInsights(insights);
  } catch (error) {
    console.error("Erro ao processar o JSON:", error);
  }
}

function exibirInsights(insights) {
  const notificacoesDiv = document.querySelector(".notificacoes");

  notificacoesDiv.innerHTML = "<h1>Notificações</h1>";

  insights.forEach((insight) => {
    const p = document.createElement("p");
    p.textContent = `${insight.tipo}: ${insight.mensagem}`;
    notificacoesDiv.appendChild(p);
  });
}

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

document.addEventListener("DOMContentLoaded", () => {
  async function carregarTransacoes() {
    return fetch("../scripts/dados.json")
      .then((response) => response.json())
      .then((data) => {
        const saida = data.transacoes.filter(
          (transacao) => transacao.tipo === "saida"
        );
        const dadosGemini = prepararDadosParaGemini(saida);
        chamarGemini(dadosGemini);
        renderizarTransacoes(saida);
      })
      .catch((error) => console.error("Erro ao carregar o JSON:", error));
  }

  function adicionarEventDelegation() {
    const tbody = document.querySelector("table tbody");

    if (!tbody) {
      console.error("Elemento <tbody> não encontrado.");
      return;
    }

    tbody.addEventListener("click", (event) => {
      const target = event.target;
      const button = target.closest("button");

      if (button && button.querySelector("i.bi-three-dots-vertical")) {
        const tr = button.closest("tr");
        if (!tr) {
          console.error("Linha da tabela não encontrada.");
          return;
        }

        const th = tr.querySelector("th");
        const tds = tr.querySelectorAll("td");

        const numero = th ? th.textContent.trim() : "";

        const descricaoElementos = tds[0].querySelectorAll("p");
        const descricao = descricaoElementos[0]
          ? descricaoElementos[0].textContent.trim()
          : "";
        const pagoParaTexto = descricaoElementos[1]
          ? descricaoElementos[1].textContent.trim()
          : "";
        const pagador = pagoParaTexto.replace("Pago para: ", "").trim();

        const promocaoElemento = tds[0].querySelector("span");
        const promocao = promocaoElemento
          ? promocaoElemento.textContent.trim()
          : "";

        const categoria = tds[1] ? tds[1].textContent.trim() : "";
        const tipo = tds[2] ? tds[2].textContent.trim() : "";
        const banco = tds[3] ? tds[3].textContent.trim() : "";
        const valorStr = tds[4] ? tds[4].textContent.trim() : "";
        const valor = parseValor(valorStr);

        const toggleIcon = tds[5].querySelector("i");
        let status = "";
        if (toggleIcon) {
          if (toggleIcon.classList.contains("bi-toggle-on")) {
            status = "pago";
          } else if (toggleIcon.classList.contains("bi-toggle-off")) {
            status = "a_pagar";
          }
        }

        preencheFormulario({
          numero,
          descricao,
          pagador,
          promocao,
          categoria,
          tipo,
          banco,
          valor,
          status,
        });
      }
    });
  }

  function parseValor(valorStr) {
    return (
      parseFloat(
        valorStr.replace("R$", "").replace(/\./g, "").replace(",", ".")
      ) || 0
    );
  }

  function preencheFormulario(dados) {
    const form = document.querySelector("form");
    const dataInput = document.getElementById("data");
    const descricaoInput = document.getElementById("descricao");
    const pagadorInput = document.getElementById("pagador");
    const lojaSelect = document.getElementById("loja");
    const categoriaSelect = document.getElementById("categoria");
    const contaSelect = document.getElementById("conta");
    const valorInput = document.getElementById("valor");
    const statusPagoRadio = document.getElementById("pago");
    const statusPendenteRadio = document.getElementById("a-pagar");

    const dataAtual = new Date().toISOString().split("T")[0];
    dataInput.value = dataAtual;

    descricaoInput.value = dados.descricao;
    pagadorInput.value = dados.pagador;

    lojaSelect.value = lojaSelect.querySelector(
      `option[value="${dados.categoria.toLowerCase()}"]`
    )
      ? dados.categoria.toLowerCase()
      : lojaSelect.value;
    categoriaSelect.value = categoriaSelect.querySelector(
      `option[value="${dados.tipo.toLowerCase().replace(/\s/g, "_")}"]`
    )
      ? dados.tipo.toLowerCase().replace(/\s/g, "_")
      : categoriaSelect.value;
    contaSelect.value = contaSelect.querySelector(
      `option[value="${dados.banco.toLowerCase()}"]`
    )
      ? dados.banco.toLowerCase()
      : contaSelect.value;

    valorInput.value = dados.valor.toFixed(2).toString().replace(".", ",");

    if (dados.status === "pago") {
      statusPagoRadio.checked = true;
      statusPendenteRadio.checked = false;
    } else if (dados.status === "a_pagar") {
      statusPagoRadio.checked = false;
      statusPendenteRadio.checked = true;
    } else {
      statusPagoRadio.checked = false;
      statusPendenteRadio.checked = false;
    }

    form.style.display = "block";
  }

  async function inicializar() {
    try {
      await carregarTransacoes();
      adicionarEventDelegation();
    } catch (error) {
      console.error("Erro durante a inicialização:", error);
    }
  }

  inicializar();
});