/* ============================================================
   VIEW.js
   Capa de VISTA (patrón MVC)

   Cada función recibe datos ya preparados por el CONTROLADOR
   y devuelve un string de HTML. No hay lógica de negocio aquí,
   solo "cómo se ve" cada pantalla.
   ============================================================ */

const View = (function () {

  /* ---------- Layout general ---------- */

  function renderNavbar(sesion) {
    if (!sesion) return "";
    const links = {
      gerencia: [["#/gerencia", "Dashboard"]],
      recepcion: [["#/recepcion", "Inicio"], ["#/recepcion/clientes", "Clientes y equipos"], ["#/recepcion/ordenes", "Nueva orden"]],
      taller: [["#/taller", "Mis órdenes"]],
      almacen: [["#/almacen", "Inventario"]],
    }[sesion.rol] || [];

    const linksHtml = links.map(([href, label]) => `<a href="${href}">${label}</a>`).join("");

    return `
      <header class="navbar rol-${sesion.rol}">
        <div class="navbar-brand">Tecnihidros <span>· ${capitalizar(sesion.rol)}</span></div>
        <nav>${linksHtml}</nav>
        <div class="navbar-user">
          <span>${sesion.nombre}</span>
          <button id="btn-logout" class="btn btn-ghost">Salir</button>
        </div>
      </header>`;
  }

  function renderPage(contentHtml, sesion) {
    return `${renderNavbar(sesion)}<main class="contenedor">${contentHtml}</main>`;
  }

  function capitalizar(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  /* ---------- Login ---------- */

  function renderLogin(error) {
    return `
      <div class="login-wrap">
        <form id="form-login" class="card login-card">
          <h1>Tecnihidros</h1>
          <p class="subtitulo">Ingreso al sistema del taller</p>
          ${error ? `<div class="alerta alerta-error">${error}</div>` : ""}
          <label>Usuario
            <input type="text" name="usuario" required autofocus>
          </label>
          <label>Contraseña
            <input type="password" name="password" required>
          </label>
          <button type="submit" class="btn btn-primario">Ingresar</button>
          <p class="ayuda">Usuarios de prueba: gerencia / recepcion / taller / almacen — clave: 1234</p>
        </form>
      </div>`;
  }

  /* ---------- Gerencia ---------- */

  function renderGerencia(resumen) {
    const filasEstado = resumen.ordenesPorEstado.map(e => `
      <tr><td>${e.estado}</td><td>${e.cantidad}</td></tr>
    `).join("");

    return `
      <h1>Tablero de gerencia</h1>
      <div class="tarjetas">
        <div class="card metrica">
          <span class="metrica-valor">$${formatoMoneda(resumen.totalFacturado)}</span>
          <span class="metrica-label">Total facturado</span>
        </div>
        <div class="card metrica">
          <span class="metrica-valor">${resumen.facturasLiquidadas}</span>
          <span class="metrica-label">Facturas liquidadas</span>
        </div>
        <div class="card metrica">
          <span class="metrica-valor">${resumen.totalOrdenes}</span>
          <span class="metrica-label">Órdenes activas</span>
        </div>
        <div class="card metrica">
          <span class="metrica-valor">${resumen.totalClientes}</span>
          <span class="metrica-label">Clientes activos</span>
        </div>
      </div>

      <div class="card">
        <h2>Órdenes por estado</h2>
        <table class="tabla">
          <thead><tr><th>Estado</th><th>Cantidad</th></tr></thead>
          <tbody>${filasEstado}</tbody>
        </table>
      </div>`;
  }

  /* ---------- Recepción ---------- */

  function renderRecepcionInicio() {
    return `
      <h1>Recepción</h1>
      <div class="tarjetas">
        <a class="card card-accion" href="#/recepcion/clientes">
          <h2>Clientes y equipos</h2>
          <p>Registrar un cliente nuevo o un equipo para uno existente.</p>
        </a>
        <a class="card card-accion" href="#/recepcion/ordenes">
          <h2>Nueva orden de servicio</h2>
          <p>Abrir una orden de servicio para un equipo recibido.</p>
        </a>
      </div>`;
  }

  function renderClientesEquipos(clientes, equipos) {
    const filasClientes = clientes.map(c => `
      <tr>
        <td>${c.nombre}</td>
        <td>${c.cedulaNit}</td>
        <td>${c.telefonos.join(", ")}</td>
        <td>${c.activo ? '<span class="etiqueta ok">Activo</span>' : '<span class="etiqueta inactivo">Inactivo</span>'}</td>
      </tr>`).join("");

    const opcionesClientes = clientes.filter(c => c.activo)
      .map(c => `<option value="${c.id}">${c.nombre}</option>`).join("");

    const filasEquipos = equipos.map(e => {
      const cliente = clientes.find(c => c.id === e.clienteId);
      return `
      <tr>
        <td>${cliente ? cliente.nombre : "—"}</td>
        <td>${e.marca}</td>
        <td>${e.modelo}</td>
        <td>${e.serie}</td>
        <td>${e.fallas.join(" · ")}</td>
      </tr>`;
    }).join("");

    return `
      <h1>Clientes y equipos</h1>

      <div class="grid-2">
        <div class="card">
          <h2>Registrar cliente</h2>
          <form id="form-cliente">
            <label>Nombre / Razón social
              <input type="text" name="nombre" required>
            </label>
            <label>Cédula / NIT
              <input type="text" name="cedulaNit" required>
            </label>
            <label>Teléfono 1
              <input type="text" name="telefono1" required>
            </label>
            <label>Teléfono 2 (opcional)
              <input type="text" name="telefono2">
            </label>
            <button type="submit" class="btn btn-primario">Guardar cliente</button>
          </form>
        </div>

        <div class="card">
          <h2>Registrar equipo</h2>
          <form id="form-equipo">
            <label>Cliente
              <select name="clienteId" required>
                <option value="">Seleccione…</option>
                ${opcionesClientes}
              </select>
            </label>
            <label>Marca
              <input type="text" name="marca" required>
            </label>
            <label>Modelo
              <input type="text" name="modelo" required>
            </label>
            <label>Número de serie
              <input type="text" name="serie" required>
            </label>
            <label>Falla 1
              <input type="text" name="falla1" required>
            </label>
            <label>Falla 2 (opcional)
              <input type="text" name="falla2">
            </label>
            <button type="submit" class="btn btn-primario">Guardar equipo</button>
          </form>
        </div>
      </div>

      <div class="card">
        <h2>Clientes registrados</h2>
        <table class="tabla">
          <thead><tr><th>Nombre</th><th>Cédula/NIT</th><th>Teléfonos</th><th>Estado</th></tr></thead>
          <tbody>${filasClientes || '<tr><td colspan="4">Sin clientes.</td></tr>'}</tbody>
        </table>
      </div>

      <div class="card">
        <h2>Equipos registrados</h2>
        <table class="tabla">
          <thead><tr><th>Cliente</th><th>Marca</th><th>Modelo</th><th>Serie</th><th>Fallas</th></tr></thead>
          <tbody>${filasEquipos || '<tr><td colspan="5">Sin equipos.</td></tr>'}</tbody>
        </table>
      </div>`;
  }

  function renderNuevaOrden(equipos, clientes, tecnicos, ordenes) {
    const opcionesEquipos = equipos.map(e => {
      const cliente = clientes.find(c => c.id === e.clienteId);
      return `<option value="${e.id}">${e.marca} ${e.modelo} (${e.serie}) — ${cliente ? cliente.nombre : "—"}</option>`;
    }).join("");

    const opcionesTecnicos = tecnicos.map(t => `<option value="${t.id}">${t.nombre}</option>`).join("");

    const filasOrdenes = ordenes.map(o => {
      const equipo = equipos.find(e => e.id === o.equipoId);
      return `<tr>
        <td>#${o.id}</td>
        <td>${equipo ? `${equipo.marca} ${equipo.modelo}` : "—"}</td>
        <td><span class="etiqueta estado-${slug(o.estado)}">${o.estado}</span></td>
        <td>${o.fechaIngreso}</td>
      </tr>`;
    }).join("");

    return `
      <h1>Nueva orden de servicio</h1>
      <div class="card">
        <form id="form-orden">
          <label>Equipo
            <select name="equipoId" required>
              <option value="">Seleccione…</option>
              ${opcionesEquipos}
            </select>
          </label>
          <label>Técnico asignado
            <select name="tecnicoId" required>
              <option value="">Seleccione…</option>
              ${opcionesTecnicos}
            </select>
          </label>
          <button type="submit" class="btn btn-primario">Abrir orden</button>
        </form>
      </div>

      <div class="card">
        <h2>Órdenes abiertas</h2>
        <table class="tabla">
          <thead><tr><th>Orden</th><th>Equipo</th><th>Estado</th><th>Ingreso</th></tr></thead>
          <tbody>${filasOrdenes || '<tr><td colspan="4">No hay órdenes.</td></tr>'}</tbody>
        </table>
      </div>`;
  }

  /* ---------- Taller ---------- */

  function renderTallerLista(ordenes, equipos) {
    const filas = ordenes.map(o => {
      const equipo = equipos.find(e => e.id === o.equipoId);
      return `<tr>
        <td>#${o.id}</td>
        <td>${equipo ? `${equipo.marca} ${equipo.modelo} (${equipo.serie})` : "—"}</td>
        <td><span class="etiqueta estado-${slug(o.estado)}">${o.estado}</span></td>
        <td><a class="btn btn-secundario" href="#/taller/orden?id=${o.id}">Abrir</a></td>
      </tr>`;
    }).join("");

    return `
      <h1>Mis órdenes asignadas</h1>
      <div class="card">
        <table class="tabla">
          <thead><tr><th>Orden</th><th>Equipo</th><th>Estado</th><th></th></tr></thead>
          <tbody>${filas || '<tr><td colspan="4">No tienes órdenes asignadas.</td></tr>'}</tbody>
        </table>
      </div>`;
  }

  function renderTallerOrden(orden, equipo, cliente, repuestosDisponibles, repuestosUsados, mensajeStock) {
    const opcionesEstado = DB_ESTADOS_ORDEN().map(e =>
      `<option value="${e}" ${orden.estado === e ? "selected" : ""}>${e}</option>`
    ).join("");

    const opcionesRepuestos = repuestosDisponibles.map(r =>
      `<option value="${r.id}">${r.nombre} (stock: ${r.stock})</option>`
    ).join("");

    const filasRepuestos = repuestosUsados.map(ru => `
      <tr><td>${ru.repuesto.nombre}</td><td>${ru.cantidad}</td></tr>
    `).join("");

    return `
      <a class="volver" href="#/taller">← Volver a mis órdenes</a>
      <h1>Orden #${orden.id}</h1>
      <p class="subtitulo">${equipo.marca} ${equipo.modelo} — Serie ${equipo.serie} · Cliente: ${cliente ? cliente.nombre : "—"}</p>

      <div class="grid-2">
        <div class="card">
          <h2>Diagnóstico y estado</h2>
          <form id="form-diagnostico">
            <label>Estado de la reparación
              <select name="estado">${opcionesEstado}</select>
            </label>
            <label>Diagnóstico técnico
              <textarea name="diagnostico" rows="4">${orden.diagnostico}</textarea>
            </label>
            <label>Horas de mano de obra
              <input type="number" min="0" step="0.5" name="horasManoObra" value="${orden.horasManoObra}">
            </label>
            <button type="submit" class="btn btn-primario">Guardar cambios</button>
          </form>
        </div>

        <div class="card">
          <h2>Solicitar repuesto al almacén</h2>
          ${mensajeStock ? `<div class="alerta alerta-error">${mensajeStock}</div>` : ""}
          <form id="form-solicitar-repuesto">
            <label>Repuesto
              <select name="repuestoId" required>
                <option value="">Seleccione…</option>
                ${opcionesRepuestos}
              </select>
            </label>
            <label>Cantidad
              <input type="number" min="1" name="cantidad" required>
            </label>
            <button type="submit" class="btn btn-primario">Solicitar</button>
          </form>

          <h3>Repuestos usados en esta orden</h3>
          <table class="tabla">
            <thead><tr><th>Repuesto</th><th>Cantidad</th></tr></thead>
            <tbody>${filasRepuestos || '<tr><td colspan="2">Aún no hay repuestos solicitados.</td></tr>'}</tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <h2>Facturación</h2>
        <p>Cuando el diagnóstico y los repuestos estén listos, genera la factura de esta orden.</p>
        <a class="btn btn-secundario" href="#/facturacion?ordenId=${orden.id}">Ir a facturación</a>
      </div>`;
  }

  /* ---------- Almacén ---------- */

  function renderAlmacen(repuestos) {
    const filas = repuestos.map(r => {
      const bajoStock = r.stock <= r.stockMinimo;
      return `<tr class="${bajoStock ? "fila-alerta" : ""}">
        <td>${r.nombre}</td>
        <td>${r.stock}${bajoStock ? ' <span class="etiqueta alerta-stock">Stock mínimo</span>' : ""}</td>
        <td>${r.stockMinimo}</td>
        <td>$${formatoMoneda(r.precio)}</td>
      </tr>`;
    }).join("");

    return `
      <h1>Inventario de repuestos</h1>

      <div class="grid-2">
        <div class="card">
          <h2>Registrar entrada de mercancía</h2>
          <form id="form-entrada">
            <label>Repuesto
              <select name="repuestoId" required>
                <option value="">Seleccione…</option>
                ${repuestos.map(r => `<option value="${r.id}">${r.nombre}</option>`).join("")}
              </select>
            </label>
            <label>Cantidad que ingresa
              <input type="number" min="1" name="cantidad" required>
            </label>
            <button type="submit" class="btn btn-primario">Registrar entrada</button>
          </form>
        </div>

        <div class="card">
          <h2>Nuevo repuesto</h2>
          <form id="form-nuevo-repuesto">
            <label>Nombre
              <input type="text" name="nombre" required>
            </label>
            <label>Stock inicial
              <input type="number" min="0" name="stock" required>
            </label>
            <label>Stock mínimo
              <input type="number" min="0" name="stockMinimo" required>
            </label>
            <label>Precio unitario
              <input type="number" min="0" name="precio" required>
            </label>
            <button type="submit" class="btn btn-primario">Crear repuesto</button>
          </form>
        </div>
      </div>

      <div class="card">
        <h2>Catálogo de repuestos</h2>
        <table class="tabla">
          <thead><tr><th>Nombre</th><th>Stock</th><th>Stock mínimo</th><th>Precio</th></tr></thead>
          <tbody>${filas}</tbody>
        </table>
      </div>`;
  }

  /* ---------- Facturación ---------- */

  function renderFacturacion(orden, equipo, factura, garantia) {
    const puedeGenerarGarantia = factura && factura.estado === "Liquidada";

    return `
      <h1>Facturación — Orden #${orden.id}</h1>
      <p class="subtitulo">${equipo.marca} ${equipo.modelo} — Serie ${equipo.serie}</p>

      <div class="card">
        <button id="btn-generar-factura" class="btn btn-primario">Calcular / actualizar factura</button>

        ${factura ? `
          <table class="tabla" style="margin-top:16px">
            <tbody>
              <tr><td>Mano de obra (${orden.horasManoObra} h x $${formatoMoneda(orden.valorHora)})</td><td>$${formatoMoneda(factura.manoObra)}</td></tr>
              <tr><td>Repuestos</td><td>$${formatoMoneda(factura.totalRepuestos)}</td></tr>
              <tr class="fila-total"><td>Total a cobrar</td><td>$${formatoMoneda(factura.total)}</td></tr>
              <tr><td>Estado</td><td><span class="etiqueta estado-${slug(factura.estado)}">${factura.estado}</span></td></tr>
            </tbody>
          </table>
          ${factura.estado !== "Liquidada" ? `<button id="btn-liquidar" class="btn btn-secundario">Marcar como liquidada</button>` : ""}
        ` : `<p class="ayuda">Aún no se ha generado la factura de esta orden.</p>`}
      </div>

      <div class="card">
        <h2>Garantía posventa</h2>
        ${garantia ? `
          <p>Garantía vigente desde <strong>${garantia.fechaInicio}</strong> hasta <strong>${garantia.fechaFin}</strong> (${garantia.meses} meses).</p>
        ` : `
          <p class="ayuda">${puedeGenerarGarantia
            ? "La factura está liquidada. Ya puedes generar la garantía."
            : "El botón se habilita cuando la factura quede en estado Liquidada."}</p>
          <button id="btn-generar-garantia" class="btn btn-primario" ${puedeGenerarGarantia ? "" : "disabled"}>
            Generar garantía
          </button>
        `}
      </div>`;
  }

  /* ---------- Utilidades de formato ---------- */

  function formatoMoneda(n) {
    return Number(n || 0).toLocaleString("es-CO");
  }

  function slug(texto) {
    return texto.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");
  }

  function DB_ESTADOS_ORDEN() {
    return DB.ESTADOS_ORDEN;
  }

  /* ---------- API pública ---------- */

  return {
    renderPage,
    renderLogin,
    renderGerencia,
    renderRecepcionInicio, renderClientesEquipos, renderNuevaOrden,
    renderTallerLista, renderTallerOrden,
    renderAlmacen,
    renderFacturacion,
  };
})();
