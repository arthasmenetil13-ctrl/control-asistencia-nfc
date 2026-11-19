/**
 * CONTROL DE ASISTENCIA NFC — Servidor en Google Sheets (Apps Script)
 *
 * Este código va pegado en: Hoja de cálculo → Extensiones → Apps Script.
 * La guía paso a paso está en INSTALAR.md.
 *
 * Hojas que se crean:
 *   - Usuarios        → las personas y el código de su tarjeta (se pueden editar aquí)
 *   - Resumen diario  → una fila por turno: entrada, salida y horas trabajadas
 *   - Registros       → cada vez que alguien acerca la tarjeta (historial completo)
 */

const APP_URL = "https://arthasmenetil13-ctrl.github.io/control-asistencia-nfc/";
const ZONA_HORARIA = "America/Bogota";
const ANTIREBOTE_SEG = 10;

const H_USU = "Usuarios", H_RES = "Resumen diario", H_REG = "Registros";
const CAB_USU = ["Código NFC", "Tipo doc", "Documento", "Nombres", "Apellidos", "Cargo", "Activo (SI/NO)"];
const CAB_RES = ["Fecha", "Documento", "Nombre", "Cargo", "Entrada", "Salida", "Horas trabajadas"];
const CAB_REG = ["Fecha", "Hora", "Tipo", "Documento", "Nombre", "Código NFC", "Origen", "ID"];

// ======================= MENÚ DE LA HOJA =======================

function onOpen() {
  SpreadsheetApp.getUi().createMenu("Asistencia NFC")
    .addItem("1. Preparar hoja (solo la primera vez)", "configurar")
    .addItem("2. Conectar un celular (código QR)", "mostrarQR")
    .addSeparator()
    .addItem("Cambiar PIN de administrador", "cambiarPin")
    .addItem("Cambiar enlace del servicio", "cambiarEnlace")
    .addItem("Desconectar todos los celulares", "desconectarCelulares")
    .addToUi();
}

function configurar() {
  const ss = SpreadsheetApp.getActive();
  const ui = SpreadsheetApp.getUi();
  ss.setSpreadsheetTimeZone(ZONA_HORARIA);

  const usu = hoja_(H_USU, CAB_USU);
  const res = hoja_(H_RES, CAB_RES);
  const reg = hoja_(H_REG, CAB_REG);
  usu.getRange("A:C").setNumberFormat("@");      // códigos y documentos como texto
  res.getRange("A:G").setNumberFormat("@");      // fechas/horas como texto (evita cambios de formato)
  reg.getRange("A:H").setNumberFormat("@");

  if (usu.getLastRow() < 2) {
    usu.getRange(2, 1, 3, 7).setValues([
      ["NFC-EMP-0001", "CC", "1023456789", "Laura Valentina", "Méndez Ríos", "Auxiliar administrativa", "SI"],
      ["NFC-EMP-0002", "CC", "1098765432", "Andrés Felipe", "Torres Gil", "Técnico de soporte", "SI"],
      ["NFC-EMP-0003", "CC", "1045678123", "Camila Sofía", "Herrera Paz", "Coordinadora de talento humano", "SI"]
    ]);
  }
  usu.getRange("G2:G").setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(["SI", "NO"], true).build());
  [usu, res, reg].forEach(h => h.autoResizeColumns(1, h.getLastColumn()));

  // Borra la hoja vacía que trae el archivo nuevo ("Hoja 1" / "Sheet1")
  ss.getSheets().forEach(h => {
    if ([H_USU, H_RES, H_REG].indexOf(h.getName()) < 0 && h.getLastRow() === 0 && ss.getSheets().length > 3) ss.deleteSheet(h);
  });

  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty("TOKEN")) props.setProperty("TOKEN", nuevoToken_());
  if (!props.getProperty("PIN_HASH")) cambiarPin();

  ui.alert("✅ Hoja preparada",
    "Siguiente paso: publicar el servicio.\n\n" +
    "En esta ventana de Apps Script: Implementar → Nueva implementación → tipo \"Aplicación web\".\n" +
    "  • Ejecutar como: Yo\n  • Quién tiene acceso: Cualquier usuario\n\n" +
    "Copie el enlace que termina en /exec y luego use el menú\n\"Asistencia NFC → 2. Conectar un celular\".",
    ui.ButtonSet.OK);
}

