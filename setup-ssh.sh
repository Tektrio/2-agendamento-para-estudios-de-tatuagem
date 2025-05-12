#!/bin/bash

# Gerar chaves SSH se não existirem
if [ ! -f ~/.ssh/id_rsa ]; then
    echo "Gerando chaves SSH..."
    ssh-keygen -t rsa -b 4096 -N "" -f ~/.ssh/id_rsa
fi

# Configurar o servidor SSH
mkdir -p ~/.ssh
touch ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys

# Copiar configuração do servidor SSH
cat > ~/sshd_config << EOF
Port 2222
HostKey ~/.ssh/id_rsa
PermitRootLogin no
PubkeyAuthentication yes
PasswordAuthentication no
PermitEmptyPasswords no
ChallengeResponseAuthentication no
UsePAM no
X11Forwarding yes
PrintMotd no
AcceptEnv LANG LC_*
Subsystem sftp /nix/store/d55mzxhmrzr3v6vi9dvxi6fgxws0rzqh-pid1/bin/sftp-server
EOF

echo "Configuração SSH criada!"
echo "Para adicionar sua chave pública, coloque-a no arquivo ~/.ssh/authorized_keys"
echo "Para iniciar o servidor SSH, execute: /nix/store/0g1s8yd0biawp32fl3i7kdbi219jx6aq-openssh-9.7p1/bin/sshd -f ~/sshd_config -D"
echo "Você poderá conectar-se usando: ssh -p 2222 usuario@hostname"