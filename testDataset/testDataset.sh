#!/bin/bash

NODEJS_VER=0.10
NEO4J_VER=2.2.5
MONGODB_VER=3.0.6
NEO4J_FILE=neo4j-community-$NEO4J_VER-unix.tar.gz
MONGO_FILE=mongodb-linux-x86_64-$MONGODB_VER.tgz
LOG_FILE=setup.log

BIN_DIR=bin
NEO4J_DIR=$BIN_DIR/neo4j-community-$NEO4J_VER

CONS_DIV="#####################################"
R_COL="\e[31m"
G_COL="\e[92m"
DEF_COL="\e[39m"

function loggerGreen {
    echo -e $G_COL$1$DEF_COL
    echo -e $1 >> $LOG_FILE
}
            
function loggerRed {
    echo -e >&2 $R_COL$1$DEF_COL
    echo -e $1 >> $LOG_FILE
}

# 0. Welcome message
loggerGreen $CONS_DIV"\nThis script will populate your Neo4J database with 50 users, and some relationships. Press Enter to continue or Ctrl-C to abort."
read

# 1. Create name-based emails and passwords
loggerGreen "Creating name-based emails and passwords..."
awk 'BEGIN{FS=","; print "firstName,lastName,email,password"} NR>1{print $1","$2","tolower($1)tolower($2)"@mecatronicauncu.org,"tolower($1)}' people.csv > people_email_pass.csv

# 2. Hash passwords and create salt
loggerGreen "Hashing passwords and creating salt..."
node peopleHashSalt.js

# 3. Register users in Neo4J
loggerGreen "Registering users in database..."
node regUsers.js

# 4. Create relationships
loggerGreen "Creating relationships..."
#node usersRel.js

# 5. Done
loggerGreen "Dataset created!"

