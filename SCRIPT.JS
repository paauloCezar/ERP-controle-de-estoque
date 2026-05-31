
// Estado global da aplicação em memória
let produtos = [];
let totalEntradas = 0;
let totalSaidas = 0;
let historico = [];
let currentUser = null; // usuário da sessão atual (não persistido)

// Carrega dados do localStorage: produtos, totais e histórico de movimentações
function loadProducts() {
    const raw = localStorage.getItem('produtos');
    const entradas = localStorage.getItem('totalEntradas');
    const saidas = localStorage.getItem('totalSaidas');
    const histRaw = localStorage.getItem('historico');

    if (raw) {
        try {
            produtos = JSON.parse(raw);
        } catch (e) {
            produtos = [];
        }
    } else {
        produtos = [];
    }

    totalEntradas = entradas ? Number(entradas) : 0;
    totalSaidas = saidas ? Number(saidas) : 0;
    historico = histRaw ? JSON.parse(histRaw) : [];
}

function saveProducts() {
    localStorage.setItem('produtos', JSON.stringify(produtos));
    localStorage.setItem('totalEntradas', totalEntradas.toString());
    localStorage.setItem('totalSaidas', totalSaidas.toString());
    localStorage.setItem('historico', JSON.stringify(historico));
}

// Usuários também são salvos localmente para login simples
function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '{}');
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Mostra o formulário de cadastro de usuário
function showRegister() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
}

function showLogin() {
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
}

// Valida credenciais de login e abre a tela principal
function handleLogin() {
    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value.trim();
    const errorEl = document.getElementById('loginError');

    const users = getUsers();

    if (users[user] && users[user] === pass) {
        currentUser = user;
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainContent').classList.remove('hidden');
        // não gravar sessão: exigir login em cada visita
        errorEl.innerText = '';
        atualizarTabela();
        atualizarHistorico();
    } else {
        errorEl.innerText = 'Usuário ou senha inválidos.';
    }
}

// Registra um novo usuário e abre a tela principal automaticamente
function handleRegister() {
    const user = document.getElementById('registerUser').value.trim();
    const pass = document.getElementById('registerPass').value.trim();
    const pass2 = document.getElementById('registerPass2').value.trim();
    const errorEl = document.getElementById('registerError');

    if (!user || !pass || !pass2) {
        errorEl.innerText = 'Preencha todos os campos.';
        return;
    }
    if (pass !== pass2) {
        errorEl.innerText = 'Senhas não coincidem.';
        return;
    }

    const users = getUsers();
    if (users[user]) {
        errorEl.innerText = 'Usuário já existe.';
        return;
    }

    users[user] = pass;
    saveUsers(users);

    // logar automaticamente
    currentUser = user;
    // não gravar sessão: loga localmente apenas nesta visualização
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainContent').classList.remove('hidden');
    atualizarTabela();
    atualizarHistorico();
}

// Nota: não há persistência de sessão; o login precisa ser feito em cada recarga

// Inicializa o estado quando a página termina de carregar
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    populateRelatorioUsers();
    atualizarTabela();
    atualizarHistorico();
});

// Monta o filtro de usuários disponíveis para relatórios
function populateRelatorioUsers() {
    const sel = document.getElementById('relatorioUser');
    if (!sel) return;
    sel.innerHTML = '<option value="">Todos</option>';
    const users = getUsers();
    Object.keys(users).forEach(u => {
        const opt = document.createElement('option');
        opt.value = u;
        opt.innerText = u;
        sel.appendChild(opt);
    });
}

// Abre ou fecha a seção de relatórios e atualiza o conteúdo
function showRelatorios() {
    const sec = document.getElementById('relatoriosSection');
    if (!sec) return;
    sec.classList.toggle('hidden');
    if (!sec.classList.contains('hidden')) {
        populateRelatorioUsers();
        atualizarRelatorio();
        atualizarRelatorioProdutos();
    }
}

// Exibe o painel principal do Dashboard e esconde seções adicionais
function showDashboard() {
    const main = document.getElementById('mainContent');
    const historico = document.getElementById('historicoSection');
    const relatorios = document.getElementById('relatoriosSection');
    if (main) main.classList.remove('hidden');
    if (historico) historico.classList.add('hidden');
    if (relatorios) relatorios.classList.add('hidden');
    atualizarTabela();
}

