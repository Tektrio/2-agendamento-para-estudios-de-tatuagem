#!/bin/bash

# Exibe informações para conexão SSH

echo "===== INFORMAÇÕES PARA CONEXÃO SSH ====="
echo ""
echo "Servidor SSH está rodando na porta 2222"
echo ""
echo "Endereço IP para conexão:"
curl -s ifconfig.me
echo ""
echo ""
echo "Chave privada para conexão (salve em um arquivo id_rsa):"
echo "--------------------------------------------"
cat ~/.ssh/id_rsa
echo "--------------------------------------------"
echo ""
echo "Comandos para conexão:"
echo ""
echo "1. Salve o arquivo de chave privada como 'id_rsa'"
echo "2. Execute: chmod 600 id_rsa"
echo "3. Conecte-se com: ssh -i id_rsa -p 2222 runner@$(curl -s ifconfig.me)"
echo ""
echo "Para transferência de arquivos:"
echo "scp -i id_rsa -P 2222 arquivo.txt runner@$(curl -s ifconfig.me):~/"
echo ""
echo "===== FIM DAS INFORMAÇÕES ====="