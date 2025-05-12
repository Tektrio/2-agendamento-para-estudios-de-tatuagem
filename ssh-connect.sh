#!/bin/bash

# Esse script configura uma sessão SSH compartilhável usando tmate
# tmate é uma ferramenta que permite acesso SSH remoto sem necessidade
# de configurar um servidor SSH completo

echo "==============================================="
echo "Configurando acesso SSH via tmate"
echo "==============================================="

# Verifica se o tmate está disponível
if ! command -v tmate &> /dev/null
then
    echo "tmate não encontrado. Instalando..."
    echo "Isso pode levar alguns minutos..."
    apt-get update && apt-get install -y tmate openssh-client
fi

# Se um socket tmate já existir, mata-o
if [ -e ~/.tmate.sock ]; then
    echo "Sessão tmate anterior encontrada. Reiniciando..."
    pkill -f tmate || true
    rm -f ~/.tmate.sock
fi

# Criar pasta .ssh se não existir
mkdir -p ~/.ssh

# Gerar nova chave SSH se necessário
if [ ! -f ~/.ssh/id_rsa ]; then
    echo "Gerando nova chave SSH..."
    ssh-keygen -t rsa -b 4096 -N "" -f ~/.ssh/id_rsa
fi

# Iniciar nova sessão tmate
echo "Iniciando sessão tmate..."
tmate -S ~/.tmate.sock new-session -d
tmate -S ~/.tmate.sock wait tmate-ready

# Obter links de conexão
SSH_CMD=$(tmate -S ~/.tmate.sock display -p '#{tmate_ssh}')
WEB_URL=$(tmate -S ~/.tmate.sock display -p '#{tmate_web}')

# Exibir informações de conexão
echo ""
echo "==============================================="
echo "🔑 INFORMAÇÕES DE CONEXÃO SSH"
echo "==============================================="
echo ""
echo "Sessão tmate iniciada com sucesso!"
echo ""
echo "Comando SSH para conexão:"
echo "$SSH_CMD"
echo ""
echo "URL para acesso via web:"
echo "$WEB_URL"
echo ""
echo "==============================================="
echo "IMPORTANTE: Estas credenciais expiram quando o script é encerrado."
echo "Mantenha este terminal aberto enquanto precisa de acesso SSH."
echo "==============================================="

# Salvar informações em um arquivo
echo "Salvando informações de conexão em ssh-info.txt..."
cat > ssh-info.txt << EOF
# Informações de Conexão SSH via tmate
# Geradas em: $(date)

## Comando SSH para conexão:
$SSH_CMD

## URL para acesso via web:
$WEB_URL

IMPORTANTE: Estas credenciais expiram quando a sessão tmate é encerrada.
EOF

echo "Informações salvas em ssh-info.txt"
echo ""
echo "Pressione Ctrl+C para encerrar a sessão quando terminar."
echo ""

# Manter o script rodando
while true; do
    sleep 60
    echo "Sessão tmate ativa. Pressione Ctrl+C para encerrar."
done