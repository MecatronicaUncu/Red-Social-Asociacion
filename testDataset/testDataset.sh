#!/bin/bash

LOG_FILE=setup.log

CONS_DIV="##################################################"
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

#---------------------------------------

# 0. Welcome message
loggerGreen $CONS_DIV"\nThis script will populate your Neo4J database with 50 users, and some relationships. Press Enter to continue or Ctrl-C to abort."
if [[ $# -ne 0 ]] && [[ "$1" = "no-wait" ]]
then
    :
else
    read
fi

# 1. Check that node in present
loggerGreen "Checking dependencies...\n"
command -v node >/dev/null 2>&1 || { loggerRed "NodeJS not installed!"; exit 1; }
command -v npm >/dev/null 2>&1 || { loggerRed "npm not installed!"; exit 1; }
npm install fast-csv >/dev/null 2>&1 || { loggerRed "npm fast-csv failed!"; exit 1; }
loggerGreen "Dependencies OK!\n"

# 2. Create name-based emails and passwords
loggerGreen "Creating name-based emails and passwords...\n"
awk 'BEGIN{FS=","; print "firstName,lastName,email,password"} NR>1{print $1","$2","tolower($1)tolower($2)"@mecatronicauncu.org,"tolower($1)}' people.csv > people_email_pass.csv

# 3. Create node data
loggerGreen "Creating node data (hash, salt, picture url, language, etc)...\n"
node peopleData.js

# 4. Register users in Neo4J
loggerGreen "Registering users in database...\n"
node regUsers.js > usersIDs.csv

# 5. Create relationships
loggerGreen "Creating relationships...\n"
node usersRel.js

# 6. Download pictures for users
loggerGreen "Downloading random profile pictures. This may take a while...\n"
mkdir -p ./routes/upload
./getPictures.sh

# 7. Done
loggerGreen "Dataset created!\n"
