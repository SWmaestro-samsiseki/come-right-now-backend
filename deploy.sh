#!/bin/bash
REPOSITORY=/home/ec2-user/build

cd $REPOSITORY

sudo npm i
sudo pm2 kill
sudo NODE_ENV=development pm2 start /dist/main.js
