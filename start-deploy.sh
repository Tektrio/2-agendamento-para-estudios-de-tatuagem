#!/bin/bash

# Este script prepara o aplicativo para deployment e sugere o deployment no Replit

echo "==============================================="
echo "Preparando o aplicativo para deployment no Replit"
echo "==============================================="

# Verificar as dependências essenciais
echo "Verificando dependências..."
npm list express > /dev/null || npm install express
npm list @neondatabase/serverless > /dev/null || npm install @neondatabase/serverless

# Verificar que o Workflow está configurado corretamente
echo "Verificando configuração do Workflow..."
if ! grep -q "Start application" .replit 2>/dev/null; then
  echo "AVISO: Workflow pode não estar configurado corretamente."
  echo "Certifique-se de que existe um workflow 'Start application' que executa 'npm run dev'."
else
  echo "Workflow está configurado corretamente."
fi

# Verificar variáveis de ambiente essenciais
echo "Verificando variáveis de ambiente..."
MISSING_VARS=0

if [ -z "$DATABASE_URL" ]; then
  echo "ERRO: DATABASE_URL não encontrada. O aplicativo não funcionará sem acesso ao banco de dados."
  MISSING_VARS=1
fi

if [ -z "$OPENAI_API_KEY" ]; then
  echo "AVISO: OPENAI_API_KEY não encontrada. As funcionalidades de IA não funcionarão."
  MISSING_VARS=1
fi

# Verificar se o aplicativo está rodando
echo "Verificando se o aplicativo está rodando..."
if curl -s http://localhost:5000 > /dev/null; then
  echo "Aplicativo está rodando na porta 5000."
else
  echo "AVISO: Aplicativo não parece estar rodando. Execute 'npm run dev' primeiro."
fi

# Instruções para deployment
echo ""
echo "==============================================="
echo "INSTRUÇÕES PARA DEPLOYMENT"
echo "==============================================="
echo "1. Certifique-se de que todas as variáveis de ambiente estão configuradas"
echo "2. Certifique-se de que o aplicativo está funcionando localmente (npm run dev)"
echo "3. No painel do Replit, clique no botão 'Deploy'"
echo "4. Após o deployment, o aplicativo estará disponível em:"
echo "   https://$(hostname -f)"
echo ""
echo "Para mais informações sobre acesso, consulte o arquivo access-info.txt"

# Resumo final
if [ $MISSING_VARS -eq 0 ]; then
  echo ""
  echo "O aplicativo está PRONTO para deployment!"
else
  echo ""
  echo "⚠️ AVISO: Há variáveis de ambiente faltando. Ajuste as configurações antes do deployment."
fi