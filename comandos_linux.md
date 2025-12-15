# No servidor Backend (opensignBack01)

# Testar conexão com mongosh (se já estiver instalado)

mongosh 'mongodb://opensignbr:zaq12wsxZAQ!@WSX2@202512@172.31.10.209:27017/opensignbr?authSource=admin' --eval "db.adminCommand('ping')"

# Listar databases

mongosh 'mongodb://opensignbr:zaq12wsxZAQ!@WSX2@202512@172.31.10.209:27017/opensignbr?authSource=admin' --eval "show dbs"

# Listar collections no database opensignbr

mongosh 'mongodb://opensignbr:zaq12wsxZAQ!@WSX2@202512@172.31.10.209:27017/opensignbr?authSource=admin' --eval "use opensignbr; show collections"

Backeend;

# Recarregar configurações do systemd

sudo systemctl daemon-reload

# Habilitar o serviço para iniciar no boot

sudo systemctl enable opensignbr-backend

# Iniciar o serviço

sudo systemctl start opensignbr-backend

# Verificar status

sudo systemctl status opensignbr-backend

# Iniciar

sudo systemctl start opensignbr-backend

# Parar

sudo systemctl stop opensignbr-backend

# Reiniciar

sudo systemctl restart opensignbr-backend

# Recarregar (sem downtime, se suportado)

sudo systemctl reload opensignbr-backend

# Ver status

sudo systemctl status opensignbr-backend

# Verificar se está habilitado para boot

sudo systemctl is-enabled opensignbr-backend

# Desabilitar auto-start no boot

sudo systemctl disable opensignbr-backend

# Logs em tempo real (como tail -f)

sudo journalctl -u opensignbr-backend -f

# Logs em tempo real com mais contexto

sudo journalctl -u opensignbr-backend -f --output=cat

# Últimas 100 linhas + tempo real

sudo journalctl -u opensignbr-backend -n 100 -f

# Logs com timestamps mais legíveis

sudo journalctl -u opensignbr-backend -f --since "5 minutes ago"

# Logs apenas de hoje

sudo journalctl -u opensignbr-backend --since today -f

# Logs com cores

sudo journalctl -u opensignbr-backend -f --output=short-precise

# Logs mostrando apenas erros em tempo real

sudo journalctl -u opensignbr-backend -p err -f

# Iniciar serviço e já acompanhar logs

sudo systemctl restart opensignbr-backend && sudo journalctl -u opensignbr-backend -f

# Buscar erros nos últimos logs

sudo journalctl -u opensignbr-backend --since "10 minutes ago" | grep -i error

# Buscar problemas de conexão MongoDB

sudo journalctl -u opensignbr-backend --since "10 minutes ago" | grep -i mongo

# Buscar problemas de porta

sudo journalctl -u opensignbr-backend --since "10 minutes ago" | grep -i "EADDRINUSE"

# Ver logs desde o último boot

sudo journalctl -u opensignbr-backend -b

1. Verificar a Estrutura do Projeto

# No servidor Backend (opensignBack01)

cd /openSign/backend

# Listar arquivos

ls -lah

# Verificar se existe package.json

cat package.json

sudo nano /etc/nginx/sites-available/opensignbr-frontend

sudo nano /etc/nginx/sites-available/opensignbr
sudo nano /etc/nginx/sites-available/opensignbr-frontend

sudo nginx -t

sudo systemctl reload nginx
sudo systemctl stautus nginx
sudo systemctl restart nginx

sudo tail -f /var/log/nginx/opensignbr_backend_error.log
