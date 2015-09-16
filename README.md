Red-Social-Asociacion
==========

Este proyecto se inicia en el marco del módulo de "Conception d'Aplications Interactives", de la [Escuela de Ingenieros de Brest - ENIB -](http://www.enib.fr/index.php/en/).

Originalmente se diseña una webapp para el contacto profesional entre estudiantes del [ENIB](http://www.enib.fr/index.php/en/).

En este repositorio encontrarás todo lo necesario para hacerla funcionar.

IMPORTANTE
==================

Con el agregado del algoritmo SHA-256 para encriptar las contraseñas, la base de datos antigua no es más funcional. Para testear la app, hay que registrar usuarios nuevos.

Por ahora se puede usar la que está en el repo, pero muy pronto se va a eliminar.

Linux install
===================

1. Install dependencies: nodejs 0.10, ruby and git.
  1. Install Node Version Manager ([nvm](https://github.com/creationix/nvm))
  2. `nvm install 0.10`
  3. Install Ruby Version Manager with Ruby stable ([rvm](https://rvm.io/rvm/install)).
  4. Install git
  5. Reset
  6. `nvm use 0.10`.  You may need to add `.rvm/rubies/default/bin/` to PATH.
3. Clone repository
4. Execute `./setup.sh`. It will take some time, you may have a coffee.
5. Execute `./config.sh`. It will guide you through the configuration of the server. Follow the steps.

Execute (in different terminals)
===================
1. Start [neo4j](http://neo4j.org/): `./neoRun`
2. Start [MongoDB](http://www.mongodb.org/): `./mongoRun`
3. Start server: `grunt serve`

Windows install
===================

Get linux.

Archivos
===================

La carpeta ```app``` contiene todo lo referido al Front-End de la web.

El archivo ```server.js``` contiene la configuración del servidor [express](http://expressjs.com/) y las direcciones que llaman a las diferentes funciones del Back-End.

El archivo ```routes/users.js``` implementa las funciones necesarias para asegurar el funcionamiento del sitio, como el manejo de cookies, la verificación de permisos, y la conección entre el servidor [express](http://expressjs.com/) y la base de datos [neo4j](http://neo4j.org/).

El archivo ```routes/user.js``` implementa las funciones que consultan la base de datos [neo4j](http://neo4j.org/).

La carpeta ```routes/upload``` contiene las imágnes de perfil de los usuarios.

La carpeta ```app/views``` contiene los archivos html del Front-End

La carpeta ```app/scripts``` contiene los archivos javascripts que permiten el funcionamiento del Front-End

La carpeta ```app/sass``` contiene los arhivos de estilo [Sass](http://sass-lang.com/) sin compilar

The folder ```bin``` contains binary files (neo4j and MongoDB). Please
note that this folder is available after running ```./setup.sh```

TODO
===================

- [ ] Check update script. Execute db query automatically.
- [ ] ~~Normalize the way the _ids_ are passed to the _GET_ and _POST_ methods. (Sometimes in _req.params_, sometimes in _req.body_)~~ **No se puede enviar en _req.body_ si es un método _GET_**
- [ ] Show an error message when the signup process fails.
- [ ] Links to users profiles by clicking on their names
- [ ] Allow password recovery.
- [ ] COMMENT CODE
- [ ] Refresh profile.
- [ ] Tamaño de imagenes.
- [ ] Esqueleto para agregar utilities.
- [ ] Enviar Errores verbose desde express al sing(up/in) para mostrarlos directamente en el mensaje de error.
- [ ] Limpiar el Gruntfile.js
- [ ] Arreglar los warning de deprecated
- [ ] Agregar CSS responsive
- [ ] Terminar de parametrizar los estilos en Sass
- [ ] Validación de formulario (que es una table por ahora) en el perfil al modificarlo.
- [x] Ver seguridad [acá](https://crackstation.net/hashing-security.htm)
- [ ] Agregar SSL entre localhost y BDD (pensar si es necesario, puede alguien identificarse remotamente como localhost y asi queryar a la BDD?).
- [ ] Agregar CAPTCHA (esto puede servir si hay riesgo de un ataque masivo, con el objetivo de embocarnos el server, evaluar la necesidad)
- [ ] Tecnicas de hasheado avanzadas, especificamente el slow hashing y hashing encriptado.
- [ ] Hashing en el navegador ?
- [ ] Politica de contrasenas dificiles
- [ ] Cambio de contrasena cada tanto tiempo
