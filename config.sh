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

#-----------------------------------------#

echo -e $G_COL$CONS_DIV"\n\n **Config script for Red-Social-Asociacion**\n\n"$CONS_DIV$DEF_COL

#-----------------------------------------#

#-----------------------------------------#
# Configure Neo4J Server
echo -e $G_COL"Configuring Neo4J Server...\n"$DEF_COL
sed -i "s/bms.security.auth_enabled=.*/bms.security.auth_enabled=true/" $NEO4J_SERVER_CONF_FILE
sed -i "s/org.neo4j.server.webserver.port=.*/org.neo4j.server.webserver.port=4550/" $NEO4J_SERVER_CONF_FILE
sed -i "s/org.neo4j.server.webserver.https.enabled=.*/org.neo4j.server.webserver.https.enabled=false/" $NEO4J_SERVER_CONF_FILE
sed -i "s/org.neo4j.server.webserver.https.port=.*/org.neo4j.server.webserver.https.port=4551/" $NEO4J_SERVER_CONF_FILE

#-----------------------------------------#
# Wait for user to start Neo4J server
echo -e $G_COL"Please start Neo4J server and press enter..."$DEF_COL
if [[ $# -eq 0 ]]
then
    read
elif [[ $# -eq 2 ]] && [[ "$2" = "NET" ]]
then
    echo -e $R_COL"Please give all arguments:\n\n- password\n- HOST_TYPE (LOC,LAN,NET)\n- SITE (if NET, e.g: mecatronicauncu.org)\n"$DEF_COL
    exit 1
elif [[ $# -gt 3 ]]
then
    echo -e $R_COL"Please give all arguments:\n\n- password\n- HOST_TYPE (LOC,LAN,NET)\n- SITE (if NET, e.g: mecatronicauncu.org)\n"$DEF_COL
    exit 1
fi

#-----------------------------------------#
# Create Dummy node:
# Requires a running server of Neo4J!
echo -e $G_COL"Creating dummy node...\n"$DEF_COL
./$NEO4J_DIR/bin/neo4j-shell -c 'CREATE (:DUMMY);' >/dev/null 2>&1 || { echo -e >&2 $R_COL"Could not create dummy node. Are you sure your Neo4J server is up and running?"$DEF_COL; exit 1; }

#-----------------------------------------#
# Create email constraint
echo -e $G_COL"Creating email uniqueness constraint...\n"$DEF_COL
./$NEO4J_DIR/bin/neo4j-shell -c 'CREATE CONSTRAINT ON (n:User) ASSERT n.email IS UNIQUE;' >/dev/null 2>&1 ||  { echo -e >&2 $R_COL"Could not create constraint. Are you sure your Neo4J server is up and running?"$DEF_COL; exit 1; }

#-----------------------------------------#
# Set new Neo4J server password
echo -e $G_COL"Setting the Neo4J server password..."$DEF_COL
if [[ $# -eq 0 ]]
then
    stty -echo
    printf $Y_COL"Enter your password: "$DEF_COL
    read PASSWORD
    printf "\n\n"
    stty echo
else
    PASSWORD="$1"
fi

curl -H "Content-Type: application/json" -X POST -d "{\"password\":\"$PASSWORD\"}" -u neo4j:neo4j http://localhost:4550/user/neo4j/password >/dev/null 2>&1 || { echo -e >&2 $R_COL"Could not change server password. Are you sure your Neo4J server is up and running?\n"$DEF_COL; exit 1; }

# Set Neo4J user and password in testDataset/{usersRel.js, regUsers.js}
sed -i "s/^\(.*\)'http.*:\/\/neo4j:.*@localhost:.*'$/\1'http:\/\/neo4j:$PASSWORD@localhost:4550'/" ./testDataset/usersRel.js
sed -i "s/^\(.*\)'http.*:\/\/neo4j:.*@localhost:.*'$/\1'http:\/\/neo4j:$PASSWORD@localhost:4550'/" ./testDataset/regUsers.js

#-----------------------------------------#
# Set Neo4J user and password in routes/user.js
sed -i "s/^\(.*\)'http.*:\/\/neo4j:.*@localhost:.*'$/\1'http:\/\/neo4j:$PASSWORD@localhost:4550'/" ./routes/user.js

#-----------------------------------------#
# Set host location in app.js
if [[ $# -eq 0 ]]
then
    hosts=("This computer only" "Local network" "The Internet")
    PS3="From where will Red-Social-Asociacion will be accessed? "
    echo -e $Y_COL
    select host in "${hosts[@]}"
    do
        case "$REPLY" in
            1 ) echo -e $G_COL"\nSetting host location to localhost..."$DEF_COL; sed -i "s/^\(.*\)this.host = .*;$/\1this.host = this.host_LOC;/" ./app/scripts/app.js; break;;
            2 ) echo -e $G_COL"\nSetting host location to this host LAN ip..."$DEF_COL; sed -i "s/^\(.*\)this.host_LAN = .*;$/\1this.host_LAN = 'https:\/\/$(hostname -i | sed -e 's/[[:blank:]]\+$//')';/" ./app/scripts/app.js; sed -i "s/^\(.*\)this.host = .*;$/\1this.host = this.host_LAN;/" ./app/scripts/app.js;break;;
            3 ) echo -e $G_COL"\nPlease enter your website: ";read SITE; sed -i "s/^\(.*\)this.host_NET = .*;$/\1this.host_NET = 'https:\/\/$SITE';/" ./app/scripts/app.js; sed -i "s/^\(.*\)this.host = .*;$/\1this.host = this.host_NET;/" ./app/scripts/app.js; break;;
            * ) echo "invalid";continue;;
        esac
    done
    echo -e $DEF_COL
else
    HOST_TYPE="$2"
    if [[ "$HOST_TYPE" = "LOC" ]]
    then
        sed -i "s/^\(.*\)this.host = .*;$/\1this.host = this.host_LOC;/" ./app/scripts/app.js
    elif [[ "$HOST_TYPE" = "LAN" ]]
    then
        sed -i "s/^\(.*\)this.host_LAN = .*;$/\1this.host_LAN = 'https:\/\/$(hostname -i | sed -e 's/[[:blank:]]\+$//')';/" ./app/scripts/app.js
        sed -i "s/^\(.*\)this.host = .*;$/\1this.host = this.host_LAN;/" ./app/scripts/app.js
    elif [[ "$HOST_TYPE" = "NET" ]]
    then
        SITE="$3"
        sed -i "s/^\(.*\)this.host_NET = .*;$/\1this.host_NET = 'https:\/\/$SITE';/" ./app/scripts/app.js
        sed -i "s/^\(.*\)this.host = .*;$/\1this.host = this.host_NET;/" ./app/scripts/app.js
    fi
fi

#-----------------------------------------#
# Create Self-Signed Certificate
echo -e $G_COL"Genearting self signed SSL certificate...\n"$DEF_COL
commonname=Red-Social-Asociacion
domain=$commonname
country=AR
state=Mendoza
locality=Mendoza
organization=Asociación\ de\ Mecatrónica\ de\ Mendoza
organizationalunit=IT
email=mecatronica-organizacion@lists.mecatronicauncu.org

# Optional
password=asoc

# Generate a key
openssl genrsa -des3 -passout pass:$password -out $domain.key 2048 -noout >/dev/null 2>&1

# Remove passphrase from the key. Comment the line out to keep the passphrase
openssl rsa -in $domain.key -passin pass:$password -out $domain.key >/dev/null 2>&1

# Create the request
openssl req -new -key $domain.key -out $domain.csr -passin pass:$password \
        -subj "/C=$country/ST=$state/L=$locality/O=$organization/OU=$organizationalunit/CN=$commonname/emailAddress=$email" >/dev/null 2>&1

openssl x509 -req -days 365 -in $domain.csr -signkey $domain.key -out $domain.crt >/dev/null 2>&1

#-----------------------------------------#
# Done!
echo -e $G_COL"Config Ok!\n"$DEF_COL

#-----------------------------------------#
# Tell user to configure max open files limit
echo -e $Y_COL"Yo!\n"$G_COL"Remember to set the number of allowed open files to 40000 or more. Read the Linux performance guide of Neo4J for details.\n"$DEF_COL

