#!/bin/bash

NEO4J_VER=2.2.5

BIN_DIR=bin
NEO4J_DIR=$BIN_DIR/neo4j-community-$NEO4J_VER
NEO4J_SERVER_CONF_FILE=$NEO4J_DIR/conf/neo4j-server.properties

CONS_DIV="#####################################"
R_COL="\e[31m"
Y_COL="\e[33m"
G_COL="\e[92m"
DEF_COL="\e[39m"

#----------------------------------------#

echo -e $G_COL$CONS_DIV"\n\n **Config script for Red-Social-Asociacion**\n\n"$CONS_DIV$DEF_COL

#----------------------------------------#

#----------------------------------------#
# Configure Neo4J Server
echo -e $G_COL"Configuring Neo4J Server...\n"$DEF_COL
sed -i "s/bms.security.auth_enabled=.*/bms.security.auth_enabled=true/" $NEO4J_SERVER_CONF_FILE
sed -i "s/org.neo4j.server.webserver.port=.*/org.neo4j.server.webserver.port=4550/" $NEO4J_SERVER_CONF_FILE
sed -i "s/org.neo4j.server.webserver.https.enabled=.*/org.neo4j.server.webserver.https.enabled=false/" $NEO4J_SERVER_CONF_FILE
sed -i "s/org.neo4j.server.webserver.https.port=.*/org.neo4j.server.webserver.https.port=4551/" $NEO4J_SERVER_CONF_FILE

#-----------------------------------------#
# Configure max open files
echo -e $G_COL"Configuring max number of open files...\n"$DEF_COL
if (( $(sudo sed -n "/neo4j.*/p" /etc/security/limits.conf | wc -l) > 0 ))
then
    echo -e $Y_COL"This is not the first time you run this script, or you configured the server manually. Replacing configuration...\n"$DEF_COL
    sudo sed -i '/#Neo4J.*/d' /etc/security/limits.conf
    sudo sed -i '/neo4j.*/d' /etc/security/limits.conf
fi
echo -e "#Neo4J Configuration\nneo4j   soft    nofile  40000\nneo4j   hard    nofile  40000" | sudo tee -a /etc/security/limits.conf >/dev/null 2>&1

sudo sed -i "/.*session.*required.*pam_limits.so.*/d" /etc/pam.d/su
echo -e "session\trequired\tpam_limits.so" | sudo tee -a /etc/pam.d/su >/dev/null 2>&1

#-----------------------------------------#
# Reset sudo timestamp
sudo -k

#-----------------------------------------#
# Create Dummy node:
# Requires a running server of Neo4J!
echo -e $G_COL"Creating dummy node...\n"$DEF_COL
./$NEO4J_DIR/bin/neo4j-shell -c 'CREATE (:DUMMY);' >/dev/null 2>&1 || { echo -e >&2 $R_COL"Could not create dummy node. Are you sure your Neo4J server is up and running?"$DEF_COL; exit 1; }

#-----------------------------------------#
# Done!
echo -e $G_COL"Config Ok!\n"$DEF_COL

#-----------------------------------------#
# Reminder
echo -e $Y_COL"*** Remember to restart the pc for the settings to take effect ! *** \n"$DEF_COL
