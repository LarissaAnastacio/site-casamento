// ================= CONFIGURAÇÃO DO CASAMENTO =================
const CLOUD_NAME = "casamento-regina-marina"; 
const UPLOAD_PRESET = "casamento-regina-marina"; 
const NUMERO_WHATSAPP = "5511961776919"; 
// =============================================================

// Confirmação de Presença via WhatsApp (RSVP)
function enviarWhatsApp(e) {
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
        alert("Por favor, selecione se você irá ao evento.");
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

    // Mensagem limpa sem quebra de caracteres
    const mensagem = 
`Ola! Gostaria de confirmar minha presenca no casamento de Regina & Marina! 💍✨

*Nome:* ${nome}
*Presenca:* ${statusPresenca}
*Acompanhantes:* ${textoAcompanhantes}`;

    const textoCodificado = encodeURIComponent(mensagem);

    // Detecta se é celular (Android / iOS)
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
        // No celular, abre o app nativo do WhatsApp instantaneamente
        window.location.href = `whatsapp://send?phone=${NUMERO_WHATSAPP}&text=${textoCodificado}`;
    } else {
        // No computador, abre o WhatsApp Web direto em uma nova aba
        window.open(`https://web.whatsapp.com/send?phone=${NUMERO_WHATSAPP}&text=${textoCodificado}`, '_blank');
    }

    return false;
}

// Upload de Fotos e Vídeos (Cloudinary)
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
                throw new Error(result.error?.message || "Erro retornado pelo servidor");
            }

            enviadosComSucesso++;
        } catch (err) {
            console.error("Falha no upload:", err);
            ultimoErro = err.message;
        }

        if (progressBarFill) {
            const porcentagem = Math.round(((i + 1) / total) * 100);
            progressBarFill.style.width = `${porcentagem}%`;
        }
    }

    if (btn) btn.disabled = false;

    if (enviadosComSucesso === total) {
        if (statusMsg) {
            statusMsg.style.color = "#15803d";
            statusMsg.innerText = `✅ ${enviadosComSucesso} arquivo(s) enviado(s) com sucesso! Muito obrigado!`;
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

// Vincula o evento caso o formulário ainda use a chamada clássica
document.addEventListener('DOMContentLoaded', () => {
    const mediaForm = document.getElementById('mediaForm');
    if (mediaForm) {
        mediaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            realizarUploadMidia(e);
        });
    }
});