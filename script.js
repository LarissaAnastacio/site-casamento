// ==========================================
// 1. DATA DO CASAMENTO (Ano, Mês - 1, Dia, Hora, Minuto)
// Nota: Os meses no JavaScript vão de 0 a 11 (Maio = 4)
// Exemplo configurado: 15 de Maio de 2027 às 16:30
// ==========================================
const dataCasamento = new Date(2027, 4, 15, 16, 30, 0).getTime();

// Atualiza a contagem a cada 1 segundo
const timer = setInterval(function() {
    const agora = new Date().getTime();
    const distancia = dataCasamento - agora;

    const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((distancia % (1000 * 60)) / 1000);

    // Atualiza os elementos na tela se eles existirem
    if (document.getElementById("days")) {
        document.getElementById("days").innerText = dias < 10 ? "0" + dias : dias;
        document.getElementById("hours").innerText = horas < 10 ? "0" + horas : horas;
        document.getElementById("minutes").innerText = minutos < 10 ? "0" + minutos : minutos;
        document.getElementById("seconds").innerText = segundos < 10 ? "0" + segundos : segundos;
    }

    if (distancia < 0) {
        clearInterval(timer);
        const elementoCountdown = document.getElementById("countdown");
        if (elementoCountdown) {
            elementoCountdown.innerHTML = "<h3>Chegou o grande dia! 🎉</h3>";
        }
    }
}, 1000);

// ==========================================
// 2. ENVIO DE CONFIRMAÇÃO VIA WHATSAPP (RSVP)
// ==========================================
function enviarWhatsApp(event) {
    event.preventDefault();
    
    // Seu número configurado para receber as confirmações
    const numeroTelefone = "5511961776919"; 

    const nome = document.getElementById("nome").value;
    const confirmacao = document.getElementById("confirmacao").value;
    const acompanhantes = document.getElementById("acompanhantes").value;

    const mensagem = `Olá! Me chamo *${nome}*.\n*Confirmação:* ${confirmacao}\n*Acompanhantes:* ${acompanhantes}`;
    
    const url = `https://api.whatsapp.com/send?phone=${numeroTelefone}&text=${encodeURIComponent(mensagem)}`;
    
    window.open(url, "_blank");
}