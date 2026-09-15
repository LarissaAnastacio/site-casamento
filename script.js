const TELEGRAM_BOT_TOKEN = "8974321602:AAEDLXL5-zfCamNPc-ShVJq_vCUnjkWrm0M";
const TELEGRAM_CHAT_ID = "6051277135";

function enviarWhatsApp(e) {
    e.preventDefault();

    // Configure o número com DDI (55 para Brasil) + DDD + Número (apenas dígitos)
    const numeroWhatsApp = "5511961776919"; // Substitua pelo número correto

    const nome = document.getElementById('nome').value.trim();
    const statusPresenca = document.getElementById('confirmacao').value;
    const acompanhantes = parseInt(document.getElementById('acompanhantes').value, 10);

    // Validação básica de preenchimento
    if (!nome || !statusPresenca || isNaN(acompanhantes)) {
        alert("Por favor, preencha todos os campos do formulário.");
        return;
    }

    // Formatação condicional de acompanhantes
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

    // Montagem da mensagem estruturada
    const mensagem = 
`Olá! Gostaria de confirmar minha presença no casamento de Regina & Marina 💍✨

📌 *Nome:* ${nome}
📌 *Presença:* ${statusPresenca}
📌 *Acompanhantes:* ${textoAcompanhantes}`;

    // Redirecionamento universal (compatível com mobile e web)
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
    window.open(urlWhatsApp, '_blank');
}

document.addEventListener('DOMContentLoaded', () => {
    const mediaForm = document.getElementById('mediaForm');
    if (mediaForm) {
        mediaForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const btn = document.getElementById('btnEnviar');
            const statusMsg = document.getElementById('statusMsg');
            const nome = document.getElementById('nomeConvidado').value;
            const fileInput = document.getElementById('midiaInput');
            const file = fileInput.files ? fileInput.files[0] : null;

            if (!file) {
                statusMsg.style.color = 'red';
                statusMsg.innerText = "⚠️ Por favor, selecione ou tire uma foto/vídeo antes de enviar!";
                return;
            }

            if (file.size > 45 * 1024 * 1024) {
                statusMsg.style.color = 'red';
                statusMsg.innerText = "⚠️ O arquivo é muito grande! Escolha um arquivo menor que 45MB.";
                return;
            }

            btn.disabled = true;
            statusMsg.style.color = '#333';
            statusMsg.innerText = "Processando e enviando arquivo, aguarde...";

            try {
                const fileArrayBuffer = await file.arrayBuffer();
                const cleanBlob = new Blob([fileArrayBuffer], { type: file.type || 'image/jpeg' });

                const formData = new FormData();
                formData.append('chat_id', TELEGRAM_CHAT_ID);
                formData.append('caption', `📷 Nova Mídia do Casamento!\n👤 De: ${nome}`);

                const fileName = file.name || 'midia_casamento.jpg';
                let endpoint = 'sendDocument';

                if (file.type.startsWith('image/') || fileName.toLowerCase().match(/\.(jpg|jpeg|png|heic|webp)$/)) {
                    if (file.size > 10 * 1024 * 1024) {
                        endpoint = 'sendDocument';
                        formData.append('document', cleanBlob, fileName);
                    } else {
                        endpoint = 'sendPhoto';
                        formData.append('photo', cleanBlob, fileName);
                    }
                } else if (file.type.startsWith('video/') || fileName.toLowerCase().match(/\.(mp4|mov|m4v)$/)) {
                    endpoint = 'sendVideo';
                    formData.append('video', cleanBlob, fileName);
                } else {
                    formData.append('document', cleanBlob, fileName);
                }

                const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${endpoint}`, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.ok) {
                    statusMsg.style.color = 'green';
                    statusMsg.innerText = "✅ Mídia enviada com sucesso! Muito obrigado!";
                    mediaForm.reset();
                } else {
                    throw new Error(result.description || "Falha na resposta do Telegram.");
                }
            } catch (error) {
                statusMsg.style.color = 'red';
                statusMsg.innerText = "❌ Erro ao enviar: " + (error.message || "Tente novamente.");
            } finally {
                btn.disabled = false;
            }
        });
    }
});
