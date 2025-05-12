# Instruções para Acesso SSH ao Aplicativo de Estúdio de Tatuagem

Este documento explica como acessar o aplicativo de estúdio de tatuagem via SSH para desenvolvimento, manutenção ou gerenciamento remoto.

## Método 1: Acesso via tmate (Recomendado)

O tmate é uma ferramenta que permite compartilhar sessões de terminal via SSH sem precisar configurar um servidor SSH completo. Este é o método mais simples e recomendado.

### Como Conectar:

1. No terminal do Replit, execute o script:
   ```
   ./ssh-connect.sh
   ```

2. O script exibirá um comando SSH e uma URL web, como:
   ```
   ssh abcdef123456@nyc1.tmate.io
   ```

3. Você pode usar esse comando SSH de qualquer terminal para se conectar, ou usar a URL web para acesso pelo navegador.

4. Para encerrar a sessão, pressione `Ctrl+C` no terminal do Replit onde o script está rodando.

## Método 2: Exportar o Projeto e Usar SSH em Outro Ambiente

Se você precisa de recursos completos de SSH, você pode exportar o projeto e implantá-lo em um servidor próprio.

### Como Exportar e Implantar:

1. No terminal do Replit, execute o script:
   ```
   ./export-project.sh
   ```

2. Baixe o arquivo ZIP gerado.

3. Em seu próprio servidor (onde você tem controle total):
   - Descompacte o arquivo ZIP
   - Instale as dependências: `npm install`
   - Configure as variáveis de ambiente
   - Execute o aplicativo: `npm run dev`

4. Configure o SSH em seu servidor:
   ```bash
   sudo apt-get update
   sudo apt-get install openssh-server
   sudo systemctl enable ssh
   sudo systemctl start ssh
   ```

5. Conecte-se ao seu servidor:
   ```
   ssh usuario@seu_servidor
   ```

## Dicas para Utilização SSH

### Comandos Úteis Dentro da Sessão SSH:

- Ver logs do aplicativo: `npm run dev`
- Verificar banco de dados: `npm run db:studio`
- Atualizar código: `git pull` (se estiver usando git)
- Instalar dependências: `npm install`
- Reiniciar servidor: `pkill node && npm run dev`

### Transferência de Arquivos com SCP:

```bash
# Copiar um arquivo para o servidor
scp arquivo.txt usuario@servidor:~/destino/

# Copiar um arquivo do servidor
scp usuario@servidor:~/arquivo.txt ./local/
```

## Solução de Problemas

1. **Erro de conexão tmate**: Verifique se o script `ssh-connect.sh` está sendo executado e não foi interrompido.

2. **Permissão negada**: Verifique se está usando o comando SSH exato fornecido pelo script.

3. **Tempo limite de conexão**: O tmate usa sessões temporárias. Garanta que o script continue em execução durante o uso.

4. **Comandos não funcionam**: Dentro da sessão SSH, navegue para o diretório correto do projeto usando `cd /home/runner/workspace` ou similar.

## Segurança

- O link de acesso tmate é temporário e único para cada sessão.
- Nunca compartilhe as credenciais SSH com pessoas não autorizadas.
- Sempre encerre a sessão tmate quando não estiver em uso.
- Considere configurar autenticação de dois fatores para acesso SSH em seu próprio servidor.

Para mais informações ou ajuda, consulte a documentação do [tmate](https://tmate.io/) ou do [OpenSSH](https://www.openssh.com/).