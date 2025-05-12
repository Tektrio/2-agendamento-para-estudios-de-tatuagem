#!/bin/bash

# SSH Manager - Script unificado para gerenciar acesso SSH ao aplicativo
# Este script oferece várias opções para configurar e gerenciar o acesso SSH

# Cores para o terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Função para exibir o banner
show_banner() {
  echo -e "${CYAN}"
  echo "┌──────────────────────────────────────────────────┐"
  echo "│                                                  │"
  echo "│          SSH MANAGER - ESTÚDIO DE TATUAGEM       │"
  echo "│                                                  │"
  echo "└──────────────────────────────────────────────────┘"
  echo -e "${NC}"
}

# Função para exibir o menu
show_menu() {
  echo -e "${GREEN}Escolha uma opção:${NC}"
  echo ""
  echo -e "${CYAN}1)${NC} Iniciar sessão SSH compartilhável (tmate)"
  echo -e "${CYAN}2)${NC} Gerar par de chaves SSH"
  echo -e "${CYAN}3)${NC} Exportar projeto para uso com SSH externo"
  echo -e "${CYAN}4)${NC} Ver informações de acesso SSH"
  echo -e "${CYAN}5)${NC} Verificar status do SSH"
  echo -e "${CYAN}6)${NC} Ler documentação SSH"
  echo -e "${CYAN}0)${NC} Sair"
  echo ""
  echo -ne "${YELLOW}Digite sua escolha:${NC} "
  read choice
}

# Função para iniciar sessão tmate
start_tmate() {
  clear
  echo -e "${CYAN}Iniciando sessão SSH compartilhável via tmate...${NC}"
  echo ""
  
  if [[ -f ./ssh-connect.sh ]]; then
    ./ssh-connect.sh
  else
    echo -e "${RED}Erro: Script ssh-connect.sh não encontrado!${NC}"
    sleep 2
  fi
}

# Função para gerar chaves SSH
generate_keys() {
  clear
  echo -e "${CYAN}Gerando par de chaves SSH...${NC}"
  echo ""
  
  if [[ -f ./generate-ssh-keys.sh ]]; then
    ./generate-ssh-keys.sh
  else
    echo -e "${RED}Erro: Script generate-ssh-keys.sh não encontrado!${NC}"
    sleep 2
  fi
  
  echo ""
  echo -e "${GREEN}Pressione ENTER para continuar...${NC}"
  read
}

# Função para exportar o projeto
export_project() {
  clear
  echo -e "${CYAN}Exportando projeto para uso com SSH externo...${NC}"
  echo ""
  
  if [[ -f ./export-project.sh ]]; then
    ./export-project.sh
  else
    echo -e "${RED}Erro: Script export-project.sh não encontrado!${NC}"
    sleep 2
  fi
  
  echo ""
  echo -e "${GREEN}Pressione ENTER para continuar...${NC}"
  read
}

# Função para mostrar informações de acesso
show_access_info() {
  clear
  echo -e "${CYAN}Informações de acesso SSH:${NC}"
  echo ""
  
  # Verificar se há um arquivo de informações SSH
  if [[ -f ./ssh-info.txt ]]; then
    cat ./ssh-info.txt
  else
    echo "Informações SSH ainda não foram geradas."
    echo "Execute a opção 1 para gerar informações de acesso SSH."
  fi
  
  echo ""
  echo -e "${GREEN}Pressione ENTER para continuar...${NC}"
  read
}

# Função para verificar status SSH
check_ssh_status() {
  clear
  echo -e "${CYAN}Verificando status SSH...${NC}"
  echo ""
  
  # Verificar se as chaves SSH existem
  if [[ -f ~/.ssh/id_rsa && -f ~/.ssh/id_rsa.pub ]]; then
    echo -e "${GREEN}✓${NC} Par de chaves SSH encontrado"
  else
    echo -e "${RED}✗${NC} Par de chaves SSH não encontrado"
  fi
  
  # Verificar se tmate está instalado
  if command -v tmate &>/dev/null; then
    echo -e "${GREEN}✓${NC} tmate está instalado"
  else
    echo -e "${RED}✗${NC} tmate não está instalado"
  fi
  
  # Verificar se uma sessão tmate está ativa
  if [[ -e ~/.tmate.sock ]] && pgrep tmate &>/dev/null; then
    echo -e "${GREEN}✓${NC} Sessão tmate ativa"
  else
    echo -e "${RED}✗${NC} Nenhuma sessão tmate ativa"
  fi
  
  # Verificar configuração SSH
  if [[ -f ~/.ssh/config ]]; then
    echo -e "${GREEN}✓${NC} Arquivo de configuração SSH encontrado"
  else
    echo -e "${RED}✗${NC} Arquivo de configuração SSH não encontrado"
  fi
  
  echo ""
  echo -e "${GREEN}Pressione ENTER para continuar...${NC}"
  read
}

# Função para ler a documentação
read_docs() {
  clear
  echo -e "${CYAN}Documentação SSH:${NC}"
  echo ""
  
  if [[ -f ./ssh-readme.md ]]; then
    # Tentar usar um visualizador de markdown se disponível
    if command -v glow &>/dev/null; then
      glow ./ssh-readme.md
    else
      # Caso contrário, exibir como texto
      cat ./ssh-readme.md
    fi
  else
    echo -e "${RED}Erro: Arquivo ssh-readme.md não encontrado!${NC}"
  fi
  
  echo ""
  echo -e "${GREEN}Pressione ENTER para continuar...${NC}"
  read
}

# Loop principal
while true; do
  clear
  show_banner
  show_menu
  
  case $choice in
    1) start_tmate ;;
    2) generate_keys ;;
    3) export_project ;;
    4) show_access_info ;;
    5) check_ssh_status ;;
    6) read_docs ;;
    0) 
      clear
      echo -e "${GREEN}Obrigado por usar o SSH Manager!${NC}"
      exit 0
      ;;
    *)
      echo -e "${RED}Opção inválida!${NC}"
      sleep 1
      ;;
  esac
done