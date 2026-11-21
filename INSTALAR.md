# Guía de instalación (unos 10 minutos)

Al terminar tendrá:
- Una **hoja de Google** donde llegan todas las marcaciones en vivo.
- Un **punto de marcación** donde las personas acercan su tarjeta. Puede ser:
  - **Opción A — Computador + lector NFC USB** (recomendado para un punto fijo), o
  - **Opción B — Celular Android con NFC**.

Necesita una cuenta de Google y Chrome (en el computador o en el celular).

---

## ¿Qué va dentro de la tarjeta NFC?

Cada tarjeta tiene dos cosas, y el sistema reconoce a la persona por cualquiera de las dos:

1. **Un texto grabado** con el código de la persona, por ejemplo `NFC-EMP-0001`. Lo graba la empresa que imprime las tarjetas (o usted desde la app). **El celular lo lee.**
2. **Un número de serie de fábrica**, único, por ejemplo `04A23B1C5D8080`. No se graba: ya viene. **El lector USB del computador lee este.**

**Para que la misma tarjeta sirva en el celular y en el computador:**
- La primera vez que alguien marca con el **celular**, el sistema guarda solo el número de serie de su tarjeta (columna *Nº de serie tarjeta* de la hoja). Desde ahí funciona también en el **computador**.
- Si una tarjeta se va a usar primero en el computador, asígnela una vez: *Administrar → Personas → Asignar tarjeta* y pásela por el lector.
- Si el proveedor entrega la lista de números de serie, también puede pegarlos en esa columna.

### Para la prueba con los 3 usuarios de ejemplo
| Persona de prueba | Documento | Texto a grabar en la tarjeta |
|---|---|---|
| Laura Valentina Méndez Ríos | CC 1023456789 | `NFC-EMP-0001` |
| Andrés Felipe Torres Gil | CC 1098765432 | `NFC-EMP-0002` |
| Camila Sofía Herrera Paz | CC 1045678123 | `NFC-EMP-0003` |

- **Tarjetas del proveedor:** pídalas con chip NTAG215 y un registro de **Texto** con el código de la tabla. Llegan listas: solo acérquelas al celular.
- **Grabarlas usted (celular):** en *Administrar → Personas* toque **Grabar tarjeta nueva** en "Laura" y acerque un sticker o tarjeta NFC en blanco.
  - Con otra app (por ejemplo **NFC Tools**): *Escribir → Agregar un registro → Texto* → escriba `NFC-EMP-0001` → *Escribir* y acerque la tarjeta.
- **Sin grabar nada:** *Administrar → Personas → Usar tarjeta que ya tiene* (celular) o *Asignar tarjeta* (computador), y acerque cualquier tarjeta NFC.

> Una tarjeta impresa en papel o en impresora 3D **no tiene NFC**. Necesita un sticker, tarjeta o llavero NFC (NTAG213/215/216 o MIFARE) dentro o pegado.

---

