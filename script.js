// ================= CONFIGURAÇÃO DO CASAMENTO =================
// 1. Verifique o nome completo no painel do Cloudinary (sem as reticências "...")
const CLOUD_NAME = "casamento-regina-marina"; 

// 2. Coloque aqui o nome exato do preset que você salvou como Unsigned
const UPLOAD_PRESET = "casamento-regina-marina"; 

// 3. Número de WhatsApp dos noivos (DDI + DDD + Telefone)
const NUMERO_WHATSAPP = "5511999999999"; 
// =============================================================

// Confirmação de Presença via WhatsApp (RSVP)
function enviarWhatsApp(e) {
    e.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const statusPresenca = document.getElementById('confirmacao').value;
    const acompanhantes = parseInt(document.getElementById('acompanhantes').value, 10);

    if (!nome || !statusPresenca || isNaN(acompanhantes)) {
        alert("Por favor, preencha todos os campos do formulário.");
        return;
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

    const urlWhatsApp = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
    window.open(urlWhatsApp, '_blank');
}

// Upload de Fotos e Vídeos (Cloudinary)
document.addEventListener('DOMContentLoaded', () => {
    const mediaForm = document.getElementById('mediaForm');

    if (mediaForm) {
        mediaForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const btn = document.getElementById('btnEnviar');
            const statusMsg = document.getElementById('statusMsg');
            const progressArea = document.getElementById('progressArea');
            const progressStatus = document.getElementById('progressStatus');
            const progressBarFill = document.getElementById('progressBarFill');
            const nomeInput = document.getElementById('nomeConvidado');
            const nome = nomeInput ? nomeInput.value.trim() : "Convidado";
            const fileInput = document.getElementById('midiaInput');
            const files = fileInput.files;

            if (!files || files.length === 0) {
                statusMsg.style.color = "#dc2626";
                statusMsg.innerText = "⚠️ Por favor, selecione ao menos um arquivo.";
                return;
            }

            btn.disabled = true;
            if (progressArea) progressArea.style.display = 'block';
            statusMsg.style.color = "#333";
            statusMsg.innerText = "Iniciando upload...";
            if (progressBarFill) progressBarFill.style.width = "0%";

            let enviadosComSucesso = 0;
            const total = files.length;
            let ultimoErro = "";

            for (let i = 0; i < total; i++) {
                const file = files[i];
                if (progressStatus) progressStatus.innerText = `Enviando ${i + 1} de ${total}: ${file.name}...`;

                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', UPLOAD_PRESET);
                formData.append('tags', `casamento,de_${nome.replace(/\s+/g, '_')}`);

                try {
                    // Endpoint genérico 'auto' que aceita fotos, vídeos e formatos de iPhone (.heic / .mov)
                    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
                        method: 'POST',
                        body: formData
                    });

                    const result = await response.json();

                    if (!response.ok) {
                        throw new Error(result.error?.message || "Erro no envio");
                    }

                    enviadosComSucesso++;
                } catch (err) {
                    console.error("Falha detalhada:", err);
                    ultimoErro = err.message;
                }

                if (progressBarFill) {
                    const porcentagem = Math.round(((i + 1) / total) * 100);
                    progressBarFill.style.width = `${porcentagem}%`;
                }
            }

            btn.disabled = false;

            if (enviadosComSucesso === total) {
                statusMsg.style.color = "#15803d";
                statusMsg.innerText = `✅ ${enviadosComSucesso} arquivo(s) enviado(s) com sucesso! Muito obrigado!`;
                if (progressStatus) progressStatus.innerText = "Concluído!";
                mediaForm.reset();
            } else if (enviadosComSucesso > 0) {
                statusMsg.style.color = "#d97706";
                statusMsg.innerText = `⚠️ Enviados ${enviadosComSucesso} de ${total}. Último erro: ${ultimoErro}`;
            } else {
                statusMsg.style.color = "#dc2626";
                statusMsg.innerText = `❌ Falha ao enviar: ${ultimoErro}`;
            }
        });
    }
});