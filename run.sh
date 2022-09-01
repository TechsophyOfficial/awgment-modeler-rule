#!/bin/sh
set -xe
# WEB_ROOT=/usr/share/nginx/html

mkdir $WEB_ROOT/model/rules || true

rm -rf nginx.conf || true
cat >> nginx.conf << EOF
server {
  listen 80;
  root $WEB_ROOT;
  server_name $HOSTNAME;

  location / {
        try_files \$uri \$uri/ /index.html;
        add_header   Cache-Control public;
        expires      1d;
  }

  location ~ ^/model/rules/((?!(static|(.*\..*))).)+$ {
    try_files /model/rules/index.html =404;
  }
}
EOF

./env2Json.sh > $WEB_ROOT/model/rules/config.json

nginx -c nginx.conf  -g "daemon off;"