## Paso 1. Crear la hoja de cálculo
1. Entre a [sheets.new](https://sheets.new) con la cuenta de Google de la empresa. Se abre una hoja en blanco.
2. Póngale un nombre arriba a la izquierda, por ejemplo **Asistencia NFC**.

## Paso 2. Pegar el código del servidor
1. En la hoja, menú **Extensiones → Apps Script**. Se abre una pestaña nueva.
2. Borre todo lo que aparece en el editor (`function myFunction() {...}`).
3. Abra el archivo [`apps-script/Codigo.gs`](apps-script/Codigo.gs), toque **Copiar** (ícono 📋 arriba a la derecha del archivo) y péguelo en el editor.
4. Toque **💾 Guardar**.

## Paso 3. Preparar la hoja
1. Vuelva a la pestaña de la hoja y **recargue la página** (F5). Después de unos segundos aparece el menú **Asistencia NFC**.
2. Menú **Asistencia NFC → 1. Preparar hoja (solo la primera vez)**.
3. Google le pedirá permisos: **Continuar → elija su cuenta → Configuración avanzada → Ir a (proyecto) → Permitir**.
   (Aparece "Google no verificó esta app" porque el código es suyo; es normal.)
4. Vuelva a usar **1. Preparar hoja** si el primer intento solo pidió permisos.
5. Escriba el **PIN de administrador** (4 a 8 números). Se usa en el celular para entrar a Administrar.

Ahora la hoja tiene 3 pestañas: **Usuarios**, **Resumen diario** y **Registros**, con 3 personas de prueba.

## Paso 4. Publicar el servicio
1. En la pestaña de Apps Script: botón azul **Implementar → Nueva implementación**.
2. En el engranaje ⚙️ de "Seleccionar tipo", elija **Aplicación web**.
3. Configure:
   - **Ejecutar como:** Yo
   - **Quién tiene acceso:** Cualquier usuario
4. **Implementar** → copie la **URL de la aplicación web** (termina en `/exec`).

> "Cualquier usuario" es necesario para que el celular pueda enviar datos sin iniciar sesión.
> Aun así, solo los celulares conectados con el QR (que llevan una clave secreta) pueden registrar.

## Paso 5. Conectar el punto de marcación
1. En la hoja: **Asistencia NFC → 2. Conectar un celular (código QR)**.
2. La primera vez le pide la URL del paso 4: péguela.

### Opción A — Computador con lector USB
1. Compre un **lector NFC USB de 13.56 MHz con emulación de teclado** (dice *HID*, *keyboard emulation* o *plug and play*; NO uno de 125 kHz).
2. Conéctelo al computador. No necesita instalar nada.
3. **Pruebe el lector:** abra el Bloc de notas y pase una tarjeta. Debe aparecer un número y saltar de línea. Si es así, funciona.
4. En la ventana del QR de la hoja (en ese mismo computador) toque **Abrir en este computador**. Debe decir **"CONECTADO"**.
5. Pase una tarjeta: abajo debe aparecer **🟢 Lector USB funcionando**.

**Dejar el computador como kiosco (Windows):**
1. Clic derecho en el escritorio → *Nuevo → Acceso directo*.
2. En la ubicación pegue (una sola línea):
   ```
   "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk https://arthasmenetil13-ctrl.github.io/control-asistencia-nfc/
   ```
3. Nómbrelo **Asistencia** y ábralo: Chrome se abre a pantalla completa, sin barras.
4. Para que arranque solo al prender el PC: tecla Windows + R → escriba `shell:startup` → copie ahí el acceso directo.
5. Para salir del modo kiosco: **Alt + F4**.
6. En *Configuración → Sistema → Energía* ponga la pantalla y la suspensión en **Nunca**.

> Importante: la página ignora lo que escriba una persona en el teclado, pero aun así deje el teclado guardado o fuera del alcance.

### Opción B — Celular Android
1. En el celular, abra la **cámara**, apunte al QR y toque el enlace. Se abre en Chrome y dice **"CONECTADO"**.
2. Toque **Activar lector NFC** y acepte el permiso (solo la primera vez).

## Paso 6. Dejar el celular como kiosco (solo opción B)
- Active el NFC: *Ajustes → Dispositivos conectados → NFC*.
- Fije la pantalla en Chrome: *Ajustes → Seguridad → Fijar app* (o "Fijación de pantalla"). Así nadie puede salir de la página.
- Déjelo conectado al cargador (la pantalla se mantiene encendida).

---

## Uso diario

**Las personas:** acercan la tarjeta a la parte de atrás del celular. La pantalla se pone **verde (ENTRADA)** o **naranja (SALIDA)** con su nombre y la hora.

**El administrador** toca **🔒 Administrar** (abajo) y escribe el PIN:
- **📋 Hoy:** quién está en turno, quién salió y quién no ha llegado. "Ver todos los registros" abre la hoja.
- **👤 Personas:** agregar personas y darles tarjeta:
  - **En el computador:** *Asignar tarjeta* y pasarla por el lector.
  - **En el celular:** *Grabar tarjeta nueva* (stickers NFC en blanco) o *Usar tarjeta que ya tiene* (carnés).
- **⚙️ Más:** probar sin tarjeta, ver marcaciones pendientes y desconectar el celular.
- Toque **✔ Terminar** al acabar. Si se le olvida, se cierra solo a los 2 minutos.

**En la hoja de Google:**
- **Usuarios:** también puede agregar o editar personas aquí. Para que alguien ya no pueda marcar, ponga **NO** en "Activo".
- **Resumen diario:** una fila por turno con entrada, salida y horas trabajadas.
- **Registros:** cada vez que alguien acercó la tarjeta, incluso si fue sin internet.
- Para descargar en Excel: *Archivo → Descargar → Microsoft Excel*.

**Sin internet:** el celular guarda las marcaciones (con la hora real) y las envía solas cuando vuelve la conexión. En la hoja aparecen con origen "Sin internet (enviado después)".

---

## Problemas comunes
| Problema | Solución |
|---|---|
| No aparece el menú Asistencia NFC | Recargue la hoja y espere unos segundos. |
| "Este celular no está autorizado" | Vuelva a escanear el QR (paso 5). Pasa si se usó "Desconectar todos los celulares". |
| Cambié el código en Apps Script y no se nota | *Implementar → Gestionar implementaciones → ✏️ → Versión: Nueva versión → Implementar.* |
| El lector USB no hace nada | Pruébelo en el Bloc de notas. Si no escribe, es de 125 kHz o necesita drivers: cámbielo por uno HID de 13.56 MHz. |
| El lector escribe el número pero no marca | Haga clic una vez en la página (que no esté en otra ventana) y vuelva a pasar la tarjeta. |
| Una tarjeta asignada con el celular no funciona en el lector USB | Algunos lectores escriben el número en otro formato. Vuelva a asignarla desde el computador. |
| En el celular no lee NFC | Use Chrome en Android y active el NFC. En iPhone no funciona. |
| Olvidé el PIN | En la hoja: *Asistencia NFC → Cambiar PIN de administrador.* |
| Se perdió o cambió el celular | En la hoja: *Desconectar todos los celulares* y conecte el nuevo con el QR. |
