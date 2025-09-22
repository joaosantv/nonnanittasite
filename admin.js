
// --- Executa quando o HTML da página terminar de carregar ---
document.addEventListener('DOMContentLoaded', () => {

    const loginContainer = document.getElementById('login-container');
    const dashboardContainer = document.getElementById('dashboard-container');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const loginError = document.getElementById('login-error');

    // A URL do nosso backend, que agora controla o acesso
    const URL_BACKEND = 'https://nonnanitta.onrender.com';

    // --- LÓGICA DE LOGIN E LOGOUT (ATUALIZADA E SEGURA) ---

    // Verifica se o usuário já está "logado" (usando sessionStorage)
    if (sessionStorage.getItem('adminLogado') === 'true') {
        mostrarDashboard();
    } else {
        mostrarLogin();
    }

    // A mágica acontece aqui:
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        loginError.textContent = ''; // Limpa erros antigos
        const password = document.getElementById('password').value;
        const submitButton = loginForm.querySelector('button');
        submitButton.disabled = true;
        submitButton.textContent = 'Verificando...';

        try {
            // Envia a senha para o backend para verificação
            const response = await fetch(`${URL_BACKEND}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password: password })
            });

            if (response.ok) {
                // Se o backend respondeu "OK", o login foi um sucesso
                sessionStorage.setItem('adminLogado', 'true');
                mostrarDashboard();
            } else {
                // Se o backend respondeu com erro, a senha está errada
                loginError.textContent = 'Senha incorreta. Tente novamente.';
            }
        } catch (error) {
            loginError.textContent = 'Erro de conexão com o servidor.';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Entrar';
        }
    });

    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('adminLogado');
        mostrarLogin();
    });

    function mostrarLogin() {
        loginContainer.classList.remove('hidden');
        dashboardContainer.classList.add('hidden');
    }

    function mostrarDashboard() {
        loginContainer.classList.add('hidden');
        dashboardContainer.classList.remove('hidden');
        carregarDados();
    }

    // --- LÓGICA PARA CARREGAR E EXIBIR OS DADOS ---

    async function carregarDados() {
        // Agora esta função só é chamada se o login for bem-sucedido
        try {
            const response = await fetch(`${URL_BACKEND}/admin/dados`);
            if (!response.ok) {
                throw new Error('Não foi possível carregar os dados.');
            }
            const { reservas, pedidos } = await response.json();
            
            renderizarTabela(pedidos, 'pedidos-table', ['Nome', 'Telefone', 'Itens do Pedido', 'Total do Pedido', 'Hora de Retirada', 'status']);
            renderizarTabela(reservas, 'reservas-table', ['Nome', 'Telefone', 'Data da Reserva', 'Hora da Reserva', 'Numero de Pessoas', 'status']);
            renderizarGrafico(pedidos);

        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            alert('Não foi possível carregar os dados do servidor.');
        }
    }

    function renderizarTabela(dados, tableId, colunas) {
        const tableBody = document.querySelector(`#${tableId} tbody`);
        tableBody.innerHTML = ''; // Limpa a tabela

        // .sort() para ordenar por data de recebimento, dos mais recentes para os mais antigos
        dados.sort((a, b) => new Date(b.data_recebimento) - new Date(a.data_recebimento));

        dados.forEach(item => {
            const row = tableBody.insertRow();
            colunas.forEach(coluna => {
                const cell = row.insertCell();
                let valor = item[coluna] || '—';

                // Formatação especial para a coluna de status
                if (coluna === 'status') {
                    cell.innerHTML = `<span class="status ${valor.toLowerCase()}">${valor}</span>`;
                } else {
                    cell.textContent = valor;
                }
            });
        });
    }

    function renderizarGrafico(pedidos) {
        // Verifica se o elemento canvas existe antes de tentar usá-lo
        const canvas = document.getElementById('pedidosChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Processa os dados para o gráfico
        const pedidosPorDia = pedidos.reduce((acc, pedido) => {
            const data = new Date(pedido.data_recebimento || Date.now()).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit'});
            acc[data] = (acc[data] || 0) + 1;
            return acc;
        }, {});

        const labels = Object.keys(pedidosPorDia).reverse(); // .reverse() para mostrar as datas mais recentes no final
        const data = Object.values(pedidosPorDia).reverse();

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '# de Pedidos por Dia',
                    data: data,
                    backgroundColor: 'rgba(111, 78, 55, 0.5)',
                    borderColor: 'rgba(111, 78, 55, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1 // Garante que o eixo Y conte de 1 em 1
                        }
                    }
                }
            }
        });
    }
});

