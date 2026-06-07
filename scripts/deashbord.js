document.addEventListener("DOMContentLoaded", () => {

  // --- CONFIG / LOCALSTORAGE ---
  const STORAGE_KEY = "erp_produtos";

  function obterProdutosDoStorage() {
    const dados = localStorage.getItem(STORAGE_KEY);
    return dados ? JSON.parse(dados) : [];
  }


  // --- TELA DE CADASTRO DE PRODUTO ---
  const formCadastro = document.getElementById("form-cadastro");

  if (formCadastro) {
    formCadastro.addEventListener("submit", (evento) => {
      evento.preventDefault();

      const fabricante = document.getElementById("prod-fabricante").value.trim();
      const descricao = document.getElementById("prod-descricao").value.trim();
      const marca = document.getElementById("prod-marca").value.trim();
      const valor = document.getElementById("prod-valor").value;
      const estoque = document.getElementById("prod-estoque").value;

      const listaAtual = obterProdutosDoStorage();

      // Trava para evitar duplicado (mesma descricao + mesma marca)
      const produtoDuplicado = listaAtual.some(produto =>
        produto.descricao.toLowerCase() === descricao.toLowerCase() &&
        produto.marca.toLowerCase() === marca.toLowerCase()
      );

      if (produtoDuplicado) {
        alert(`Erro: O produto "${descricao}" da marca "${marca}" já está cadastrado!`);
        return;
      }

      // Correção do ID sequencial sem espaço no nome da variável
      const proximoNumero = listaAtual.length + 1;
      const numeroFormatado = ("000000" + proximoNumero).slice(-6);
      const idAutomatico = "INT" + numeroFormatado;

      const novoProduto = {
        id: idAutomatico,
        fabricante: fabricante,
        descricao: descricao,
        marca: marca,
        valor: valor,
        estoque: estoque
      };

      listaAtual.push(novoProduto);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listaAtual));

      alert("Produto cadastrado com sucesso!");
      formCadastro.reset();
    });
  }


  // --- TELA DE CONSULTA DE PRODUTO ---
  const tbody = document.querySelector(".data-table tbody");
  const totalResultados = document.querySelector(".table-container__title");

  if (tbody && totalResultados) {
    const listaProdutos = obterProdutosDoStorage();

    totalResultados.textContent = `Resultados encontrados (${listaProdutos.length})`;
    tbody.innerHTML = "";

    if (listaProdutos.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #a0a0a0; padding: 20px;">Nenhum produto cadastrado no sistema.</td></tr>`;
    } else {
      listaProdutos.forEach((produto) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${produto.id}</td>
          <td>${produto.fabricante}</td>
          <td>${produto.descricao}</td>
          <td>${produto.marca}</td>
          <td>R$ ${produto.valor}</td>
          <td>${produto.estoque}</td>
          <td><button class="data-table__action-btn" style="background: none; border: none; cursor: pointer;">👁</button></td>
        `;
        tbody.appendChild(tr);
      });
    }
  }
});