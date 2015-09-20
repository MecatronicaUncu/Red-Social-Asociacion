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
read

# 1. Check that node in present
loggerGreen "Checking dependencies...\n"
command -v node >/dev/null 2>&1 || { loggerRed "node not installed!"; exit 1; }
loggerGreen "Dependencies OK!\n"

# 2. Create name-based emails and passwords
loggerGreen "Creating name-based emails and passwords..."
awk 'BEGIN{FS=","; print "firstName,lastName,email,password"} NR>1{print $1","$2","tolower($1)tolower($2)"@mecatronicauncu.org,"tolower($1)}' people.csv > people_email_pass.csv

# 3. Hash passwords and create salt
loggerGreen "Hashing passwords and creating salt..."
node peopleHashSalt.js

# 4. Register users in Neo4J
loggerGreen "Registering users in database..."
node regUsers.js

# 5. Create relationships
loggerGreen "Creating relationships..."
#node usersRel.js

# 6. Done
loggerGreen "Dataset created!"

