# クロネコエンジン 2.0

Aplicacion web Angular para `クロネコプロジェクト`, orientada a centralizar enlaces publicos, acceso VIP y gestion manual de solicitudes para una galeria exclusiva.

El sitio funciona como una entrada tipo LinkTree: el contenido gratuito vive en Pixiv y X, y los enlaces publicos se pueden administrar desde `/admin` usando Google Sheets como fuente de datos. El acceso VIP se realiza con `userCode` y `accessKey`, emitidos luego de una revision manual desde el panel de administracion.

## Flujo principal

```text
Usuario
  -> LinkTree
  -> Pixiv / X / enlaces configurados / VIP Access Center
  -> Solicitud o login VIP
  -> Galeria exclusiva
  -> VIP Request Board
```

## Rutas

| Ruta | Descripcion |
| --- | --- |
| `/` | LinkTree principal |
| `/access` | Centro de acceso VIP |
| `/access/login` | Login con ID y clave VIP |
| `/access/request` | Formulario de solicitud VIP |
| `/access/status` | Consulta de estado de solicitud |
| `/gallery` | Galeria exclusiva protegida |
| `/vip-board` | Tablero VIP de sugerencias |
| `/admin` | Panel administrador oculto por ruta directa |
| `/**` | Pantalla 404 futurista |

## Funcionalidades principales

- LinkTree publico con enlaces oficiales configurables desde el panel administrador.
- Contador de visitas con control por sesion.
- Sistema de traducciones para japones, espanol, ingles, chino simplificado y chino tradicional.
- Centro VIP con solicitud, consulta de estado y login.
- Persistencia de sesion VIP en `sessionStorage`.
- Galeria exclusiva cargada solo con `userCode` y `accessKey` validos.
- Slideshow fullscreen con navegacion, zoom y pan.
- Tablero VIP para sugerir proximas ilustraciones.
- Panel admin para revisar solicitudes, aprobar, rechazar, pedir mas informacion, listar claves, extender/desactivar accesos, gestionar galeria y administrar el LinkTree publico.
- Pagina 404 personalizada.
- Estilos responsive con estetica oscura japonesa/cyberpunk.

## Tecnologias

- Angular 20
- TypeScript strict
- Angular standalone components
- Angular Router
- Angular Signals
- Zoneless change detection
- SCSS
- Google Apps Script
- Google Sheets
- GitHub Pages

## API y backend

El backend actual esta implementado con Google Apps Script conectado a Google Sheets.

Endpoint base:

```text
https://script.google.com/macros/s/AKfycbwgltvyDH_CcikA1_V54LNm1gEmaho_mtrDAaqnukfC3Ou6M3O05nbYzSHtvPG-G_P8/exec
```

Acciones publicas usadas por la app:

- `health`
- `counter=get`
- `counter=increment`
- `request_access`
- `check_request_status`
- `validate_access_key`
- `get_exclusive_gallery`
- `save_vip_illustration_request`
- `get_vip_illustration_requests`
- `get_linktree_config`

Acciones administrativas usadas por `/admin`:

- `admin_get_access_requests`
- `admin_get_access_keys`
- `admin_get_gallery_items`
- `admin_add_gallery_item`
- `admin_update_gallery_item`
- `admin_disable_gallery_item`
- `admin_delete_gallery_item`
- `admin_get_vip_illustration_requests`
- `admin_update_vip_illustration_request_status`
- `admin_get_linktree_config`
- `admin_update_linktree_settings`
- `admin_add_linktree_item`
- `admin_update_linktree_item`
- `admin_set_linktree_item_status`
- `admin_delete_linktree_item`
- `approve_access_request`
- `reject_access_request`
- `need_more_info_request`
- `disable_access_key`
- `extend_access_key`

Hojas usadas por Apps Script:

- `GALLERY_ITEMS`
- `VISITS`
- `ACCESS_REQUESTS`
- `ACCESS_KEYS`
- `VIP_ILLUSTRATION_REQUESTS`
- `LINKTREE_ITEMS`
- `LINKTREE_SETTINGS`

Para migrar sin borrar datos existentes, ejecutar `setupKuronekoSheetsWithoutReset()` desde Apps Script. La rutina crea columnas faltantes y agrega defaults solo cuando corresponde.

Las credenciales administrativas no deben guardarse en el frontend, en archivos del proyecto, en Git ni en logs. El panel `/admin` las solicita en tiempo de uso y las mantiene solo durante la sesion actual.

