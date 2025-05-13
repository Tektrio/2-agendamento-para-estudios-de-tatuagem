# Guia Rápido de SSH para o Aplicativo de Estúdio de Tatuagem

Este guia fornece instruções simples para conectar e gerenciar o aplicativo via SSH.

## Começando Rápido

1. **Execute o gerenciador SSH**:
   ```bash
   ./ssh-manager.sh
   ```

2. **Escolha "Iniciar sessão SSH compartilhável"** no menu e siga as instruções.

3. **Use o comando SSH** exibido para se conectar remotamente.

## Comandos Úteis para Desenvolvimento via SSH

```bash
# Iniciar o aplicativo
npm run dev

# Verificar status do banco de dados
npm run db:studio

# Verificar logs
tail -f logs/*.log

# Atualizar dependências
npm install

# Verificar portas em uso
lsof -i:5000
```

## Transferência de Arquivos

```bash
# Do seu computador para o Replit:
scp -P 2222 arquivo.txt usuario@servidor:~/

# Do Replit para seu computador:
scp -P 2222 usuario@servidor:~/arquivo.txt ./
```

## Atalhos do Tmate

- **Ctrl+b d** - Desconectar da sessão (deixando-a rodando)
- **Ctrl+b c** - Criar nova janela
- **Ctrl+b n** - Próxima janela
- **Ctrl+b p** - Janela anterior

## Solução de Problemas

- **SSH não conecta**: Verifique se o script ssh-connect.sh está rodando
- **Erros de permissão**: Certifique-se de usar a chave SSH correta
- **Aplicativo não inicia**: Verifique variáveis de ambiente e dependências

## Segurança

Mantenha o link SSH compartilhável seguro e nunca o exponha publicamente.

## Scripts Disponíveis

- **ssh-manager.sh** - Interface unificada para acesso SSH
- **ssh-connect.sh** - Inicia uma sessão SSH compartilhável
- **generate-ssh-keys.sh** - Gera chaves SSH para uso em servidores externos
- **export-project.sh** - Exporta o projeto para uso em outro ambiente
- **check-ssh-deps.sh** - Verifica as dependências necessárias para SSH

Para mais informações, veja a documentação completa em `ssh-readme.md`.