var cluster = require('cluster'),
    https = require('https'),
    domain = require('domain'),
    config = require('./config/config.js'),
    numCPU = require('os').cpus().length,
    app = require('./server.js'),
    passphrase = 'mecuncu',
    key_file = './server/Red-Social-Asociacion.key',
    cert_file = './server/Red-Social-Asociacion.crt',
    fs = require('fs'),
    https_config = {
        key: fs.readFileSync(key_file),
        cert: fs.readFileSync(cert_file),
        passphrase: passphrase
    };

    // You'd put your fancy application logic here.
    function handleRequest(req, res) {
        switch(req.url) {
                case '/error':
                        // We do some async stuff, and then...
                    setTimeout(function() {
                        // Whoops!
                        flerb.bark();
                    });
                    break;
            default:
                    res.end('ok');
        }
    }

/******************************************************************************/
/*                           START SERVER                                     */
/******************************************************************************/
if (cluster.isMaster) {
    // Si el proceso es el proceso maestro se crean los procesos worker
    for (var i = 0; i < numCPU; i++) {
        cluster.fork();
    }

    cluster.on('disconnect', function(worker) {
        console.log('worker ' + worker.process.pid + ' died');
        cluster.fork();
    });
} else {
    var server = https.createServer(https_config, app, function(request, response) {
        var d = domain.create();
        d.on('error', function(err) {
            console.log(err.stack);

            try {
                // Ten minutes to let other connections finish:
                var killTimer = setTimeout(function() {
                    process.exit(1);
                }, 30000);
                killTimer.unref(); // Don't stay up just for the timer
                server.close(); // stop taking new requests.
                cluster.worker.disconnect(); // Let the master know we're dead.
                // try to send an error to the request that triggered the problem
                res.statusCode = 500;
                res.setHeader('content-type', 'text/plain');
                res.end('Oops, there was a problem!\n');
            } catch (err2) {
                console.log("Error handling error!: " + err2);
            }
        });

        d.add(request);  // Explicit binding
        d.add(response); // Explicit binding

        d.run(function() {
            handleRequest(req, res);
        });
    }).listen(config.portServ, function () {
        console.log("Express HTTPS server listening on port " + config.portServ);
    });
}
