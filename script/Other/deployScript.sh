#!/bin/bash

# This script is intended to create a fast instance of
# Red-social-asociacion in a VPS running ubuntu (14.04).

# Add a swap file
sudo dd if=/dev/zero of=/var/swapfile bs=1M count=2048
sudo chmod 600 /var/swapfile
sudo mkswap /var/swapfile
echo /var/swapfile none swap defaults 0 0 | sudo tee -a /etc/fstab
sudo swapon -a

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