function cambiarPin() {
  const ui = SpreadsheetApp.getUi();
  const r = ui.prompt("PIN de administrador",
    "Escriba un PIN de 4 a 8 números.\nSe usará en el celular para entrar al modo administrador.", ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  const pin = r.getResponseText().trim();
  if (!/^\d{4,8}$/.test(pin)) { ui.alert("El PIN debe tener de 4 a 8 números. Intente de nuevo desde el menú."); return; }
  PropertiesService.getScriptProperties().setProperty("PIN_HASH", hash_(pin));
  ui.alert("✅ PIN guardado.");
}

function mostrarQR() {
  const ui = SpreadsheetApp.getUi();
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty("TOKEN")) { ui.alert("Primero use \"1. Preparar hoja\"."); return; }
  let url = props.getProperty("WEBAPP_URL");
  if (!url) { url = pedirEnlace_(); if (!url) return; }

  const cfg = Utilities.base64EncodeWebSafe(JSON.stringify({ u: url, t: props.getProperty("TOKEN") }));
  const enlace = APP_URL + "#config=" + cfg;
  const html = HtmlService.createHtmlOutput(
    '<div style="font-family:sans-serif;text-align:center">' +
    '<p style="margin:0 0 8px"><b>¿El punto de marcación es ESTE computador (lector USB)?</b></p>' +
    '<a href="' + enlace + '" target="_blank" style="display:inline-block;background:#1f5eff;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:bold">Abrir en este computador</a>' +
    '<hr style="margin:14px 0">' +
    '<p style="margin:0 0 10px"><b>¿Es un celular?</b> Abra la <b>cámara</b> del celular, apunte a este código y toque el enlace.</p>' +
    '<div id="qr" style="display:inline-block;padding:10px;background:#fff"></div>' +
    '<p style="font-size:12px;color:#666">No comparta este código: permite registrar asistencia en esta hoja.</p>' +
    '<details style="text-align:left;font-size:12px"><summary>¿No puede escanear?</summary>' +
    '<p>Envíe este enlace al celular y ábralo en Chrome:</p>' +
    '<textarea readonly style="width:100%;height:90px" onclick="this.select()">' + enlace + '</textarea></details></div>' +
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>' +
    '<script>new QRCode(document.getElementById("qr"),{text:' + JSON.stringify(enlace) +
    ',width:280,height:280,correctLevel:QRCode.CorrectLevel.L});</script>'
  ).setWidth(400).setHeight(640);
  ui.showModalDialog(html, "Conectar un celular");
}

function cambiarEnlace() { if (pedirEnlace_()) SpreadsheetApp.getUi().alert("✅ Enlace guardado. Vuelva a conectar los celulares con el QR."); }

function desconectarCelulares() {
  const ui = SpreadsheetApp.getUi();
  const r = ui.alert("Desconectar celulares",
    "Todos los celulares conectados dejarán de funcionar hasta que vuelva a escanear el QR en cada uno. ¿Continuar?",
    ui.ButtonSet.YES_NO);
  if (r !== ui.Button.YES) return;
  PropertiesService.getScriptProperties().setProperty("TOKEN", nuevoToken_());
  ui.alert("✅ Listo. Use \"2. Conectar un celular\" para conectar de nuevo los celulares autorizados.");
}

