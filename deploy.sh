#!/bin/bash
REPOSITORY=/home/ec2-user/build

cd $REPOSITORY

sudo npm i
sudo pm2 kill
sudo npm run start:dev-cicd
