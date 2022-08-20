#!/bin/bash
REPOSITORY=/home/ubuntu/build

cd $REPOSITORY

sudo npm i
sudo pm2 kill
sudo npm run start:prod
