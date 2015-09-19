#!/bin/bash

# 1.

awk 'BEGIN{FS=","; print "firstName,lastName,email,password"} NR>1{print $1","$2","tolower($1)tolower($2)"@mecatronicauncu.org,"tolower($1)}' people.csv > people_email_pass.csv

# 2.

node peopleHashSalt.js

# 3.

node testDataset.js