function pedirEnlace_() {
  const ui = SpreadsheetApp.getUi();
  const r = ui.prompt("Enlace del servicio",
    "Pegue el enlace de la aplicación web (empieza con https://script.google.com/ y termina en /exec).\n" +
    "Lo encuentra en Apps Script → Implementar → Gestionar implementaciones.", ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return null;
  const url = r.getResponseText().trim();
  if (!/^https:\/\/script\.google\.com\/.+\/exec$/.test(url)) {
    ui.alert("Ese enlace no es válido. Debe empezar con https://script.google.com/ y terminar en /exec");
    return null;
  }
  PropertiesService.getScriptProperties().setProperty("WEBAPP_URL", url);
  return url;
}

// ======================= SERVICIO PARA EL CELULAR =======================

function doGet() {
  return ContentService.createTextOutput("Servicio de asistencia NFC activo ✅");
}

function doPost(e) {
  let req;
  try { req = JSON.parse(e.postData.contents); } catch (_) { return json_({ ok: false, error: "Solicitud inválida" }); }

  const props = PropertiesService.getScriptProperties();
  if (!req.token || req.token !== props.getProperty("TOKEN"))
    return json_({ ok: false, noAutorizado: true, error: "Este celular no está autorizado. Vuelva a conectarlo con el código QR de la hoja." });

  try {
    const soloAdmin = ["hoy", "agregarPersona", "asignarTarjeta"];
    if (soloAdmin.indexOf(req.accion) >= 0 && !pinValido_(req.pin))
      return json_({ ok: false, pinMalo: true, error: "PIN incorrecto. Vuelva a entrar al modo administrador." });

    switch (req.accion) {
      case "ping":           return json_({ ok: true });
      case "usuarios":       return json_({ ok: true, usuarios: leerUsuarios_().filter(u => u.activo).map(publico_) });
      case "verificarPin":   return json_({ ok: pinValido_(req.pin), error: "PIN incorrecto" });
      case "marcar":         return json_(marcar_(req));
      case "hoy":            return json_(hoy_());
      case "agregarPersona": return json_(agregarPersona_(req));
      case "asignarTarjeta": return json_(asignarTarjeta_(req));
      default:               return json_({ ok: false, error: "Acción desconocida" });
    }
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}

function marcar_(req) {
  const codigo = normalizar_(req.codigo);
  if (!codigo) return { ok: true, desconocido: true, codigo: "" };
  const u = leerUsuarios_().find(x => x.activo && x.codigo === codigo);
  if (!u) return { ok: true, desconocido: true, codigo };
  const nombre = u.nombres + " " + u.apellidos;

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const reg = sh_(H_REG);
    if (req.idLocal && existeId_(reg, String(req.idLocal))) return { ok: true, duplicado: true, nombre };

    const offline = !!req.offline;
    let cuando = new Date();
    if (offline && req.fechaHora) { const d = new Date(req.fechaHora); if (!isNaN(d.getTime())) cuando = d; }

    const cache = CacheService.getScriptCache();
    const k = "ult_" + codigo;
    const ult = Number(cache.get(k) || 0);
    if (!offline && ult && cuando.getTime() - ult < ANTIREBOTE_SEG * 1000) return { ok: true, repetido: true, nombre };
    cache.put(k, String(cuando.getTime()), 120);

    const fecha = fmt_(cuando, "yyyy-MM-dd"), hora = fmt_(cuando, "HH:mm:ss");
    const res = sh_(H_RES);
    const abierto = turnoAbierto_(res, fecha, u.documento);
    let tipo, duracion = "";
    if (abierto) {
      tipo = "SALIDA";
      duracion = durTxt_(Math.max(0, seg_(hora) - seg_(abierto.entrada)));
      res.getRange(abierto.fila, 6, 1, 2).setValues([[hora, duracion]]);
    } else {
      tipo = "ENTRADA";
      res.appendRow([fecha, u.documento, nombre, u.cargo, hora, "", ""]);
    }
    reg.appendRow([fecha, hora, tipo, u.documento, nombre, codigo,
                   offline ? "Sin internet (enviado después)" : "En línea", String(req.idLocal || "")]);
    return { ok: true, tipo, nombre, hora, duracion };
  } finally {
    lock.releaseLock();
  }
}

function hoy_() {
  const fecha = fmt_(new Date(), "yyyy-MM-dd");
  const turnos = {};
  ultimasFilas_(sh_(H_RES), 7, 2000).forEach(f => {
    if (f[0] === fecha) (turnos[f[1]] = turnos[f[1]] || []).push({ entrada: f[4], salida: f[5] });
  });
  const personas = leerUsuarios_().filter(u => u.activo).map(u => {
    const t = turnos[u.documento] || [];
    const ult = t[t.length - 1];
    return Object.assign(publico_(u), {
      entrada: t.length ? t[0].entrada : "",
      salida: ult ? ult.salida : "",
      estado: !ult ? "NO_LLEGA" : (ult.salida ? "SALIO" : "EN_TURNO")
    });
  });
  return { ok: true, fecha, personas, hojaUrl: SpreadsheetApp.getActive().getUrl() };
}

function agregarPersona_(req) {
  const p = {
    tipoDoc: String(req.tipoDoc || "CC").trim().toUpperCase(),
    documento: String(req.documento || "").replace(/[.\s]/g, "").trim(),
    nombres: String(req.nombres || "").trim(),
    apellidos: String(req.apellidos || "").trim(),
    cargo: String(req.cargo || "").trim()
  };
  if (!p.nombres || !p.apellidos) throw new Error("Escriba nombres y apellidos.");
  if (!/^[0-9A-Za-z]{4,15}$/.test(p.documento)) throw new Error("El documento debe tener de 4 a 15 números o letras, sin puntos.");

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const usuarios = leerUsuarios_();
    const existe = usuarios.find(u => u.documento === p.documento);
    if (existe) throw new Error("Ya existe una persona con ese documento: " + existe.nombres + " " + existe.apellidos + ".");
    let max = 0;
    usuarios.forEach(u => { const m = /^NFC-EMP-(\d+)$/.exec(u.codigo); if (m) max = Math.max(max, Number(m[1])); });
    p.codigo = "NFC-EMP-" + String(max + 1).padStart(4, "0");
    const h = sh_(H_USU);
    h.appendRow([p.codigo, p.tipoDoc, p.documento, p.nombres, p.apellidos, p.cargo, "SI"]);
    return { ok: true, persona: p };
  } finally {
    lock.releaseLock();
  }
}

