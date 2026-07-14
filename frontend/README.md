# Tecnihidros — Frontend (HTML/CSS/JS con patrón MVC)

## Cómo abrirlo
Solo abre `index.html` en el navegador (o usa la extensión "Live Server" de VS Code).
Usuarios de prueba (usuario / clave, todas son `1234`):

| Usuario     | Rol       |
|-------------|-----------|
| gerencia    | Gerencia (dashboard) |
| recepcion   | Recepción |
| taller      | Taller técnico |
| almacen     | Almacén / inventario |

## Estructura (MVC)

```
tecnihidros/
├── index.html          <- Único HTML. Todo se pinta dentro de <div id="app">
├── css/
│   └── style.css        <- Todos los estilos
└── js/
    ├── model.js          <- MODELO: "base de datos" simulada + reglas de negocio
    ├── view.js            <- VISTA: funciones que devuelven HTML de cada pantalla
    └── controller.js      <- CONTROLADOR: routing (#/...) + eventos + validaciones
```

- **model.js (`DB`)**: hoy los datos viven en arreglos en memoria (clientes, equipos,
  órdenes, repuestos, facturas, garantías). Cuando conecten la base de datos real,
  **solo hay que reemplazar el contenido de las funciones de este archivo** (por
  ejemplo usando `fetch()` a su API/backend). Las vistas y el controlador no cambian,
  porque solo llaman a funciones como `DB.getClientes()`, `DB.addOrden()`, etc.
- **view.js (`View`)**: cada función arma el HTML de una pantalla a partir de los
  datos que le pasa el controlador. No tiene lógica de negocio.
- **controller.js (`Controller`)**: escucha los cambios de la URL (`#/recepcion`,
  `#/taller/orden?id=3`, etc.), pide datos al Modelo, pide el HTML a la Vista, lo
  pinta, y engancha los eventos de los formularios (incluidas las validaciones).

## Navegación (rutas por hash)

- `#/login`
- `#/gerencia` — dashboard con métricas
- `#/recepcion`, `#/recepcion/clientes`, `#/recepcion/ordenes`
- `#/taller`, `#/taller/orden?id=1`
- `#/almacen`
- `#/facturacion?ordenId=1`

## Reglas de negocio ya implementadas en el frontend

1. **No hay botones de "eliminar"**. Los clientes solo se pueden inactivar
   (`DB.inactivarCliente`), quedan en el sistema con estado `Inactivo`.
2. **Bloqueo de stock**: en la pantalla de taller, si se solicita más cantidad de
   un repuesto de la que hay disponible, el formulario muestra un error y no
   descuenta inventario (`DB.solicitarRepuesto`).
3. **Garantía condicionada**: el botón "Generar garantía" aparece deshabilitado
   hasta que la factura de esa orden quede en estado `Liquidada`.

## Próximos pasos sugeridos para conectar la base de datos

1. Definan los endpoints de su API (por ejemplo `GET /clientes`, `POST /ordenes`, etc.).
2. En `model.js`, reemplacen cada función (ej. `getClientes`) por un `fetch()` que
   llame a esos endpoints y devuelva una `Promise`.
3. Como las funciones del modelo pasarán a ser asíncronas, en `controller.js` habrá
   que agregar `async/await` donde se llamen (por ejemplo `await DB.getClientes()`).
   La estructura de Vista y de rutas no debería cambiar.
