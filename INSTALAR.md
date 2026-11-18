# Guía de instalación (unos 10 minutos)

Al terminar tendrá:
- Una **hoja de Google** donde llegan todas las marcaciones en vivo.
- Un **celular fijo** (Android con NFC) donde las personas acercan su tarjeta.

Necesita una cuenta de Google y el celular Android con Chrome.

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

## Paso 5. Conectar el celular fijo
1. En la hoja: **Asistencia NFC → 2. Conectar un celular (código QR)**.
2. La primera vez le pide la URL del paso 4: péguela.
3. En el celular Android, abra la **cámara**, apunte al QR y toque el enlace. Se abre en Chrome y dice **"CELULAR CONECTADO"**.
4. Toque **Activar lector NFC** y acepte el permiso (solo la primera vez).

## Paso 6. Dejar el celular como kiosco
- Active el NFC: *Ajustes → Dispositivos conectados → NFC*.
- Fije la pantalla en Chrome: *Ajustes → Seguridad → Fijar app* (o "Fijación de pantalla"). Así nadie puede salir de la página.
- Déjelo conectado al cargador (la pantalla se mantiene encendida).

---

## Uso diario

**Las personas:** acercan la tarjeta a la parte de atrás del celular. La pantalla se pone **verde (ENTRADA)** o **naranja (SALIDA)** con su nombre y la hora.

**El administrador** toca **🔒 Administrar** (abajo) y escribe el PIN:
- **📋 Hoy:** quién está en turno, quién salió y quién no ha llegado. "Ver todos los registros" abre la hoja.
- **👤 Personas:** agregar personas y darles tarjeta:
  - **Grabar tarjeta nueva:** para stickers o tarjetas NFC en blanco (NTAG213/215/216).
  - **Usar tarjeta que ya tiene:** para carnés u otras tarjetas NFC existentes.
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
| "Este navegador no puede leer NFC" | Use Chrome en Android y active el NFC. En iPhone no funciona. |
| Olvidé el PIN | En la hoja: *Asistencia NFC → Cambiar PIN de administrador.* |
| Se perdió o cambió el celular | En la hoja: *Desconectar todos los celulares* y conecte el nuevo con el QR. |
