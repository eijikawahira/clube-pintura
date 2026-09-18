# Deploy no Rocky Linux (desktop próprio)

Este guia assume um Rocky Linux 9 "limpo" rodando num desktop, acessado via rede
local (sem domínio público obrigatório). Rode os comandos como um usuário com
`sudo`.

## 1. Instalar Node.js (LTS)

```bash
curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
sudo dnf install -y nodejs gcc-c++ make
node -v   # deve mostrar v22.x
```

`gcc-c++`/`make` são necessários porque `better-sqlite3` compila um binário
nativo na instalação.

## 2. Instalar PM2

```bash
sudo npm install -g pm2
```

## 3. Copiar o projeto para o servidor

Do seu computador de desenvolvimento:

```bash
rsync -avz --exclude node_modules --exclude .next --exclude data \
  ~/dev/clube-pintura/ usuario@ip-do-servidor:/opt/clube-pintura/
```

(Ou clone via `git clone` se você colocar o projeto num repositório Git.)

## 4. Configurar variáveis de ambiente

No servidor, dentro de `/opt/clube-pintura`:

```bash
cp .env.example .env
openssl rand -base64 32   # copie o resultado
```

Edite `.env` e preencha:

```
AUTH_SECRET=<cole o valor gerado acima>
AUTH_URL=http://IP-DO-SERVIDOR:3000
```

(Depois de configurar o Nginx no passo 7, atualize `AUTH_URL` para
`http://IP-DO-SERVIDOR` sem a porta, ou para seu domínio com `https://`.)

Opcionalmente, preencha também `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` para ativar o
autocomplete de endereço na tela de encontros do admin (veja instruções no
próprio `.env.example`). Sem essa chave o campo de local continua funcionando
normalmente como texto livre.

## 5. Instalar dependências, migrar e criar o admin

```bash
cd /opt/clube-pintura
npm ci
npm run build
npm run db:migrate
npm run db:seed-admin   # siga o prompt interativo para criar o primeiro admin
```

O banco SQLite fica em `/opt/clube-pintura/data/clube.db` e as imagens das
miniaturas em `/opt/clube-pintura/public/uploads/` — faça backup periódico
dos dois (são os únicos dados persistentes da aplicação).

## 6. Subir com PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd   # copie e rode o comando que ele imprimir na tela
```

Isso garante que o site volta a subir sozinho se o desktop reiniciar.

Para atualizar depois de uma mudança de código: `git pull` (ou `rsync` de novo),
`npm ci`, `npm run build`, `npm run db:migrate`, `pm2 restart clube-pintura`.

## 7. Instalar e configurar o Nginx

```bash
sudo dnf install -y nginx
sudo cp deploy/nginx.conf.example /etc/nginx/conf.d/clube-pintura.conf
sudo nginx -t
sudo systemctl enable --now nginx
```

Edite `/etc/nginx/conf.d/clube-pintura.conf` e ajuste `server_name` se tiver
domínio ou IP fixo.

### Abrir a porta no firewall

```bash
sudo firewall-cmd --add-service=http --permanent
sudo firewall-cmd --reload
```

### SELinux (Rocky Linux vem com SELinux "enforcing" por padrão)

Por padrão o SELinux bloqueia o Nginx de fazer proxy para outra porta local.
Libere com:

```bash
sudo setsebool -P httpd_can_network_connect 1
```

Depois disso, acesse `http://IP-DO-SERVIDOR` (porta 80, sem `:3000`) de
qualquer dispositivo na mesma rede.

## 8. HTTPS (opcional, só se houver domínio público)

Se o site tiver domínio próprio apontando para o servidor (não apenas IP
local), você pode gerar certificado grátis com Certbot:

```bash
sudo dnf install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

Sem domínio público, o acesso fica limitado à rede local via IP mesmo — o que
é normal para um clube pequeno usando um desktop caseiro como servidor.
