#!/bin/bash

# This script is intended to create a fast instance of
# Red-social-asociacion in a VPS running ubuntu (14.04).

# Install and run latest docker
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates
sudo apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D
echo "deb https://apt.dockerproject.org/repo ubuntu-trusty main" | sudo tee -a /etc/apt/sources.list.d/docker.list
sudo apt-get update
sudo apt-get purge -y lxc-docker
sudo apt-get install -y linux-image-extra-$(uname -r)
sudo apt-get install -y apparmor
sudo apt-get install -y docker-engine
sudo service docker start

# Pull and run image
sudo docker run -p 3000:3000 -t -i mecatronicauncu/red-social-asociacion-dev
