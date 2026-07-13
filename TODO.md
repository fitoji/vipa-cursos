[x] realizar seo de la pagina
[ ] accesiblidad de la pagina
[ ] agregar fotos a cursos (link en base de datos, y imagenes en el servidor)
[ ] posibilidad de compartir o ver cursos de amigos
[ ] revisar mobile responsive
11/07/26
[x] agregar modo dark / light
[x] utilizar los estilos de midnight.css
[x] agregar header y footer
[x] si esta logeado el boton empezar ahora en landing (hide)
[x] si no hay sesion, ocultar boton cerrar sesion, y mostrar boton iniciar sesion o registrarse
[x] sacar historial en mis cursos
[x] en sidebar de panel de control, boton de descargar datos en json (descarga todos los cursos ingresados por el usuario en formato json)
[x] si no hay ningun curso ingresado, mostrar mensaje de "no hay cursos" en lugar de la lista vacia. ademas agregar un ayuda si el usuario tiene datos cargados en un excel o documento word con un prompt para con chatgpt convertir esos datos al formato json y cargarlos en la aplicacion.
[x] quiero que en el formulario en la parte de pais cargue los paises donde se hacen los cursos, en nuestra db tenemos una tabla de paises donde se almacenan los paises donde se hacen los cursos.(hazlo de la manera mas eficiente posible, cacheando los paises ya cargados en memoria o en el localStorage,tenemos una tabla de paises en nuestra db, tambien dejar la posibilidad de ingresar un nuevo pais en el formulario.
[x] hacer lo mismo con lugar: buscar en nuestra db los lugares donde se hacen los cursos y mostrarlos en el formulario, cacheando los lugares ya cargados en memoria o en el localStorage, tenemos una tabla de lugares en nuestra db, y dejar la posibilidad de ingresar un nuevo lugar en el formulario. Ahora los lugares se filtran por el pais seleccionado.
[x] cachea los paises y lugares y la seccion centros de vipassana ya cargados en memoria o en el localStorage, para evitar hacer consultas a la db cada vez que se cargue la pagina.
[x] en mis cursos, el boton panel de control a la derecha de importar json.
