#!/bin/bash

# Script para exportar o projeto para um arquivo zip
# Isso facilitará a transferência para um ambiente onde SSH funciona plenamente

# Definir nome do arquivo de saída com timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
OUTPUT_FILE="tattoo-studio-app_${TIMESTAMP}.zip"

echo "Iniciando exportação do projeto..."
echo "Este processo pode levar alguns minutos."

# Criar diretório temporário para exportação
TEMP_DIR="export_temp"
mkdir -p $TEMP_DIR

# Exportar código-fonte
echo "Exportando código-fonte..."
cp -r client server shared components.json drizzle.config.ts package.json postcss.config.js tailwind.config.ts tsconfig.json vite.config.ts $TEMP_DIR/

# Exportar esquema do banco de dados
echo "Exportando esquema do banco de dados..."
mkdir -p $TEMP_DIR/database
pg_dump -s $DATABASE_URL > $TEMP_DIR/database/schema.sql

# Incluir README com instruções
cat > $TEMP_DIR/README.md << EOF
# Tattoo Studio Scheduling Application

Exportado em: $(date)

## Conteúdo
- Código-fonte completo (client, server, shared)
- Esquema do banco de dados PostgreSQL
- Arquivos de configuração

## Instruções para instalação

1. Extraia este arquivo zip
2. Instale as dependências: \`npm install\`
3. Configure as variáveis de ambiente em um arquivo .env:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/tattoo_studio
   OPENAI_API_KEY=sua_chave_aqui
   TWILIO_ACCOUNT_SID=seu_sid_aqui
   TWILIO_AUTH_TOKEN=seu_token_aqui
   TWILIO_PHONE_NUMBER=seu_numero_aqui
   ```
4. Execute as migrações do banco de dados: \`npm run db:push\`
5. Inicie a aplicação: \`npm run dev\`

## Acesso SSH (em ambiente externo ao Replit)

Para configurar acesso SSH em um servidor externo:

1. Instale OpenSSH Server:
   \`\`\`
   sudo apt-get update
   sudo apt-get install openssh-server
   \`\`\`

2. Configure o arquivo /etc/ssh/sshd_config conforme necessário

3. Reinicie o serviço SSH:
   \`\`\`
   sudo systemctl restart ssh
   \`\`\`

4. Acesse usando:
   \`\`\`
   ssh usuario@seu_servidor -p 22
   \`\`\`
EOF

# Criar o arquivo zip
echo "Criando arquivo zip..."
cd $TEMP_DIR
zip -r ../$OUTPUT_FILE .
cd ..

# Limpar temporários
rm -rf $TEMP_DIR

echo "Exportação concluída!"
echo "Arquivo criado: $OUTPUT_FILE"
echo ""
echo "Para baixar este arquivo, você pode:"
echo "1. Usar o painel de arquivos do Replit para baixá-lo"
echo "2. Em um sistema com wget: wget https://$(hostname -i):5000/$OUTPUT_FILE"
echo ""
echo "Este arquivo contém seu código-fonte e esquema do banco de dados."
echo "Você pode importá-lo em qualquer ambiente onde deseja configurar SSH completo."