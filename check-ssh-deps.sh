#!/bin/bash

# Script para verificar e instalar dependências necessárias para SSH
# Este script verifica se as ferramentas necessárias estão instaladas

echo "==============================================="
echo "Verificando dependências para SSH"
echo "==============================================="

# Função para verificar se um comando está disponível
check_command() {
  if command -v $1 &> /dev/null
  then
    echo "✓ $1 está instalado"
    return 0
  else
    echo "✗ $1 não está instalado"
    return 1
  fi
}

# Verificar todas as ferramentas necessárias
MISSING_DEPS=0

echo "Verificando ferramentas essenciais..."
check_command ssh || MISSING_DEPS=1
check_command scp || MISSING_DEPS=1
check_command ssh-keygen || MISSING_DEPS=1

echo ""
echo "Verificando ferramentas adicionais..."
check_command tmate || MISSING_DEPS=1
check_command tmux || MISSING_DEPS=1

echo ""
echo "Verificando ferramentas auxiliares..."
check_command curl || MISSING_DEPS=1
check_command wget || MISSING_DEPS=1
check_command zip || MISSING_DEPS=1
check_command unzip || MISSING_DEPS=1

# Se estiver faltando alguma dependência, oferecer para instalar
if [ $MISSING_DEPS -eq 1 ]; then
  echo ""
  echo "Algumas dependências necessárias estão faltando."
  echo "Deseja instalar as dependências faltantes? (s/N)"
  read INSTALL
  
  if [ "$INSTALL" = "s" ] || [ "$INSTALL" = "S" ]; then
    echo "Instalando dependências..."
    
    # Verificar se o apt está disponível
    if command -v apt-get &> /dev/null; then
      # Tentar instalar dependências via apt
      apt-get update
      apt-get install -y openssh-client openssh-server tmate tmux curl wget zip unzip
    elif command -v nix-env &> /dev/null; then
      # Tentar instalar via nix
      nix-env -iA nixpkgs.openssh nixpkgs.tmate nixpkgs.tmux nixpkgs.curl nixpkgs.wget nixpkgs.zip nixpkgs.unzip
    else
      echo "Não foi possível identificar um gerenciador de pacotes suportado."
      echo "Por favor, instale as dependências manualmente."
    fi
    
    echo "Verificando novamente as dependências..."
    check_command ssh
    check_command tmate
    check_command tmux
  fi
else
  echo ""
  echo "✓ Todas as dependências necessárias estão instaladas!"
fi

echo ""
echo "Para iniciar o gerenciador SSH, execute: ./ssh-manager.sh"