// Filtra o histórico para gerar o relatório na tela
function atualizarRelatorio() {
    const from = document.getElementById('relatorioFrom').value;
    const to = document.getElementById('relatorioTo').value;
    const user = document.getElementById('relatorioUser').value;

    let filtered = historico.slice();
    if (user) filtered = filtered.filter(h => h.usuario === user);
    if (from) {
        const f = new Date(from);
        filtered = filtered.filter(h => new Date(h.timestamp) >= f);
    }
    if (to) {
        const t = new Date(to);
        // include whole day
        t.setHours(23,59,59,999);
        filtered = filtered.filter(h => new Date(h.timestamp) <= t);
    }

    const tbody = document.getElementById('relatorioTabela');
    tbody.innerHTML = '';
    filtered.forEach(h => {
        const row = `<tr>
            <td>${new Date(h.timestamp).toLocaleString()}</td>
            <td>${h.usuario}</td>
            <td>${h.tipo}</td>
            <td>${h.produto}</td>
            <td>${h.quantidade}</td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

// Exporta o relatório filtrado como arquivo CSV
function exportarRelatorioCSV() {
    const from = document.getElementById('relatorioFrom').value;
    const to = document.getElementById('relatorioTo').value;
    const user = document.getElementById('relatorioUser').value;
    let filtered = historico.slice();
    if (user) filtered = filtered.filter(h => h.usuario === user);
    if (from) {
        const f = new Date(from);
        filtered = filtered.filter(h => new Date(h.timestamp) >= f);
    }
    if (to) {
        const t = new Date(to);
        t.setHours(23,59,59,999);
        filtered = filtered.filter(h => new Date(h.timestamp) <= t);
    }

    if (filtered.length === 0) {
        alert('Nenhum registro para exportar.');
        return;
    }

    const header = ['Data','Usuário','Tipo','Produto','Quantidade'];
    const rows = filtered.map(h => [new Date(h.timestamp).toLocaleString(), h.usuario, h.tipo, h.produto, h.quantidade]);
    const csvContent = [header, ...rows].map(r => r.map(cell => '"' + String(cell).replace(/"/g,'""') + '"').join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'relatorio_movimentacoes.csv';
    a.click();
    URL.revokeObjectURL(url);
}

// Atualiza a tabela de produtos dentro da aba de relatórios
function atualizarRelatorioProdutos() {
    const tbody = document.getElementById('relatorioProdutosTabela');
    if (!tbody) return;
    tbody.innerHTML = '';
    produtos.forEach(produto => {
        tbody.innerHTML += `
            <tr>
                <td>${produto.nome}</td>
                <td>${produto.quantidade}</td>
            </tr>
        `;
    });
}

// Exporta o relatório de estoque atual em PDF
function exportarRelatorioProdutosPDF() {
    if (produtos.length === 0) {
        alert('Não há produtos para exportar.');
        return;
    }

    let html = `<!doctype html><html><head><meta charset="utf-8"><title>Relatório de Estoque</title>`;
    html += `<style>body{font-family:Arial,Helvetica,sans-serif;padding:20px}h2{text-align:center}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border:1px solid #ccc;padding:8px;text-align:left}th{background:#f3f4f6}</style>`;
    html += `</head><body>`;
    html += `<h2>Relatório de Estoque Atual</h2>`;
    html += `<table><thead><tr><th>Produto</th><th>Quantidade</th></tr></thead><tbody>`;
    produtos.forEach(p => {
        html += `<tr><td>${p.nome}</td><td>${p.quantidade}</td></tr>`;
    });
    html += `</tbody></table>`;
    html += `<p style="margin-top:20px">Gerado em: ${new Date().toLocaleString()}</p>`;
    html += `</body></html>`;

    const win = window.open('', '_blank');
    if (!win) {
        alert('Não foi possível abrir a janela de impressão. Verifique o bloqueador de pop-ups.');
        return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
}

// Exporta o relatório de movimentações filtrado em PDF
function exportarRelatorioMovimentacoesPDF() {
    const from = document.getElementById('relatorioFrom').value;
    const to = document.getElementById('relatorioTo').value;
    const user = document.getElementById('relatorioUser').value;
    let filtered = historico.slice();
    if (user) filtered = filtered.filter(h => h.usuario === user);
    if (from) {
        const f = new Date(from);
        filtered = filtered.filter(h => new Date(h.timestamp) >= f);
    }
    if (to) {
        const t = new Date(to);
        t.setHours(23,59,59,999);
        filtered = filtered.filter(h => new Date(h.timestamp) <= t);
    }

    if (filtered.length === 0) {
        alert('Nenhum registro para exportar.');
        return;
    }

    let html = `<!doctype html><html><head><meta charset="utf-8"><title>Relatório de Movimentações</title>`;
    html += `<style>body{font-family:Arial,Helvetica,sans-serif;padding:20px}h2{text-align:center}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border:1px solid #ccc;padding:8px;text-align:left}th{background:#f3f4f6}</style>`;
    html += `</head><body>`;
    html += `<h2>Relatório de Movimentações</h2>`;
    html += `<table><thead><tr><th>Data</th><th>Usuário</th><th>Tipo</th><th>Produto</th><th>Quantidade</th></tr></thead><tbody>`;
    filtered.forEach(h => {
        html += `<tr><td>${new Date(h.timestamp).toLocaleString()}</td><td>${h.usuario}</td><td>${h.tipo}</td><td>${h.produto}</td><td>${h.quantidade}</td></tr>`;
    });
    html += `</tbody></table>`;
    html += `<p style="margin-top:20px">Gerado em: ${new Date().toLocaleString()}</p>`;
    html += `</body></html>`;

    const win = window.open('', '_blank');
    if (!win) {
        alert('Não foi possível abrir a janela de impressão. Verifique o bloqueador de pop-ups.');
        return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
}

// Adiciona um produto novo ou soma quantidade se o produto já existir
function adicionarProduto() {

    const nome = document.getElementById("nomeProduto").value;
    const quantidadeRaw = document.getElementById("quantidadeProduto").value;
    const quantidade = parseInt(quantidadeRaw, 10);

    if (!nome || isNaN(quantidade) || quantidade <= 0) {
        alert("Preencha todos os campos");
        return;
    }

    // se produto já existe, somar quantidade
    const existente = produtos.find(p => p.nome.toLowerCase() === nome.toLowerCase());
    if (existente) {
        existente.quantidade = Number(existente.quantidade) + quantidade;
    } else {
        produtos.push({ nome, quantidade });
    }

    totalEntradas += quantidade;
    registrarHistorico('entrada', nome, quantidade);
    saveProducts();
    atualizarTabela();

    document.getElementById("nomeProduto").value = "";
    document.getElementById("quantidadeProduto").value = "";
}

// Atualiza a tabela de produtos na interface com as quantidades atuais
function atualizarTabela() {

    const tabela =
        document.getElementById("tabelaProdutos");

    tabela.innerHTML = "";

    produtos.forEach((produto, index) => {
        // Personalizando botão 'Baixa' e 'Remover' (classe e ícone)
        tabela.innerHTML += `
            <tr>
                <td>${produto.nome}</td>
                <td>${produto.quantidade}</td>
                <td>
                    <div class="action-btns">
                        <button onclick="darBaixa(${index})" class="btn-action-custom btn-baixa"><span class="icon">↓</span><span>Baixa</span></button>
                        <button onclick="removerProduto(${index})" class="btn-action-custom btn-remover"><span class="icon">✖</span><span>Remover</span></button>
                    </div>
                </td>
            </tr>
        `;
    });

    document.getElementById("totalProdutos").innerText = getTotalEstoque();
    document.getElementById("totalEntradas").innerText = totalEntradas;
    document.getElementById("totalSaidas").innerText = totalSaidas;
}

// Calcula o total em estoque somando todas as quantidades
function getTotalEstoque() {
    return produtos.reduce((sum, produto) => sum + Number(produto.quantidade), 0);
}

// Faz baixa de um item decrementando quantidade e registrando saída
function darBaixa(index) {
    if (index < 0 || index >= produtos.length) return;
    const produto = produtos[index];
    const dec = 1; // decremento padrão
    produto.quantidade = Number(produto.quantidade) - dec;
    totalSaidas += dec;
    registrarHistorico('saida', produto.nome, dec);
    if (produto.quantidade <= 0) {
        produtos.splice(index, 1);
    }
    saveProducts();
    atualizarTabela();
}

// Remove completamente um produto do estoque e registra a saída total
function removerProduto(index) {
    if (index < 0 || index >= produtos.length) return;
    if (confirm('Remover este produto do estoque?')) {
        const produto = produtos[index];
        const qtd = Number(produto.quantidade);
        totalSaidas += qtd;
        registrarHistorico('saida', produto.nome, qtd);
        produtos.splice(index, 1);
        saveProducts();
        atualizarTabela();
    }
}

// Histórico de movimentações: entradas e saídas
function registrarHistorico(tipo, nome, quantidade) {
    const item = {
        timestamp: new Date().toISOString(),
        usuario: currentUser || 'desconhecido',
        tipo,
        produto: nome,
        quantidade: Number(quantidade)
    };
    historico.unshift(item); // mais recente primeiro
    // manter histórico razoável (ex: 500 entradas)
    if (historico.length > 500) historico.pop();
    saveProducts();
}

// Preenche a tabela de histórico com os registros salvos
function atualizarHistorico() {
    const tbody = document.getElementById('historicoTabela');
    if (!tbody) return;
    tbody.innerHTML = '';
    historico.forEach(h => {
        const row = `<tr>
            <td>${new Date(h.timestamp).toLocaleString()}</td>
            <td>${h.usuario}</td>
            <td>${h.tipo}</td>
            <td>${h.produto}</td>
            <td>${h.quantidade}</td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

// Mostra ou esconde o painel de histórico
function toggleHistorico() {
    const sec = document.getElementById('historicoSection');
    const relatorios = document.getElementById('relatoriosSection');
    if (!sec) return;
    if (relatorios) relatorios.classList.add('hidden');
    sec.classList.toggle('hidden');
    if (!sec.classList.contains('hidden')) atualizarHistorico();
}

// Filtra a lista de produtos cadastrados pelo nome digitado pelo usuário
function pesquisarProduto() {

    const filtro =
        document.getElementById("pesquisa")
        .value
        .toLowerCase();

    const linhas =
        document.querySelectorAll("#tabelaProdutos tr");

    linhas.forEach(linha => {

        const nome =
            linha.children[0]
            .innerText
            .toLowerCase();

        linha.style.display =
            nome.includes(filtro)
                ? ""
                : "none";
    });
}