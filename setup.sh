#!/bin/bash

NODEJS_VER=0.10
NEO4J_VER=2.2.5
MONGODB_VER=3.0.6
NEO4J_FILE=neo4j-community-$NEO4J_VER-unix.tar.gz
MONGO_FILE=mongodb-linux-x86_64-$MONGODB_VER.tgz

BIN_DIR=bin
NEO4J_DIR=neo4j-community-$NEO4J_VER

CONS_DIV="#####################################"
G_COL="\e[92m"
DEF_COL="\e[39m"

#----------------------------------------#
# Cleanup bin directory
rm -rf $BIN_DIR
mkdir $BIN_DIR

#----------------------------------------#
# Create download dir
TMP_DOWNLOAD_DIR=tmp_download_dir
mkdir -p $TMP_DOWNLOAD_DIR

#----------------------------------------#
# Install Ruby Version Manager & Ruby
echo -e $G_COL$CONS_DIV
echo -e "Installing Ruby Version Manager and Ruby...\n"
echo -e $CONS_DIV$DEF_COL
# 1. First check if installed
# TODO
# 2. First isntall public key
gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
# 3. Install RVM stable with ruby
curl -sSL https://get.rvm.io | bash -s stable --ruby

#----------------------------------------#
# Install Node Version Manger
echo -e $G_COL$CONS_DIV
echo -e "Installing Node Version Manager..."
echo -e $CONS_DIV$DEF_COL
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.26.1/install.sh | bash

#----------------------------------------#
# Make nvm() available in this script
. ~/.nvm/nvm.sh

#----------------------------------------#
# Install NodeJS v0.10
echo -e $G_COL$CONS_DIV
echo -e "Installing NodeJS $NODE_VER"
echo -e $CONS_DIV$DEF_COL
nvm install 0.10
nvm use 0.10

#----------------------------------------#
# Install yo, bower and neo4j
echo -e $G_COL$CONS_DIV
echo -e "Installing nodejs packages globally (Yeoman, Neo4j and Bower)"
echo -e $G_COL$CONS_DIV
for nprog in "yo" "neo4j" "bower"
do
  npm install -g $nprog || { echo 'npm $nprog failed' ; exit 1; }
done

#----------------------------------------#
# Download Neo4J
echo -e $G_COL$CONS_DIV
echo -e "Installing Neo4J Engine..."
echo -e $CONS_DIV$DEF_COL
cd $TMP_DOWNLOAD_DIR
if [[ ! -e $NEO4J_FILE ]] || [[ ! -f $NEO4J_FILE ]]
then
    wget http://dist.neo4j.org/neo4j-community-$NEO4J_VER-unix.tar.gz
fi

# untar and move
tar -zxvf neo4j-community-$NEO4J_VER-unix.tar.gz
cd ..

mv $TMP_DOWNLOAD_DIR/neo4j-community-$NEO4J_VER $BIN_DIR

NEO4J_DIR=$BIN_DIR/neo4j-community-$NEO4J_VER

# copy config files
cp -R default/neo4j-community-2.1.5/* $NEO4J_DIR

#----------------------------------------#
# Install Sass and Compass
echo -e $G_COL$CONS_DIV
echo -e "Installing Sass and Compass..."
echo -e $CONS_DIV$DEF_COL
for rprog in "sass" "compass"
do
  gem install $rprog || { echo 'gem $rprog failed' ; exit 1; }
done

#----------------------------------------#
# Install and configure MongoDB
echo -e $G_COL$CONS_DIV
echo -e "Installing MongoDB..."
echo -e $CONS_DIV$DEF_COL
cd $TMP_DOWNLOAD_DIR
if [[ ! -e $MONGO_FILE ]] || [[ ! -f $MONGO_FILE ]]
then
    curl -O https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-$MONGODB_VER.tgz
fi
#curl -O http://localhost:8000/Volatile/mongodb-linux-x86_64-$MONGODB_VER.tgz
tar -zxvf $MONGO_FILE 
cd ..
mkdir -p $BIN_DIR/mongodb
cp -R -n $TMP_DOWNLOAD_DIR/mongodb-linux-x86_64-$MONGODB_VER/ $BIN_DIR/mongodb
mkdir -p mongodata/db

# Get npm and bower dependencies
echo -e $G_COL$CONS_DIV
echo -e "Installing Npm and Bower dependencies..."
echo -e $CONS_DIV$DEF_COL
npm install .
bower install

#----------------------------------------#
# remove temp download dir
#rm -rf $TMP_DOWNLOAD_DIR

#----------------------------------------#
# Create service start and shutdown scripts
echo -e $G_COL$CONS_DIV
echo -e "Installing service start and shutdown scripts..."
echo -e $CONS_DIV$DEF_COL

echo "#!/bin/bash
./bin/neo4j-community-$NEO4J_VER/bin/neo4j start -server -Xmx512M -XX:+UseConcMarkSweepGC" > neoRun
chmod +x neoRun

echo "#!/bin/bash
./bin/neo4j-community-$NEO4J_VER/bin/neo4j stop" > neoStop
chmod +x neoStop

echo "#!/bin/bash
./bin/mongodb/mongodb-linux-x86_64-$MONGODB_VER/bin/mongod --dbpath ./mongodata/db/" > mongoRun
chmod +x mongoRun

echo "#!/bin/bash
./bin/mongodb/mongodb-linux-x86_64-$MONGODB_VER/bin/mongod --shutdown --dbpath mongodata/db" > mongoStop
chmod +x mongoStop

echo -e $G_COL$CONS_DIV
echo -e "Creating Dummy Node in Database..."
echo -e $CONS_DIV$DEF_COL
./$BIN_DIR/$NEO4J_DIR/bin/neo4j-shell -c 'CREATE (:DUMMY);'
