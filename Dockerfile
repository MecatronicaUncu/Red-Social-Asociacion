FROM ubuntu:16.04

# Expose required port
EXPOSE 3000

WORKDIR /red-social-asoc

# ciao sh
RUN 	rm /bin/sh && ln -s /bin/bash /bin/sh && \
	apt-get update && \
	apt-get install -y git && \
	apt-get install -y curl && \
# Install sudo
	apt-get install -y sudo && \
	curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash - && \
	sudo apt-get install -y nodejs && \
	apt-get install -y ruby ruby-dev && \
	apt-get install -y openjdk-8-jre-headless && \
	apt-get install -y lsof && \
# Install bower and grunt-cli globally, avoid this step in bootstrap/setup
	npm install -g bower && \
	npm install -g grunt-cli && \
# Install required gems
	apt-get install -y gcc && \
	apt-get install -y build-essential && \
	gem install sass && \
	gem install compass && \
# Create simple user (but with sudo privileges) and use it!
	groupadd -r swuser -g 433 && \
	useradd -u 431 -r -g swuser -d /red-social-asoc -s /sbin/nologin -c "Docker image user" swuser && \
	chown -R swuser:swuser /red-social-asoc && \
	adduser swuser sudo && \
	echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

USER swuser

# Hack to force a rebuild of the repo, from this point
ADD http://www.random.org/strings/?num=10&len=8&digits=on&upperalpha=on&loweralpha=on&unique=on&format=plain&rnd=new uuid

# Clone repo
RUN 	git clone https://github.com/mecatronicauncu/Red-Social-Asociacion.git && \
 # DO NOT REMOVE the following line, it is automatically changed by
 # travis when building the images (and it does not hurt the "normal"
 # user)
	cd Red-Social-Asociacion && git checkout develop && \
# Print current commit SHA in index.html
	sed -i 's/Ver xxx/Ver. '"$(git rev-list --count HEAD)"'.'"$(git rev-parse --short HEAD)"'/' src/index.html && \
# Install scripts in social network
	./script/bootstrap -v && \
# Config for lan use
	./script/config -p asoc -h LAN -nomail && \
# Setup some users
	./script/Datasets/userBase/userBase no-wait && \
# Setup some nodes for the EDT
	./script/Datasets/edt/edt no-wait

# Entry point command: build and run tests on project, then launch
# server
CMD cd Red-Social-Asociacion && ./script/Neo4j/neoStart && grunt watch
