#!/bin/bash

# Script para preparar o aplicativo para deployment
# Isso configurará o aplicativo para ser acessível publicamente

echo "Preparando aplicativo para deployment..."

# Verificar se as dependências necessárias estão instaladas
echo "Verificando dependências..."
npm list express > /dev/null || npm install express
npm list @neondatabase/serverless > /dev/null || npm install @neondatabase/serverless

# Verificar se o banco de dados está configurado
echo "Verificando configuração do banco de dados..."
if [ -z "$DATABASE_URL" ]; then
  echo "AVISO: Variável DATABASE_URL não encontrada. O banco de dados pode não estar configurado."
else
  echo "Banco de dados configurado."
fi

# Verificar se há variáveis de ambiente essenciais faltando
echo "Verificando variáveis de ambiente..."
MISSING_VARS=0

if [ -z "$OPENAI_API_KEY" ]; then
  echo "AVISO: OPENAI_API_KEY não encontrada. As funcionalidades de IA não funcionarão."
  MISSING_VARS=1
fi

# Verificar Twilio (opcional)
if [ -z "$TWILIO_ACCOUNT_SID" ] || [ -z "$TWILIO_AUTH_TOKEN" ] || [ -z "$TWILIO_PHONE_NUMBER" ]; then
  echo "AVISO: Uma ou mais variáveis do Twilio não encontradas. As notificações SMS não funcionarão."
fi

# Verificar se o aplicativo é acessível de fora
echo "Verificando acessibilidade da aplicação..."
EXTERNAL_IP=$(curl -s ifconfig.me)
EXTERNAL_URL="https://$(hostname -I | awk '{print $1}'):5000"

echo "URL externa do aplicativo: $EXTERNAL_URL"
echo "Endereço IP externo: $EXTERNAL_IP"

# Gerar informações de acesso
echo "Gerando informações de acesso..."

cat > access-info.txt << EOF
# Informações de Acesso para o Aplicativo de Estúdio de Tatuagem

## Acesso via Web
URL pública: https://$(hostname -f)

## Acesso via API
Base URL: https://$(hostname -f)/api

Endpoints disponíveis:
- GET /api/artists - Lista todos os artistas
- GET /api/schedules - Lista todos os horários disponíveis
- GET /api/appointments - Lista todos os agendamentos
- GET /api/waitlist - Lista todos os registros da lista de espera

## Acesso ao Dashboard de Analytics
URL: https://$(hostname -f)/analytics

## Acesso ao Banco de Dados
DATABASE_URL: PostgreSQL em $(echo $DATABASE_URL | cut -d '@' -f2 | cut -d '/' -f1)

## Data de Geração
$(date)
EOF

echo "Informações de acesso geradas em access-info.txt"

# Verificar se o aplicativo está pronto para deployment
if [ $MISSING_VARS -eq 0 ]; then
  echo "Aplicativo está pronto para deployment!"
  echo "Para iniciar o deployment, execute: npm run dev"
else
  echo "AVISO: Há variáveis de ambiente faltando. O aplicativo pode não funcionar completamente."
  echo "Consulte as advertências acima e configure as variáveis de ambiente necessárias."
fi

echo ""
echo "Para mais informações sobre como acessar o aplicativo, consulte access-info.txt"