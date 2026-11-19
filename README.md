# Control de Asistencia NFC

Registro de **hora de entrada y salida** con tarjetas NFC, usando un **computador con lector NFC USB** o un **celular Android**. Los datos se guardan en **Google Sheets**.

👉 **Para instalarlo, siga la [guía de instalación](INSTALAR.md).**

## Cómo está armado
| Parte | Dónde | Qué hace |
|---|---|---|
| App (computador o celular) | `index.html` (publicada en GitHub Pages) | Lee las tarjetas NFC, muestra ENTRADA/SALIDA y tiene el modo administrador |
| Servidor | `apps-script/Codigo.gs` (pegado en la hoja de Google) | Decide si es entrada o salida, guarda los registros y la lista de personas |
| Base de datos | Hoja de Google: *Usuarios*, *Resumen diario*, *Registros* | Todo queda ahí, con historial y respaldo de Google |

## Seguridad
- Solo pueden registrar los celulares conectados con el **código QR** de la hoja (llevan una clave secreta). Desde la hoja se pueden desconectar todos.
- La **hora** la pone el servidor de Google, no el celular (salvo marcaciones hechas sin internet, que quedan señaladas).
- El modo administrador pide un **PIN** que se verifica en el servidor. Se bloquea 5 minutos tras 5 intentos fallidos y se cierra solo a los 2 minutos sin uso.
- Las tarjetas guardan solo un código (texto), no un enlace: acercarlas a otro celular no registra nada.
- Una misma tarjeta no puede quedar asignada a dos personas.

## Qué se guarda en el celular
Solo lo necesario para funcionar: la conexión con la hoja, una copia de la lista de personas (para funcionar sin internet) y las marcaciones pendientes por enviar. Los registros oficiales están en Google Sheets.

## Tarjetas
- Stickers, tarjetas o llaveros **NTAG213 / NTAG215 / NTAG216**: se graban desde *Administrar → Personas → Grabar tarjeta nueva*.
- Carnés u otras tarjetas NFC existentes: *Usar tarjeta que ya tiene* (se usa su número de serie).
- Una tarjeta impresa (papel o impresora 3D) **no tiene NFC** por sí sola: hay que ponerle un sticker NFC dentro o encima.
