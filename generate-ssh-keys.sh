#!/bin/bash

# Script para gerar chaves SSH para uso com o aplicativo
# Essas chaves podem ser usadas para autenticação em servidores externos
# ou para acessar git repositories via SSH

echo "==============================================="
echo "Gerando chaves SSH para o aplicativo"
echo "==============================================="

# Verificar se a pasta .ssh existe
if [ ! -d ~/.ssh ]; then
  mkdir -p ~/.ssh
  chmod 700 ~/.ssh
fi

# Verificar se já existem chaves
if [ -f ~/.ssh/id_rsa ] && [ -f ~/.ssh/id_rsa.pub ]; then
  echo "Chaves SSH já existem."
  echo "Deseja substituí-las? (s/N)"
  read REPLACE
  
  if [ "$REPLACE" != "s" ] && [ "$REPLACE" != "S" ]; then
    echo "Usando chaves existentes."
    
    # Exibir a chave pública existente
    echo ""
    echo "Sua chave pública SSH (use-a para adicionar a servidores ou GitHub):"
    echo "-----------------------------------------------"
    cat ~/.ssh/id_rsa.pub
    echo "-----------------------------------------------"
    exit 0
  fi
fi

# Gerar novas chaves
echo "Gerando novas chaves SSH..."
ssh-keygen -t rsa -b 4096 -C "tattoo-studio-app@replit"

# Verificar se as chaves foram geradas com sucesso
if [ ! -f ~/.ssh/id_rsa ] || [ ! -f ~/.ssh/id_rsa.pub ]; then
  echo "Erro ao gerar chaves SSH!"
  exit 1
fi

# Ajustar permissões
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub

# Exibir a chave pública
echo ""
echo "Chaves SSH geradas com sucesso!"
echo ""
echo "Sua chave pública SSH (use-a para adicionar a servidores ou GitHub):"
echo "-----------------------------------------------"
cat ~/.ssh/id_rsa.pub
echo "-----------------------------------------------"

# Salvar a chave pública em um arquivo para referência futura
cat ~/.ssh/id_rsa.pub > ~/ssh-pubkey.txt
echo "Chave pública salva em ~/ssh-pubkey.txt"

# Instruções
echo ""
echo "Para usar essa chave SSH com GitHub:"
echo "1. Vá para Settings > SSH and GPG keys > New SSH key"
echo "2. Cole a chave pública exibida acima"
echo ""
echo "Para usar essa chave com um servidor remoto:"
echo "1. Execute: ssh-copy-id -i ~/.ssh/id_rsa.pub usuario@servidor"
echo "   Ou adicione manualmente a chave pública ao arquivo ~/.ssh/authorized_keys no servidor"
echo ""
echo "Para testar a conexão:"
echo "ssh -i ~/.ssh/id_rsa usuario@servidor"
echo ""

# Criar arquivo de configuração SSH
echo "Criando arquivo de configuração SSH..."
cat > ~/.ssh/config << EOF
# Configuração SSH para o aplicativo de estúdio de tatuagem

# Configuração padrão para todos os hosts
Host *
  ServerAliveInterval 60
  ServerAliveCountMax 3
  
# Exemplo de configuração para um servidor específico
# Host meu-servidor
#   HostName endereco-ip-ou-dominio
#   User meu-usuario
#   Port 22
#   IdentityFile ~/.ssh/id_rsa
EOF

chmod 600 ~/.ssh/config
echo "Arquivo de configuração SSH criado em ~/.ssh/config"