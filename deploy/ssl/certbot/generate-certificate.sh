#!/bin/bash
# generate-certificate.sh

# чистим папку, где могут находиться старые сертификаты
rm -rf /etc/letsencrypt/live/certfolder*

# выдаем себе сертификат (обратите внимание на переменные среды)
certbot certonly --standalone --email $DOMAIN_EMAIL -d $DOMAIN_URL --cert-name=certfolder --key-type rsa --agree-tos

# удаляем старые сертификаты из примонтированной
# через Docker Compose папки Nginx
rm -rf /etc/nginx/ssl/sportikapp.ru.pem
rm -rf /etc/nginx/ssl/sportikapp.ru.pem

# копируем сертификаты из образа certbot в папку Nginx
cp /etc/letsencrypt/live/certfolder*/fullchain.pem /etc/nginx/ssl/sportikapp.ru.pem
cp /etc/letsencrypt/live/certfolder*/privkey.pem /etc/nginx/ssl/sportikapp.ru.pem