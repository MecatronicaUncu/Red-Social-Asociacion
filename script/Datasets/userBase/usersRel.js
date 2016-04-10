var csv = require("fast-csv");
var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase(
    process.env['NEO4J_URL'] ||
    process.env['GRAPHENEDB_URL'] ||
    'http://neo4j:neo@localhost:7474'
);

var usersIDs = [];

var friend = function (userId, otherId) {

    var query = [
        'MATCH (user1:User),(user2:User)',
        'WHERE ID(user1)='+userId.toString()+' and ID(user2)='+otherId.toString(),
        'MERGE (user1)-[:FRIENDS]->(user2)'
    ].join('\n');

    db.query(query, null, function (err) {
        if(err){
            console.log("err friend sbdy");
            return 1;
        }
        return 0;
    });
};

csv
 .fromPath("usersIDs.csv")
 .on("data", function(ids){
 	ids.forEach(function(id){
 		usersIDs.push(id);
 	});
 })
 .on("end", function(){
 	// Create 5 isolated groups of Friends
	var groups = [];
	for (var i = 0; i < 5; i++) {
		groups[i] = usersIDs.slice(i*10,(i+1)*10);
	}

	// Create in-group friendships
	groups.forEach(function(group){
		for (var i = 0; i < group.length; i++){
			for (var j = i+1; j < group.length; j++){
				friend(group[i],group[j]);
				friend(group[j],group[i]);
			}
		}
	});

	// Create some random inter-group friendships (A)
	var chosen = [Math.floor(Math.random()*9), Math.floor(Math.random()*9), Math.floor(Math.random()*9)];
	for(var g = 0; g < groups.length; g++){
		for (var i = 0; i < groups[g].length; i++){
			chosen.forEach(function(ch){
				friend(groups[g][0],groups[(g+1)%5][ch]);
				friend(groups[(g+1)%5][ch],groups[g][0]);
			});
		}
	};

	// Create some random inter-group friendships (B)
	chosen = [Math.floor(Math.random()*9), Math.floor(Math.random()*9), Math.floor(Math.random()*9)];
	for(var g = 0; g < groups.length; g++){
		for (var i = 0; i < groups[g].length; i++){
			chosen.forEach(function(ch){
				friend(groups[g][3],groups[(g+3)%5][ch]);
				friend(groups[(g+3)%5][ch],groups[g][3]);
			});
		}
	};

	return;

 });