## Seguridad y acceso

- La galeria no es publica.
- El acceso a `/gallery` y `/vip-board` requiere una sesion VIP valida.
- Las credenciales admin solo sirven para revisar/aprobar solicitudes y administrar claves.
- Las credenciales admin no otorgan acceso directo a la galeria.
- GitHub Pages sirve un frontend publico, por lo que ningun secreto debe quedar dentro del bundle.
- No se deben commitear `adminPassword`, claves reales de acceso, tokens ni datos privados.

## Desarrollo local

Instalar dependencias:

```bash
npm install
```

Iniciar servidor local:

```bash
npm start
```

Build de desarrollo:

```bash
ng build --configuration development
```

Typecheck de la app:

```bash
tsc --noEmit -p tsconfig.app.json
```

Typecheck de tests:

```bash
tsc --noEmit -p tsconfig.spec.json
```

Tests unitarios:

```bash
ng test --watch=false --browsers=ChromeHeadless
```

Si Chrome no esta disponible en el entorno local, configurar `CHROME_BIN` apuntando a un navegador compatible, por ejemplo Microsoft Edge en Windows.

## Deploy

Destino de publicacion:

```text
https://kuronekosystem.github.io/kuroneko2.0/
```

El proyecto se publica bajo el subpath del repositorio:

```text
/kuroneko2.0/
```

La configuracion de produccion en `angular.json` usa:

- `baseHref`: `/kuroneko2.0/`
- `deployUrl`: `/kuroneko2.0/`
- assets copiados desde `public/`
- salida de build: `dist/kuroneko2.0/browser`

Build local para GitHub Pages:

```bash
npm run build:gh-pages
```

Este comando ejecuta el build de produccion y luego prepara compatibilidad SPA para GitHub Pages:

- valida que `index.html` contenga `<base href="/kuroneko2.0/">`
- copia `index.html` como `404.html`
- crea `.nojekyll`

Archivos esperados en la salida:

```text
dist/kuroneko2.0/browser/index.html
dist/kuroneko2.0/browser/404.html
dist/kuroneko2.0/browser/.nojekyll
```

La copia `404.html` permite refrescar o entrar directamente a rutas internas como:

```text
https://kuronekosystem.github.io/kuroneko2.0/admin
https://kuronekosystem.github.io/kuroneko2.0/gallery
https://kuronekosystem.github.io/kuroneko2.0/access
```

### GitHub Actions

El workflow de deploy esta en:

```text
.github/workflows/deploy-gh-pages.yml
```

Se ejecuta automaticamente al hacer push a `main` y tambien puede lanzarse manualmente desde GitHub Actions.

Pasos del workflow:

1. Instala dependencias con `npm ci`.
2. Ejecuta typecheck con `npx tsc --noEmit -p tsconfig.app.json`.
3. Ejecuta `npm run build:gh-pages`.
4. Sube `dist/kuroneko2.0/browser` como artifact de GitHub Pages.
5. Despliega usando GitHub Pages.

### Configuracion requerida en GitHub

En el repositorio, configurar:

```text
Settings -> Pages -> Build and deployment -> Source: GitHub Actions
```

No se requieren tokens ni secretos para este workflow.

## Estado actual

El proyecto se encuentra en estado de prototipo avanzado y funcional:

- Flujo VIP implementado.
- Panel administrador implementado.
- API de Google Apps Script preparada para migraciones retrocompatibles.
- Build Angular y suite E2E con Playwright disponibles.
- Checklist manual E2E agregado en `docs/E2E_MANUAL_CHECKLIST.md`.

## Pruebas E2E

Actualmente se usa Playwright para flujos completos y se mantiene una guia manual en:

```text
docs/E2E_MANUAL_CHECKLIST.md
```

La suite automatizada cubre flujos principales como:

- solicitud VIP,
- aprobacion admin,
- login VIP,
- carga de galeria exclusiva,
- tablero VIP,
- rutas protegidas,
- pagina 404.

## Enlaces oficiales

- Pixiv: https://www.pixiv.net/users/120751313
- FANBOX: https://neko-suiro-k.fanbox.cc/
- X: https://x.com/shinai_kuroneko
- Deploy: https://kuronekosystem.github.io/kuroneko2.0/

## Nota final

`クロネコエンジン 2.0` representa un nuevo comienzo para el proyecto: una entrada publica simple, una galeria exclusiva para quienes apoyan el trabajo creativo y una base tecnica preparada para seguir evolucionando con mas estabilidad.
