// --- Executa o código quando o HTML da página terminar de carregar ---
document.addEventListener('DOMContentLoaded', () => {

    // --- LÓGICA DO MENU HAMBÚRGUER (CELULAR) ---
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");

    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
        });
        document.querySelectorAll(".nav-link").forEach(n => n.addEventListener("click", () => {
            hamburger.classList.remove("active");
            navMenu.classList.remove("active");
        }));
    }

    // --- LÓGICA DO CARRINHO DE COMPRAS ---
    const carrinho = {}; 
    const botoesAdicionar = document.querySelectorAll('.btn-add');
    const carrinhoItemsContainer = document.getElementById('carrinho-items');
    const carrinhoTotalEl = document.getElementById('carrinho-total-valor');
    const carrinhoVazioEl = document.querySelector('.carrinho-vazio');

    function atualizarCarrinho() {
        if (!carrinhoItemsContainer || !carrinhoTotalEl) return;
        carrinhoItemsContainer.innerHTML = ''; 
        let total = 0;
        let temItens = false;
        for (const id in carrinho) {
            temItens = true;
            const item = carrinho[id];
            total += item.preco * item.qtd;
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('carrinho-item');
            itemDiv.innerHTML = `<span>${item.qtd}x ${item.nome}</span><span>R$ ${(item.preco * item.qtd).toFixed(2).replace('.', ',')}</span>`;
            carrinhoItemsContainer.appendChild(itemDiv);
        }
        if (carrinhoVazioEl) {
            carrinhoVazioEl.style.display = temItens ? 'none' : 'block';
        }
        carrinhoTotalEl.textContent = total.toFixed(2).replace('.', ',');
    }

    botoesAdicionar.forEach(botao => {
        botao.addEventListener('click', () => {
            const id = botao.dataset.id;
            const nome = botao.dataset.nome;
            const preco = parseFloat(botao.dataset.preco);
            if (carrinho[id]) {
                carrinho[id].qtd++;
            } else {
                carrinho[id] = { nome, preco, qtd: 1 };
            }
            atualizarCarrinho();
        });
    });

    const formPedido = document.querySelector('.form-pedido');
    if (formPedido) {
        formPedido.addEventListener('submit', () => {
            const itensPedidoInput = document.getElementById('itens-pedido');
            const totalPedidoInput = document.getElementById('total-pedido');
            let itensTexto = '';
            for (const id in carrinho) {
                const item = carrinho[id];
                itensTexto += `${item.qtd}x ${item.nome}\n`;
            }
            itensPedidoInput.value = itensTexto.trim();
            totalPedidoInput.value = `R$ ${carrinhoTotalEl.textContent}`;
        });
    }

    // --- NOVA LÓGICA DO MODAL DE FEEDBACK ---
    const modal = document.getElementById('modal-feedback');
    const modalTitulo = document.getElementById('modal-titulo');
    const modalMensagem = document.getElementById('modal-mensagem');
    const modalFechar = document.getElementById('modal-fechar');

    function abrirModal(titulo, mensagem) {
        if(modal && modalTitulo && modalMensagem) {
            modalTitulo.textContent = titulo;
            modalMensagem.textContent = mensagem;
            modal.classList.add('ativo');
        }
    }

    function fecharModal() {
        if(modal) {
            modal.classList.remove('ativo');
        }
    }

    if(modalFechar) {
        modalFechar.addEventListener('click', fecharModal);
    }
    if(modal){
        // Fecha o modal se o usuário clicar fora da caixa de conteúdo
        modal.addEventListener('click', (e) => {
            if(e.target === modal) {
                fecharModal();
            }
        });
    }

    // Função que lê a URL e decide se deve mostrar o modal
    function mostrarFeedback() {
        const urlParams = new URLSearchParams(window.location.search);
        const feedbackReserva = urlParams.get('reserva');
        const feedbackPedido = urlParams.get('pedido');

        if (feedbackReserva) {
            if (feedbackReserva === 'sucesso') {
                abrirModal('Solicitação Recebida!', 'A sua solicitação de reserva foi enviada. Iremos analisar a disponibilidade e entraremos em contacto via WhatsApp para confirmar.');
            } else if (feedbackReserva === 'erro') {
                abrirModal('Ops! Horário Esgotado', 'Desculpe, não há mais vagas para este horário. Por favor, tente outro.');
            }
        }

        if (feedbackPedido) {
            if (feedbackPedido === 'sucesso') {
                abrirModal('Pedido Enviado!', 'O seu pedido foi enviado para a cafetaria. Iremos analisá-lo e entraremos em contacto via WhatsApp para confirmar a retirada.');
            }
        }
        
        // Limpa os parâmetros da URL para o modal não reaparecer ao recarregar a página
        if(feedbackPedido || feedbackReserva){
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    // Chama a função de feedback assim que a página é carregada
    mostrarFeedback();
});

