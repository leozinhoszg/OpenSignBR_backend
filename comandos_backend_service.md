6. Se o Teste Manual Funcionar

# Atualizar o serviço systemd para usar Node.js correto

sudo nano /etc/systemd/system/opensignbr-backend.service
Altere a linha ExecStart para especificar o caminho completo do Node.js:
[Unit]
Description=OpenSignBR Backend - Parse Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/openSign/backend
EnvironmentFile=/openSign/backend/.env
ExecStart=/root/.nvm/versions/node/v20.18.0/bin/node /openSign/backend/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=opensignbr-backend

[Install]
WantedBy=multi-user.target
Depois:
sudo systemctl daemon-reload
sudo systemctl start opensignbr-backend
sudo journalctl -u opensignbr-backend -f 7. Verificação Final

# Ver status completo

cd /openSign/backend

echo "1. Node.js version:"
node --version

echo "2. Pacotes instalados:"
ls node_modules | wc -l

echo "3. Parse-server presente:"
ls node_modules/parse-server/lib/index.js

echo "4. Testar manualmente:"
timeout 5 node index.js || echo "OK - iniciou e foi interrompido"
