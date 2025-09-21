// Seleciona o ícone do hamburger e o menu de navegação
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

// Adiciona um "escutador de eventos" para o clique no hamburger
hamburger.addEventListener("click", () => {
    // Alterna a classe 'active' no hamburger (para animação, se houver)
    hamburger.classList.toggle("active");
    // Alterna a classe 'active' no menu, que o faz aparecer/desaparecer
    navMenu.classList.toggle("active");
});

// Fecha o menu quando um link é clicado (útil em one-page sites)
document.querySelectorAll(".nav-link").forEach(n => n.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
}));