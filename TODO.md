[x]agregar efecto scroll fade a ayuda page: https://ui.shadcn.com/docs/utils/scroll-fade
[ ]skeleton actualizar en dashboard

[x] realizar seo de la pagina
[x] accesiblidad de la pagina (WCAG 2.2 AA — 32 issues resueltos)
[ ] agregar fotos a cursos (link en base de datos, y imagenes en el servidor)
[ ] posibilidad de compartir o ver cursos de amigos
[ ] revisar mobile responsive

## Future Features

### PWA (Progressive Web App)
- [ ] Agregar manifest.json con iconos (192, 512, maskable)
- [ ] Configurar service worker con serwist (next-pwa está deprecated)
- [ ] Agregar meta tags: theme-color, apple-mobile-web-app-capable
- [ ] Implementar push notifications para recordatorios de racha diaria
- **Beneficio real**: push notifications para mantener la racha. Lo demás es cosmético.
- **Nota**: la app necesita Neon para todo, así que offline no aplica.

### localStorage Cache (React Query Persist)
- [ ] Instalar @tanstack/query-persist-client-core
- [ ] Configurar createSyncStoragePersister con localStorage
- [ ] Persistir cache de cursos y dashboard (lecturas)
- [ ] Las escrituras van a DB y refrescan el cache
- **Beneficio**: carga instantánea al abrir la app, sin consultar Neon cada vez.
- **Tradeoff**: no sync entre dispositivos (Neon lo da gratis).
- **Idea**: usar staleTime alto para cursos (ej. 1 hora) ya que no cambian seguido.
- **Referencia**: https://tanstack.com/query/latest/docs/framework/react/plugins/persistQueryClient
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