function asignarTarjeta_(req) {
  const documento = String(req.documento || "").trim();
  const codigo = normalizar_(req.codigo);
  if (!codigo) throw new Error("No se pudo leer la tarjeta.");
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const usuarios = leerUsuarios_();
    const u = usuarios.find(x => x.documento === documento);
    if (!u) throw new Error("No se encontró la persona.");
    const otro = usuarios.find(x => x.codigo === codigo && x.documento !== documento);
    if (otro) throw new Error("Esa tarjeta ya pertenece a " + otro.nombres + " " + otro.apellidos + ".");
    sh_(H_USU).getRange(u.fila, 1).setValue(codigo);
    return { ok: true, codigo, nombre: u.nombres + " " + u.apellidos };
  } finally {
    lock.releaseLock();
  }
}

// ======================= AUXILIARES =======================

function leerUsuarios_() {
  const h = sh_(H_USU);
  const n = h.getLastRow() - 1;
  if (n < 1) return [];
  return h.getRange(2, 1, n, 7).getDisplayValues().map((f, i) => ({
    fila: i + 2, codigo: normalizar_(f[0]), tipoDoc: f[1].trim(), documento: f[2].trim(),
    nombres: f[3].trim(), apellidos: f[4].trim(), cargo: f[5].trim(),
    activo: f[6].trim().toUpperCase() !== "NO"
  })).filter(u => u.documento || u.codigo);
}

function publico_(u) {
  return { codigo: u.codigo, tipoDoc: u.tipoDoc, documento: u.documento, nombres: u.nombres, apellidos: u.apellidos, cargo: u.cargo };
}

function turnoAbierto_(res, fecha, documento) {
  const last = res.getLastRow();
  if (last < 2) return null;
  const desde = Math.max(2, last - 1999);
  const datos = res.getRange(desde, 1, last - desde + 1, 7).getDisplayValues();
  for (let i = datos.length - 1; i >= 0; i--) {
    const f = datos[i];
    if (f[0] === fecha && f[1] === documento) return f[5] ? null : { fila: desde + i, entrada: f[4] };
  }
  return null;
}

function existeId_(reg, id) {
  return ultimasFilas_(reg, 8, 3000).some(f => f[7] === id);
}

function ultimasFilas_(h, columnas, max) {
  const last = h.getLastRow();
  if (last < 2) return [];
  const desde = Math.max(2, last - max + 1);
  return h.getRange(desde, 1, last - desde + 1, columnas).getDisplayValues();
}

function pinValido_(pin) {
  const cache = CacheService.getScriptCache();
  const fallos = Number(cache.get("pinFallos") || 0);
  if (fallos >= 5) throw new Error("Demasiados intentos de PIN. Espere 5 minutos.");
  const ok = !!pin && hash_(String(pin)) === PropertiesService.getScriptProperties().getProperty("PIN_HASH");
  if (!ok) cache.put("pinFallos", String(fallos + 1), 300);
  return ok;
}

function hoja_(nombre, cabecera) {
  const ss = SpreadsheetApp.getActive();
  let h = ss.getSheetByName(nombre);
  if (!h) h = ss.insertSheet(nombre);
  if (h.getLastRow() === 0) {
    h.appendRow(cabecera);
    h.getRange(1, 1, 1, cabecera.length).setFontWeight("bold").setBackground("#1d2330").setFontColor("#ffffff");
    h.setFrozenRows(1);
  }
  return h;
}

function sh_(nombre) {
  const h = SpreadsheetApp.getActive().getSheetByName(nombre);
  if (!h) throw new Error("Falta la hoja \"" + nombre + "\". Use el menú Asistencia NFC → 1. Preparar hoja.");
  return h;
}

function hash_(texto) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, "asistencia|" + texto, Utilities.Charset.UTF_8)
    .map(b => ((b + 256) % 256).toString(16).padStart(2, "0")).join("");
}

// Escribe el número de la tarjeta siempre igual, venga del celular ("04:a2:3b") o del lector USB ("04A23B")
function normalizar_(codigo) {
  let c = String(codigo || "").trim().replace(/\s+/g, "");
  if (/^[0-9a-f]{2}([:-][0-9a-f]{2})+$/i.test(c)) c = c.replace(/[:-]/g, "");
  return /^[0-9a-f]+$/i.test(c) ? c.toUpperCase() : c;
}

function nuevoToken_() { return (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, ""); }
function fmt_(d, patron) { return Utilities.formatDate(d, ZONA_HORARIA, patron); }
function seg_(hms) { const p = String(hms).split(":").map(Number); return (p[0] || 0) * 3600 + (p[1] || 0) * 60 + (p[2] || 0); }
function durTxt_(s) { const m = Math.round(s / 60); return Math.floor(m / 60) + "h " + String(m % 60).padStart(2, "0") + "m"; }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
