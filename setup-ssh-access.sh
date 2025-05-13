#!/bin/bash

# Script unificado para configurar acesso SSH
# Este script executa todas as etapas necessárias para configurar o acesso SSH

# Cores para o terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
echo -e "${CYAN}"
echo "┌──────────────────────────────────────────────────┐"
echo "│                                                  │"
echo "│      CONFIGURAÇÃO SSH - ESTÚDIO DE TATUAGEM      │"
echo "│                                                  │"
echo "└──────────────────────────────────────────────────┘"
echo -e "${NC}"

# Verificar permissões dos scripts
echo -e "${YELLOW}Verificando permissões dos scripts...${NC}"
chmod +x ssh-manager.sh ssh-connect.sh generate-ssh-keys.sh export-project.sh check-ssh-deps.sh 2>/dev/null

# Verificar e instalar dependências
echo -e "${YELLOW}Verificando dependências...${NC}"
if [ -f check-ssh-deps.sh ]; then
    ./check-ssh-deps.sh
else
    echo -e "${RED}Script check-ssh-deps.sh não encontrado.${NC}"
fi

# Gerar chaves SSH se não existirem
echo -e "${YELLOW}Configurando chaves SSH...${NC}"
if [ ! -f ~/.ssh/id_rsa ]; then
    echo "Gerando novas chaves SSH..."
    mkdir -p ~/.ssh
    ssh-keygen -t rsa -b 4096 -N "" -f ~/.ssh/id_rsa
    chmod 600 ~/.ssh/id_rsa
    chmod 644 ~/.ssh/id_rsa.pub
    echo -e "${GREEN}Chaves SSH geradas com sucesso!${NC}"
else
    echo -e "${GREEN}Chaves SSH já existem.${NC}"
fi

# Criar arquivo de configuração SSH
echo -e "${YELLOW}Criando arquivo de configuração SSH...${NC}"
mkdir -p ~/.ssh
cat > ~/.ssh/config << EOF
# Configuração SSH para o aplicativo de estúdio de tatuagem
Host *
  ServerAliveInterval 60
  ServerAliveCountMax 3
EOF
chmod 600 ~/.ssh/config
echo -e "${GREEN}Arquivo de configuração SSH criado.${NC}"

# Exibir resumo e próximos passos
echo -e "\n${GREEN}Configuração SSH concluída!${NC}\n"
echo -e "Você pode agora:"
echo -e "1) Iniciar o gerenciador SSH: ${CYAN}./ssh-manager.sh${NC}"
echo -e "2) Iniciar diretamente uma sessão SSH compartilhável: ${CYAN}./ssh-connect.sh${NC}"
echo -e "3) Exportar o projeto para uso em outro ambiente: ${CYAN}./export-project.sh${NC}"
echo -e "4) Ler o guia rápido de SSH: ${CYAN}cat ssh-quickstart.md${NC}"
echo -e "5) Ler a documentação completa: ${CYAN}cat ssh-readme.md${NC}"
echo -e "\nPara iniciar o gerenciador SSH, execute: ${CYAN}./ssh-manager.sh${NC}"