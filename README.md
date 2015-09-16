Red-Social-Asociacion
==========

## Objective

To implement a small social network for a student society.


## Linux install guide

1. Install dependencies: nodejs 0.10, ruby and git.
  1. Install Node Version Manager ([nvm](https://github.com/creationix/nvm))
  2. `nvm install 0.10`
  3. Install Ruby Version Manager with Ruby stable ([rvm](https://rvm.io/rvm/install)).
  4. Install git
  5. Reset
  6. `nvm use 0.10`.  You may need to add `.rvm/rubies/default/bin/` to PATH.
3. Clone repository
4. Execute `./setup.sh`. It will take some time, you may have a coffee.
5. Execute `./config.sh`. It will guide you through the configuration of
   the server. Follow the steps.

## Windows install guide

Get Linux.

## Run

1. Start [neo4j](http://neo4j.org/): `./neoRun`
2. Start [MongoDB](http://www.mongodb.org/): `./mongoRun`
3. Start server: `grunt serve`

## Files
```
|-- server.js           Server (expressjs) configuration 

|-- bin                 Binary files (neo4j and MongoDB). 
                        Available after running ```./setup.sh```.

|-- app                 Front-end stuff

    |-- views           Front-end html

    |-- scripts         Front-end js files

    |-- sass            Sass files which generate css

|-- routes

    |-- user.js         Database (neo4j) query functions 

    |-- users.js        Cookies, access restrictions, 
                        connection between neo4j and expressjs.

    |-- upload          Uploaded files (such as profile images) *
```

## TODO

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
