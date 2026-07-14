/* ============================================================
   MODEL.js
   Capa de MODELO (patrón MVC)

   Aquí vive toda la "base de datos" y las reglas de negocio.
   Por ahora los datos están simulados en memoria (arreglos JS)
   para poder construir y probar toda la interfaz.

   Cuando conecten la base de datos real, SOLO tienen que
   reemplazar el contenido de las funciones de este archivo
   (por ejemplo usar fetch() hacia su API) sin tocar las vistas
   ni los controladores, porque ellos solo llaman a estas
   funciones (DB.login(), DB.getClientes(), etc.)
   ============================================================ */

const DB = (function () {

  /* ---------- "TABLAS" simuladas ---------- */

  let usuarios = [
    { id: 1, nombre: "Carlos Gómez",   usuario: "gerencia",  password: "1234", rol: "gerencia" },
    { id: 2, nombre: "Laura Pérez",    usuario: "recepcion", password: "1234", rol: "recepcion" },
    { id: 3, nombre: "Andrés Ruiz",    usuario: "taller",    password: "1234", rol: "taller" },
    { id: 4, nombre: "Marta Londoño",  usuario: "almacen",   password: "1234", rol: "almacen" },
  ];

  let clientes = [
    { id: 1, nombre: "Constructora ABC", cedulaNit: "900123456", telefonos: ["3001234567"], activo: true },
  ];

  let equipos = [
    { id: 1, clienteId: 1, marca: "Pedrollo", modelo: "CPm 620", serie: "PD-8842",
      fallas: ["No enciende", "Ruido excesivo"], activo: true },
  ];

  let tecnicos = usuarios.filter(u => u.rol === "taller");

  let ordenes = [
    { id: 1, equipoId: 1, tecnicoId: 3, estado: "En espera",
      diagnostico: "", horasManoObra: 0, valorHora: 25000,
      fechaIngreso: "2026-07-10", activo: true },
  ];

  let repuestos = [
    { id: 1, nombre: "Rodamiento 6205", stock: 12, stockMinimo: 5, precio: 18000, activo: true },
    { id: 2, nombre: "Capacitor 25uF",  stock: 3,  stockMinimo: 5, precio: 22000, activo: true },
    { id: 3, nombre: "Sello mecánico",  stock: 8,  stockMinimo: 4, precio: 35000, activo: true },
  ];

  let ordenRepuestos = []; // { id, ordenId, repuestoId, cantidad }

  let facturas = []; // { id, ordenId, manoObra, repuestos, total, estado: 'Pendiente'|'Liquidada' }

  let garantias = []; // { id, facturaId, fechaInicio, fechaFin, meses }

  let nextId = { cliente: 2, equipo: 2, orden: 2, repuesto: 4, ordenRepuesto: 1, factura: 1, garantia: 1 };

  /* ---------- Sesión ---------- */

  let sesionActual = null;

  function login(usuario, password) {
    const u = usuarios.find(x => x.usuario === usuario && x.password === password);
    if (u) sesionActual = u;
    return u || null;
  }

  function logout() {
    sesionActual = null;
  }

  function getSesion() {
    return sesionActual;
  }

  /* ---------- Clientes y Equipos ---------- */

  function getClientes() {
    return clientes;
  }

  function getClienteById(id) {
    return clientes.find(c => c.id === Number(id));
  }

  function addCliente({ nombre, cedulaNit, telefonos }) {
    const nuevo = {
      id: nextId.cliente++,
      nombre, cedulaNit,
      telefonos: telefonos.filter(t => t.trim() !== ""),
      activo: true,
    };
    clientes.push(nuevo);
    return nuevo;
  }

  function inactivarCliente(id) {
    const c = getClienteById(id);
    if (c) c.activo = false;
  }

  function getEquipos() {
    return equipos;
  }

  function getEquiposByCliente(clienteId) {
    return equipos.filter(e => e.clienteId === Number(clienteId));
  }

  function getEquipoById(id) {
    return equipos.find(e => e.id === Number(id));
  }

  function addEquipo({ clienteId, marca, modelo, serie, fallas }) {
    const nuevo = {
      id: nextId.equipo++,
      clienteId: Number(clienteId),
      marca, modelo, serie,
      fallas: fallas.filter(f => f.trim() !== ""),
      activo: true,
    };
    equipos.push(nuevo);
    return nuevo;
  }

  /* ---------- Órdenes de servicio ---------- */

  const ESTADOS_ORDEN = ["En espera", "En reparación", "Suspendido", "Terminado"];

  function getOrdenes() {
    return ordenes;
  }

  function getOrdenesByTecnico(tecnicoId) {
    return ordenes.filter(o => o.tecnicoId === Number(tecnicoId) && o.activo);
  }

  function getOrdenById(id) {
    return ordenes.find(o => o.id === Number(id));
  }

  function addOrden({ equipoId, tecnicoId }) {
    const nueva = {
      id: nextId.orden++,
      equipoId: Number(equipoId),
      tecnicoId: Number(tecnicoId),
      estado: "En espera",
      diagnostico: "",
      horasManoObra: 0,
      valorHora: 25000,
      fechaIngreso: new Date().toISOString().slice(0, 10),
      activo: true,
    };
    ordenes.push(nueva);
    return nueva;
  }

  function actualizarOrden(id, { estado, diagnostico, horasManoObra }) {
    const o = getOrdenById(id);
    if (!o) return null;
    if (estado !== undefined) o.estado = estado;
    if (diagnostico !== undefined) o.diagnostico = diagnostico;
    if (horasManoObra !== undefined) o.horasManoObra = Number(horasManoObra);
    return o;
  }

  function getTecnicos() {
    return tecnicos;
  }

  /* ---------- Repuestos / Inventario ---------- */

  function getRepuestos() {
    return repuestos;
  }

  function getRepuestoById(id) {
    return repuestos.find(r => r.id === Number(id));
  }

  // Devuelve { ok:true } o { ok:false, mensaje }
  function solicitarRepuesto(ordenId, repuestoId, cantidad) {
    const rep = getRepuestoById(repuestoId);
    cantidad = Number(cantidad);

    if (!rep) return { ok: false, mensaje: "Repuesto no encontrado." };
    if (cantidad <= 0) return { ok: false, mensaje: "La cantidad debe ser mayor a 0." };
    if (cantidad > rep.stock) {
      return { ok: false, mensaje: `Stock insuficiente. Disponible: ${rep.stock} unidad(es).` };
    }

    rep.stock -= cantidad;
    const registro = {
      id: nextId.ordenRepuesto++,
      ordenId: Number(ordenId),
      repuestoId: Number(repuestoId),
      cantidad,
    };
    ordenRepuestos.push(registro);
    return { ok: true, registro };
  }

  function registrarEntradaRepuesto(repuestoId, cantidad) {
    const rep = getRepuestoById(repuestoId);
    cantidad = Number(cantidad);
    if (!rep || cantidad <= 0) return { ok: false, mensaje: "Datos inválidos." };
    rep.stock += cantidad;
    return { ok: true };
  }

  function addRepuesto({ nombre, stock, stockMinimo, precio }) {
    const nuevo = {
      id: nextId.repuesto++,
      nombre,
      stock: Number(stock),
      stockMinimo: Number(stockMinimo),
      precio: Number(precio),
      activo: true,
    };
    repuestos.push(nuevo);
    return nuevo;
  }

  function getRepuestosDeOrden(ordenId) {
    return ordenRepuestos
      .filter(or => or.ordenId === Number(ordenId))
      .map(or => ({ ...or, repuesto: getRepuestoById(or.repuestoId) }));
  }

  /* ---------- Facturación ---------- */

  function getFacturaByOrden(ordenId) {
    return facturas.find(f => f.ordenId === Number(ordenId));
  }

  function generarFactura(ordenId) {
    const orden = getOrdenById(ordenId);
    if (!orden) return null;

    const manoObra = orden.horasManoObra * orden.valorHora;
    const repuestosOrden = getRepuestosDeOrden(ordenId);
    const totalRepuestos = repuestosOrden.reduce(
      (acc, r) => acc + r.cantidad * r.repuesto.precio, 0
    );

    let factura = getFacturaByOrden(ordenId);
    if (!factura) {
      factura = { id: nextId.factura++, ordenId: Number(ordenId), estado: "Pendiente" };
      facturas.push(factura);
    }
    factura.manoObra = manoObra;
    factura.totalRepuestos = totalRepuestos;
    factura.total = manoObra + totalRepuestos;
    return factura;
  }

  function liquidarFactura(facturaId) {
    const f = facturas.find(x => x.id === Number(facturaId));
    if (f) f.estado = "Liquidada";
    return f;
  }

  function getFacturaById(id) {
    return facturas.find(f => f.id === Number(id));
  }

  /* ---------- Garantías ---------- */

  function getGarantiaByFactura(facturaId) {
    return garantias.find(g => g.facturaId === Number(facturaId));
  }

  function generarGarantia(facturaId, meses = 3) {
    const factura = getFacturaById(facturaId);
    if (!factura || factura.estado !== "Liquidada") {
      return { ok: false, mensaje: "La factura debe estar Liquidada para generar la garantía." };
    }
    const inicio = new Date();
    const fin = new Date();
    fin.setMonth(fin.getMonth() + meses);

    const nueva = {
      id: nextId.garantia++,
      facturaId: Number(facturaId),
      meses,
      fechaInicio: inicio.toISOString().slice(0, 10),
      fechaFin: fin.toISOString().slice(0, 10),
    };
    garantias.push(nueva);
    return { ok: true, garantia: nueva };
  }

  /* ---------- Reportes (Gerencia) ---------- */

  function getResumenGerencia() {
    const totalFacturado = facturas.reduce((acc, f) => acc + (f.total || 0), 0);
    const facturasLiquidadas = facturas.filter(f => f.estado === "Liquidada").length;
    const ordenesPorEstado = ESTADOS_ORDEN.map(estado => ({
      estado,
      cantidad: ordenes.filter(o => o.estado === estado && o.activo).length,
    }));
    return {
      totalFacturado,
      facturasLiquidadas,
      totalOrdenes: ordenes.filter(o => o.activo).length,
      ordenesPorEstado,
      totalClientes: clientes.filter(c => c.activo).length,
    };
  }

  /* ---------- API pública del módulo ---------- */

  return {
    login, logout, getSesion,
    getClientes, getClienteById, addCliente, inactivarCliente,
    getEquipos, getEquiposByCliente, getEquipoById, addEquipo,
    ESTADOS_ORDEN,
    getOrdenes, getOrdenesByTecnico, getOrdenById, addOrden, actualizarOrden, getTecnicos,
    getRepuestos, getRepuestoById, solicitarRepuesto, registrarEntradaRepuesto, addRepuesto, getRepuestosDeOrden,
    getFacturaByOrden, generarFactura, liquidarFactura, getFacturaById,
    getGarantiaByFactura, generarGarantia,
    getResumenGerencia,
  };
})();
