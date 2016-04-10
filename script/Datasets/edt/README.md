Test dataset for the Emploi du Temps
==

This will generate a simple hierarchy for the case of the [National University of Cuyo](https://www.uncu.edu.ar).

## Run

`./bootstrap/edt/edt`

These are the users involved:

- Universidad Nacional de Cuyo
 - Rector -> Laurence Pray (laurencepray@mecatronicacunu.org)
- Facultad de Ingeniería
 - Decano -> Golden Cornman (goldencornman@mecatronicauncu.org)
- Ingeniería en Mecatrónica 
 - Director -> Vicky Culligan (vickyculligan@mecatronicauncu.org)
- Informática
 - Profesor Titular -> Clarice Northrop (claricenorthrop@mecatronicauncu.org)
- Análisis Matemático I
 - Profesor Adjunto -> Osvaldo Bagnell (osvaldobagnell@mecatronicauncu.org)
- Producmática
 - Profesor JTP -> Terin Aly (terinaly@mecatronicauncu.org)

Remember that the username equals the email and the password equals the first name in lowercase.

## Use

There exists a relationship of type `ADMINS` from the user to a given node.
Each user listed above can modify the nodes downstream its `ADMINS` relationship, i.e., **Laurence Pray** can
add nodes to **Ingeniería en Mecatrónica** but Osvaldo Bagnell can't add nodes to **Facultad de Ingeniería**.

This is not true when the user wants to create an activity.
He/She can only add activities associated with the nodes he/she has relationships with and whose type differs from `ADMINS`.
In other words, an administrator can not add activities to a node. He/She can only administrate it.

For the moment, at the time of defining someone as part of a node (like a director of some institute)
he/she is also defined as administrator. This may not be the expected behavior and thus could be changed anytime.
