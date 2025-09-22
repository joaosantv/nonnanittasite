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

    // --- LÓGICA DO MODAL DE FEEDBACK ---
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
        modal.addEventListener('click', (e) => {
            if(e.target === modal) {
                fecharModal();
            }
        });
    }

    // --- LÓGICA DE ENVIO DOS FORMULÁRIOS (ATUALIZADA) ---
    const formReserva = document.querySelector('.form-reserva');
    const formPedido = document.querySelector('.form-pedido');

    if (formReserva) {
        formReserva.addEventListener('submit', async (event) => {
            event.preventDefault(); // Impede o envio padrão da página
            const formData = new FormData(formReserva);
            
            try {
                const response = await fetch(formReserva.action, {
                    method: 'POST',
                    body: new URLSearchParams(formData)
                });

                if (response.ok) {
                    abrirModal('Solicitação Recebida!', 'Sua solicitação de reserva foi enviada. Iremos analisar a disponibilidade e entraremos em contato via WhatsApp para confirmar.');
                    formReserva.reset(); // Limpa o formulário
                } else {
                    const errorData = await response.json();
                    abrirModal('Ops! Horário Esgotado', errorData.message || 'Não foi possível completar sua reserva. Tente novamente.');
                }
            } catch (error) {
                abrirModal('Erro de Conexão', 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.');
            }
        });
    }

    if (formPedido) {
        formPedido.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            // Preenche os campos escondidos do carrinho antes de enviar
            const itensPedidoInput = document.getElementById('itens-pedido');
            const totalPedidoInput = document.getElementById('total-pedido');
            let itensTexto = '';
            for (const id in carrinho) {
                const item = carrinho[id];
                itensTexto += `${item.qtd}x ${item.nome}\n`;
            }
            itensPedidoInput.value = itensTexto.trim();
            totalPedidoInput.value = `R$ ${carrinhoTotalEl.textContent}`;

            const formData = new FormData(formPedido);
            
            try {
                const response = await fetch(formPedido.action, {
                    method: 'POST',
                    body: new URLSearchParams(formData)
                });

                if (response.ok) {
                    abrirModal('Pedido Enviado!', 'Seu pedido foi enviado para a cafeteria. Iremos analisá-lo e entraremos em contato via WhatsApp para confirmar a retirada.');
                    formPedido.reset(); // Limpa o formulário
                    // Limpa o carrinho visual
                    for (const id in carrinho) { delete carrinho[id]; }
                    atualizarCarrinho();
                } else {
                    abrirModal('Ops! Algo deu errado', 'Não foi possível completar seu pedido. Tente novamente.');
                }
            } catch (error) {
                abrirModal('Erro de Conexão', 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.');
            }
        });
    }
});

