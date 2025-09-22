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

    // --- LÓGICA DA GALERIA INTERATIVA (NOVA) ---
    const filtrosContainer = document.querySelector('.galeria-filtros');
    const galeriaItems = document.querySelectorAll('.cardapio-item');

    if (filtrosContainer && galeriaItems.length > 0) {
        filtrosContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('filtro-btn')) {
                // Remove a classe 'active' de todos os botões
                filtrosContainer.querySelector('.active').classList.remove('active');
                // Adiciona a classe 'active' ao botão clicado
                event.target.classList.add('active');

                const filtro = event.target.getAttribute('data-filter');

                galeriaItems.forEach(item => {
                    // Adiciona uma animação suave
                    item.style.transition = 'opacity 0.3s, transform 0.3s';
                    if (filtro === 'all' || item.classList.contains(filtro)) {
                        item.style.display = 'flex'; // Mostra o item
                        setTimeout(() => {
                           item.style.opacity = '1';
                           item.style.transform = 'scale(1)';
                        }, 10);
                    } else {
                        item.style.opacity = '0';
                        item.style.transform = 'scale(0.9)';
                        setTimeout(() => {
                           item.style.display = 'none'; // Esconde o item depois da animação
                        }, 300);
                    }
                });
            }
        });
    }

    // --- LÓGICA DO CARRINHO DE COMPRAS (ATUALIZADA) ---
    const carrinho = {}; 
    const botoesAdicionar = document.querySelectorAll('.btn-add');
    const carrinhoItemsContainer = document.getElementById('carrinho-items');
    const carrinhoTotalEl = document.getElementById('carrinho-total-valor');
    const carrinhoVazioEl = document.querySelector('.carrinho-vazio');
    const carrinhoFlutuanteBtn = document.getElementById('carrinho-flutuante');

    // Função para mostrar feedback "Toast"
    function mostrarToast(mensagem) {
        const toastExistente = document.querySelector('.toast');
        if (toastExistente) {
            toastExistente.remove();
        }
        const toast = document.createElement('div');
        toast.textContent = mensagem;
        toast.className = 'toast';
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Função para redesenhar o carrinho na tela
    function atualizarCarrinho() {
        if (!carrinhoItemsContainer || !carrinhoTotalEl) return;
        carrinhoItemsContainer.innerHTML = ''; 
        let total = 0;
        let totalItens = 0;
        for (const id in carrinho) {
            const item = carrinho[id];
            total += item.preco * item.qtd;
            totalItens += item.qtd;
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('carrinho-item');
            itemDiv.innerHTML = `<span>${item.qtd}x ${item.nome}</span><span>R$ ${(item.preco * item.qtd).toFixed(2).replace('.', ',')}<button class="btn-remover" data-id="${id}" title="Remover item">✖</button></span>`;
            carrinhoItemsContainer.appendChild(itemDiv);
        }
        if(carrinhoVazioEl) carrinhoVazioEl.style.display = totalItens > 0 ? 'none' : 'block';
        carrinhoTotalEl.textContent = total.toFixed(2).replace('.', ',');
        if (carrinhoFlutuanteBtn) {
            if (totalItens > 0) {
                carrinhoFlutuanteBtn.textContent = `🛒 Carrinho (${totalItens})`;
                carrinhoFlutuanteBtn.classList.add('visivel');
            } else {
                carrinhoFlutuanteBtn.classList.remove('visivel');
            }
        }
    }

    // Adiciona evento de clique para cada botão "Adicionar"
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
            mostrarToast(`${nome} adicionado ao carrinho!`);
            atualizarCarrinho();
        });
    });

    // Adiciona evento para remover itens
    if (carrinhoItemsContainer) {
        carrinhoItemsContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('btn-remover')) {
                const id = event.target.dataset.id;
                if (carrinho[id]) {
                    const nomeItem = carrinho[id].nome;
                    carrinho[id].qtd--;
                    if (carrinho[id].qtd === 0) {
                        delete carrinho[id];
                    }
                    mostrarToast(`${nomeItem} removido do carrinho.`);
                    atualizarCarrinho();
                }
            }
        });
    }

    // --- LÓGICA DE ENVIO DOS FORMULÁRIOS E MODAL ---
    const modal = document.getElementById('modal-feedback');
    const modalTitulo = document.getElementById('modal-titulo');
    const modalMensagem = document.getElementById('modal-mensagem');
    const modalFechar = document.getElementById('modal-fechar');
    const formReserva = document.querySelector('.form-reserva');
    const formPedido = document.querySelector('.form-pedido');

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

    if(modalFechar) { modalFechar.addEventListener('click', fecharModal); }
    if(modal) { modal.addEventListener('click', (e) => { if(e.target === modal) { fecharModal(); } }); }
    
    async function handleFormSubmit(event, form) {
        event.preventDefault();
        const formData = new FormData(form);
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new URLSearchParams(formData)
            });
            const responseData = await response.json();

            if (response.ok) {
                const isPedido = form.classList.contains('form-pedido');
                if (isPedido) {
                    abrirModal('Pedido Enviado!', 'Seu pedido foi enviado para a cafeteria. Iremos analisá-lo e entraremos em contato via WhatsApp para confirmar a retirada.');
                    for (const id in carrinho) { delete carrinho[id]; }
                    atualizarCarrinho();
                } else {
                    abrirModal('Solicitação Recebida!', 'Sua solicitação de reserva foi enviada. Iremos analisar a disponibilidade e entraremos em contato via WhatsApp para confirmar.');
                }
                form.reset();
            } else {
                abrirModal('Ops! Algo deu errado', responseData.message || 'Não foi possível completar sua solicitação. Tente novamente.');
            }
        } catch (error) {
            abrirModal('Erro de Conexão', 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = form.classList.contains('form-pedido') ? 'Enviar Pedido para Confirmação' : 'Solicitar Reserva';
        }
    }

    if (formReserva) {
        formReserva.addEventListener('submit', (e) => handleFormSubmit(e, formReserva));
    }

    if (formPedido) {
        formPedido.addEventListener('submit', (e) => {
            const itensPedidoInput = document.getElementById('itens-pedido');
            const totalPedidoInput = document.getElementById('total-pedido');
            let itensTexto = '';
            for (const id in carrinho) {
                const item = carrinho[id];
                itensTexto += `${item.qtd}x ${item.nome}\n`;
            }
            itensPedidoInput.value = itensTexto.trim();
            totalPedidoInput.value = `R$ ${carrinhoTotalEl.textContent}`;
            
            handleFormSubmit(e, formPedido);
        });
    }
});

