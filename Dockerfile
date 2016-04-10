FROM ubuntu:16.04

# Expose required port
EXPOSE 3000

WORKDIR /red-social-asoc

# ciao sh
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

RUN apt-get update
RUN apt-get install -y git
RUN apt-get install -y nodejs
RUN apt-get install -y npm
RUN apt-get install -y ruby ruby-dev
RUN apt-get install -y curl
RUN apt-get install -y openjdk-8-jre-headless
RUN apt-get install -y lsof

# Install sudo
RUN apt-get install -y sudo

# Create symlink for node package
RUN ln -s /usr/bin/nodejs /usr/bin/node

# Install bower and grunt-cli globally, avoid this step in bootstrap/setup
RUN npm install -g bower
RUN npm install -g grunt-cli

# Install required gems
RUN gem install sass
RUN gem install compass

# Create simple user (but with sudo privileges) and use it!
RUN groupadd -r swuser -g 433
RUN useradd -u 431 -r -g swuser -d /red-social-asoc -s /sbin/nologin -c "Docker image user" swuser
RUN chown -R swuser:swuser /red-social-asoc
RUN adduser swuser sudo
RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers
USER swuser

# Clone repo
RUN git clone https://github.com/mecatronicauncu/Red-Social-Asociacion.git
RUN cd Red-Social-Asociacion && git checkout develop

# Install scripts in social network
RUN cd Red-Social-Asociacion && ./script/bootstrap -v

# Config for lan use
RUN cd Red-Social-Asociacion && ./script/config -h LAN -nomail

# Setup some users
RUN cd Red-Social-Asociacion && ./script/Datasets/userBase/userBase no-wait

# Setup some nodes for the EDT
RUN cd Red-Social-Asociacion && ./script/Datasets/edt/edt no-wait

# Entry point command: build and run tests on project, then launch
# server
CMD cd Red-Social-Asociacion && ./server/bin/neoRun && grunt watch
