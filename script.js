// ================= CONFIGURAÇÃO DO CASAMENTO =================
const CLOUD_NAME = "casamento-regina-marina"; 
const UPLOAD_PRESET = "casamento-regina-marina"; 
const NUMERO_WHATSAPP = "5511961776919"; 
// Data do casamento: 2 de Maio de 2027 às 16:00 (horário de Brasília)
const DATA_CASAMENTO = new Date("2027-05-02T16:00:00-03:00").getTime();
// =============================================================

// 1. Contagem Regressiva Automática
function atualizarContagemRegressiva() {
    const agora = new Date().getTime();
    const diferenca = DATA_CASAMENTO - agora;

    const elDias = document.getElementById("days");
    const elHoras = document.getElementById("hours");
    const elMinutos = document.getElementById("minutes");
    const elSegundos = document.getElementById("seconds");

    if (!elDias || !elHoras || !elMinutos || !elSegundos) return;

    if (diferenca <= 0) {
        elDias.innerText = "00";
        elHoras.innerText = "00";
        elMinutos.innerText = "00";
        elSegundos.innerText = "00";
        return;
    }

    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

    elDias.innerText = String(dias).padStart(2, '0');
    elHoras.innerText = String(horas).padStart(2, '0');
    elMinutos.innerText = String(minutos).padStart(2, '0');
    elSegundos.innerText = String(segundos).padStart(2, '0');
}

// Inicia a contagem de imediato e atualiza a cada 1 segundo
setInterval(atualizarContagemRegressiva, 1000);
atualizarContagemRegressiva();

// 2. Confirmação de Presença via WhatsApp (RSVP)
function iniciarEnvioWhatsApp(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    const nomeInput = document.getElementById('nome');
    const confirmacaoInput = document.getElementById('confirmacao');
    const acompanhantesInput = document.getElementById('acompanhantes');

    const nome = nomeInput ? nomeInput.value.trim() : "";
    const statusPresenca = confirmacaoInput ? confirmacaoInput.value : "";
    const acompanhantes = acompanhantesInput ? parseInt(acompanhantesInput.value, 10) : 0;

    if (!nome) {
        alert("Por favor, preencha o seu nome completo.");
        if (nomeInput) nomeInput.focus();
        return false;
    }

    if (!statusPresenca) {
        alert("Por favor, selecione se irá comparecer ao evento.");
        if (confirmacaoInput) confirmacaoInput.focus();
        return false;
    }

    let textoAcompanhantes = "";
    if (statusPresenca === "Sim, com certeza!") {
        if (acompanhantes === 0) {
            textoAcompanhantes = "Irei sozinho(a).";
        } else if (acompanhantes === 1) {
            textoAcompanhantes = "Levarei 1 acompanhante.";
        } else {
            textoAcompanhantes = `Levarei ${acompanhantes} acompanhantes.`;
        }
    } else {
        textoAcompanhantes = "Não se aplica (ausente).";
    }

    const mensagem = 
`Olá! Gostaria de confirmar minha presença no casamento de Regina & Marina 💍✨

📌 *Nome:* ${nome}
📌 *Presença:* ${statusPresenca}
📌 *Acompanhantes:* ${textoAcompanhantes}`;

    const urlDestino = `https://api.whatsapp.com/send?phone=${NUMERO_WHATSAPP}&text=${encodeURIComponent(mensagem)}`;

    // Abertura compatível com Android, iOS e Computador
    const link = document.createElement('a');
    link.href = urlDestino;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return false;
}

// 3. Upload de Fotos e Vídeos (Cloudinary)
async function realizarUploadMidia(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    const btn = document.getElementById('btnEnviar');
    const statusMsg = document.getElementById('statusMsg');
    const progressArea = document.getElementById('progressArea');
    const progressStatus = document.getElementById('progressStatus');
    const progressBarFill = document.getElementById('progressBarFill');
    const nomeInput = document.getElementById('nomeConvidado');
    const fileInput = document.getElementById('midiaInput');

    const nome = nomeInput ? nomeInput.value.trim() : "";
    const files = fileInput ? fileInput.files : null;

    if (!nome) {
        alert("Por favor, preencha o seu nome completo antes de enviar.");
        if (nomeInput) nomeInput.focus();
        return false;
    }

    if (!files || files.length === 0) {
        alert("Por favor, selecione ao menos uma foto ou vídeo da galeria.");
        return false;
    }

    if (btn) btn.disabled = true;
    if (progressArea) progressArea.style.display = 'block';
    if (statusMsg) {
        statusMsg.style.color = "#333";
        statusMsg.innerText = "Iniciando upload...";
    }
    if (progressBarFill) progressBarFill.style.width = "0%";

    let enviadosComSucesso = 0;
    const total = files.length;
    let ultimoErro = "";

    for (let i = 0; i < total; i++) {
        const file = files[i];
        if (progressStatus) progressStatus.innerText = `Enviando ${i + 1} de ${total}: ${file.name}...`;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET.trim());
        formData.append('tags', `casamento,de_${nome.replace(/\s+/g, '_')}`);

        try {
            const cleanCloud = CLOUD_NAME.trim();
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cleanCloud}/auto/upload`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error?.message || "Erro no envio");
            }

            enviadosComSucesso++;
        } catch (err) {
            console.error("Falha no envio:", err);
            ultimoErro = err.message;
        }

        if (progressBarFill) {
            const percentagem = Math.round(((i + 1) / total) * 100);
            progressBarFill.style.width = `${percentagem}%`;
        }
    }

    if (btn) btn.disabled = false;

    if (enviadosComSucesso === total) {
        if (statusMsg) {
            statusMsg.style.color = "#15803d";
            statusMsg.innerText = `✅ ${enviadosComSucesso} ficheiro(s) enviado(s) com sucesso! Muito obrigado!`;
        }
        if (progressStatus) progressStatus.innerText = "Concluído!";
        if (nomeInput) nomeInput.value = "";
        if (fileInput) fileInput.value = "";
    } else if (enviadosComSucesso > 0) {
        if (statusMsg) {
            statusMsg.style.color = "#d97706";
            statusMsg.innerText = `⚠️ Enviados ${enviadosComSucesso} de ${total}. Erro: ${ultimoErro}`;
        }
    } else {
        if (statusMsg) {
            statusMsg.style.color = "#dc2626";
            statusMsg.innerText = `❌ Falha ao enviar: ${ultimoErro}`;
        }
    }

    return false;
}