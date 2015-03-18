Red-Social-Asociacion
==========

Este proyecto se inicia en el marco del módulo de "Conception des Aplications Interactives", de la [Escuela de Ingenieros de Brest - ENIB -](http://www.enib.fr/index.php/en/).

Originalmente se diseña una webapp para el contacto profesional entre estudiantes del [ENIB](http://www.enib.fr/index.php/en/).

En este repositorio encontrarás todo lo necesario para hacerla funcionar.

IMPORTANTE
==================

Con el agregado del algoritmo SHA-256 para encriptar las contraseñas, la base de datos antigua no es más funcional. Para testear la app, hay que registrar usuarios nuevos.

Por ahora se puede usar la que está en el repo, pero muy pronto se va a eliminar.

Al momento de crear o resetear la base de datos, es muy importante que se ejecute esta query de Cypher:
 - ```CREATE CONSTRAINT ON (n:User) ASSERT n.email IS UNIQUE;```

Cómo utilizar en linux
===================

1. Instalar [nodejs](http://nodejs.org/)
2. ```npm install -g yo```
3. ```npm install -g neo4j```
4. ```git clone https://github.com/MecatronicaUncu/Red-Social-Asociacion.git``` && ```cd $RED```. A partir de ahora llamaremos ```$RED``` al directorio donde se encuentra el clone del repo.
5. Instalar [neo4j](http://neo4j.org/). A partir de ahora llamaremos ```$NEO4J``` al directorio donde se encuentra la carpeta descomprimida de [neo4j](http://neo4j.org/). (De preferencia en ```$RED/$NEO4J```)
6. Configurar [neo4j](http://neo4j.org/): 
  1. ```/$NEO4J/conf/neo4j-server.properties``` : Cambiar la propiedad "database directory" para que apunte hacia la carpeta ```graph.db``` dentro de la carpeta del proyecto. Por default, la carpeta graph.db debe estar ubicada en ```/$NEO4J/data/graph.db```
  2. ```/$NEO4J/conf/neo4j.properties``` : Descomentar ```allow_store_upgrade=true```.
7. Instalar [Ruby](https://www.ruby-lang.org/es/).
8. Instalar [Sass](http://sass-lang.com/) y [Compass](http://compass-style.org):
  1. ```gem install sass```
  2. ```gem install compass```
  3. Verificar si están en el PATH, y de lo contrario (d)
  4. Agregar ```~.gem/ruby/2.1.0/bin``` y ```~.gem/ruby/2.1.0/gems/sass-3.4.6/bin``` al PATH
9. Instalar [MongoDB](http://docs.mongodb.org/manual/tutorial/install-mongodb-on-linux/). Seguir los pasos con estas indicaciones: La carpeta ```mongodb``` que se encuentre en ```$RED/mongodb``` y para el paso de creación de la carpeta de base de datos hacerla así: ```$RED$ mkdir -p /mongodata/db```
10. En la terminal:
  1. ```cd $RED```
  2. ```npm install```. Si esto no funciona, ```sudo npm install```
  3. ```bower install```
11. En ```app/scripts/app.js``` indicar el host utilizado con la variable ```host_LAN``` y seteando la variable ```host = host_LAN``` en el servicio ```session```.
12. Iniciar [neo4j](http://neo4j.org/): ```./neoRun```
13. Iniciar [MongoDB](http://www.mongodb.org/): ```./mongoRun```
14. Iniciar el server: ```grunt serve```
15. Si esto no funciona, tal vez sea un problema de la base de datos. Eliminarla y usar una base de datos nueva. Crear un usuario 'dummy' para no utilizar en ID==0.

Cómo utilizar en Windows
===================

TODO

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

TODO
===================

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
