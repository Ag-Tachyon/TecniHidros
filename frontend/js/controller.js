/* ============================================================
   CONTROLLER.js
   Capa de CONTROLADOR (patrón MVC)

   Se encarga de:
   - Leer la URL (hash) y decidir qué pantalla mostrar (routing).
   - Pedirle los datos al MODELO (DB.*).
   - Pedirle el HTML a la VISTA (View.*).
   - Pintar ese HTML en el DOM.
   - Escuchar los eventos de los formularios/botones y aplicar
     las validaciones de negocio antes de llamar al Modelo.
   ============================================================ */

const Controller = (function () {

  const app = document.getElementById("app");

  /* ---------- Utilidad de parámetros en el hash ---------- */
  // Ej: "#/taller/orden?id=3" -> { ruta: "taller/orden", params: {id: "3"} }
  function parseHash() {
    const hash = location.hash.replace(/^#\//, "");
    const [ruta, query] = hash.split("?");
    const params = {};
    if (query) {
      query.split("&").forEach(par => {
        const [k, v] = par.split("=");
        params[k] = decodeURIComponent(v || "");
      });
    }
    return { ruta: ruta || "login", params };
  }

  function irA(ruta) {
    location.hash = "#/" + ruta;
  }

  /* ---------- Guardas de acceso ---------- */

  function requiereSesion(rolesPermitidos) {
    const sesion = DB.getSesion();
    if (!sesion) {
      irA("login");
      return null;
    }
    if (rolesPermitidos && !rolesPermitidos.includes(sesion.rol)) {
      // El rol no tiene acceso a esta vista: lo mandamos a su propio home
      irA(sesion.rol);
      return null;
    }
    return sesion;
  }

  /* ---------- Router principal ---------- */

  function router() {
    const { ruta, params } = parseHash();
    const sesion = DB.getSesion();

    if (ruta === "login") return pintarLogin();

    switch (ruta) {
      case "gerencia":
        if (!requiereSesion(["gerencia"])) return;
        return pintarGerencia();

      case "recepcion":
        if (!requiereSesion(["recepcion"])) return;
        return pintarRecepcionInicio();

      case "recepcion/clientes":
        if (!requiereSesion(["recepcion"])) return;
        return pintarClientesEquipos();

      case "recepcion/ordenes":
        if (!requiereSesion(["recepcion"])) return;
        return pintarNuevaOrden();

      case "taller":
        if (!requiereSesion(["taller"])) return;
        return pintarTallerLista();

      case "taller/orden":
        if (!requiereSesion(["taller"])) return;
        return pintarTallerOrden(params.id);

      case "almacen":
        if (!requiereSesion(["almacen"])) return;
        return pintarAlmacen();

      case "facturacion":
        // Recepción, taller o gerencia pueden llegar aquí a cerrar la orden
        if (!requiereSesion(["recepcion", "taller", "gerencia"])) return;
        return pintarFacturacion(params.ordenId);

      default:
        return sesion ? irA(sesion.rol) : irA("login");
    }
  }

  function pintar(html, sesion) {
    app.innerHTML = View.renderPage(html, sesion || DB.getSesion());
  }

  /* ---------- LOGIN ---------- */

  function pintarLogin(error) {
    app.innerHTML = View.renderLogin(error);
    const form = document.getElementById("form-login");
    form.addEventListener("submit", e => {
      e.preventDefault();
      const datos = new FormData(form);
      const usuario = DB.login(datos.get("usuario").trim(), datos.get("password"));
      if (!usuario) {
        pintarLogin("Usuario o contraseña incorrectos.");
        return;
      }
      irA(usuario.rol);
    });
  }

  function cerrarSesion() {
    DB.logout();
    irA("login");
  }

  /* ---------- GERENCIA ---------- */

  function pintarGerencia() {
    const resumen = DB.getResumenGerencia();
    pintar(View.renderGerencia(resumen));
  }

  /* ---------- RECEPCIÓN ---------- */

  function pintarRecepcionInicio() {
    pintar(View.renderRecepcionInicio());
  }

  function pintarClientesEquipos() {
    pintar(View.renderClientesEquipos(DB.getClientes(), DB.getEquipos()));

    document.getElementById("form-cliente").addEventListener("submit", e => {
      e.preventDefault();
      const d = new FormData(e.target);
      DB.addCliente({
        nombre: d.get("nombre").trim(),
        cedulaNit: d.get("cedulaNit").trim(),
        telefonos: [d.get("telefono1").trim(), d.get("telefono2").trim()],
      });
      pintarClientesEquipos();
    });

    document.getElementById("form-equipo").addEventListener("submit", e => {
      e.preventDefault();
      const d = new FormData(e.target);
      DB.addEquipo({
        clienteId: d.get("clienteId"),
        marca: d.get("marca").trim(),
        modelo: d.get("modelo").trim(),
        serie: d.get("serie").trim(),
        fallas: [d.get("falla1").trim(), d.get("falla2").trim()],
      });
      pintarClientesEquipos();
    });
  }

  function pintarNuevaOrden() {
    pintar(View.renderNuevaOrden(DB.getEquipos(), DB.getClientes(), DB.getTecnicos(), DB.getOrdenes()));

    document.getElementById("form-orden").addEventListener("submit", e => {
      e.preventDefault();
      const d = new FormData(e.target);
      DB.addOrden({ equipoId: d.get("equipoId"), tecnicoId: d.get("tecnicoId") });
      pintarNuevaOrden();
    });
  }

  /* ---------- TALLER ---------- */

  function pintarTallerLista() {
    const sesion = DB.getSesion();
    pintar(View.renderTallerLista(DB.getOrdenesByTecnico(sesion.id), DB.getEquipos()));
  }

  function pintarTallerOrden(ordenId, mensajeStock) {
    const orden = DB.getOrdenById(ordenId);
    if (!orden) return irA("taller");

    const equipo = DB.getEquipoById(orden.equipoId);
    const cliente = DB.getClienteById(equipo.clienteId);
    const repuestosUsados = DB.getRepuestosDeOrden(orden.id);

    pintar(View.renderTallerOrden(
      orden, equipo, cliente,
      DB.getRepuestos().filter(r => r.activo),
      repuestosUsados,
      mensajeStock
    ));

    document.getElementById("form-diagnostico").addEventListener("submit", e => {
      e.preventDefault();
      const d = new FormData(e.target);
      DB.actualizarOrden(orden.id, {
        estado: d.get("estado"),
        diagnostico: d.get("diagnostico"),
        horasManoObra: d.get("horasManoObra"),
      });
      pintarTallerOrden(ordenId);
    });

    document.getElementById("form-solicitar-repuesto").addEventListener("submit", e => {
      e.preventDefault();
      const d = new FormData(e.target);

      // --- Validación de negocio: bloqueo de stock ---
      const resultado = DB.solicitarRepuesto(orden.id, d.get("repuestoId"), d.get("cantidad"));

      if (!resultado.ok) {
        pintarTallerOrden(ordenId, resultado.mensaje);
        return;
      }
      pintarTallerOrden(ordenId);
    });
  }

  /* ---------- ALMACÉN ---------- */

  function pintarAlmacen() {
    pintar(View.renderAlmacen(DB.getRepuestos().filter(r => r.activo)));

    document.getElementById("form-entrada").addEventListener("submit", e => {
      e.preventDefault();
      const d = new FormData(e.target);
      DB.registrarEntradaRepuesto(d.get("repuestoId"), d.get("cantidad"));
      pintarAlmacen();
    });

    document.getElementById("form-nuevo-repuesto").addEventListener("submit", e => {
      e.preventDefault();
      const d = new FormData(e.target);
      DB.addRepuesto({
        nombre: d.get("nombre").trim(),
        stock: d.get("stock"),
        stockMinimo: d.get("stockMinimo"),
        precio: d.get("precio"),
      });
      pintarAlmacen();
    });
  }

  /* ---------- FACTURACIÓN Y GARANTÍA ---------- */

  function pintarFacturacion(ordenId) {
    const orden = DB.getOrdenById(ordenId);
    if (!orden) return irA(DB.getSesion().rol);

    const equipo = DB.getEquipoById(orden.equipoId);
    const factura = DB.getFacturaByOrden(orden.id);
    const garantia = factura ? DB.getGarantiaByFactura(factura.id) : null;

    pintar(View.renderFacturacion(orden, equipo, factura, garantia));

    document.getElementById("btn-generar-factura").addEventListener("click", () => {
      DB.generarFactura(orden.id);
      pintarFacturacion(ordenId);
    });

    const btnLiquidar = document.getElementById("btn-liquidar");
    if (btnLiquidar) {
      btnLiquidar.addEventListener("click", () => {
        DB.liquidarFactura(factura.id);
        pintarFacturacion(ordenId);
      });
    }

    const btnGarantia = document.getElementById("btn-generar-garantia");
    if (btnGarantia) {
      btnGarantia.addEventListener("click", () => {
        // --- Validación de negocio: la garantía solo se activa con factura Liquidada ---
        // El botón ya viene deshabilitado desde la Vista si no aplica,
        // pero igual validamos aquí por seguridad.
        const facturaActual = DB.getFacturaByOrden(orden.id);
        const resultado = DB.generarGarantia(facturaActual.id);
        if (!resultado.ok) {
          alert(resultado.mensaje);
          return;
        }
        pintarFacturacion(ordenId);
      });
    }
  }

  /* ---------- Botón de logout (delegación de eventos) ---------- */

  document.addEventListener("click", e => {
    if (e.target && e.target.id === "btn-logout") {
      cerrarSesion();
    }
  });

  /* ---------- Inicio de la app ---------- */

  function init() {
    window.addEventListener("hashchange", router);
    window.addEventListener("load", router);
    router();
  }

  return { init };
})();
