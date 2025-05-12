#!/bin/bash

# Verifica se o script de configuração já foi executado
if [ ! -f ~/sshd_config ]; then
  echo "Executando configuração inicial do SSH..."
  ./setup-ssh.sh
fi

# Verifica se já existe um processo sshd rodando
if pgrep -x "sshd" > /dev/null; then
  echo "Servidor SSH já está em execução!"
else
  echo "Iniciando servidor SSH na porta 2222..."
  /nix/store/0g1s8yd0biawp32fl3i7kdbi219jx6aq-openssh-9.7p1/bin/sshd -f ~/sshd_config
  echo "Servidor SSH iniciado!"
  echo "Para se conectar, use: ssh -p 2222 usuario@hostname"
fi

# Exibe o endereço IP externo para conexão
echo "Seu endereço IP para conexão é:"
curl -s ifconfig.me
echo ""