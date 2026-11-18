# Control de Asistencia NFC

App web (un solo HTML, sin instalar nada) para registrar la **hora de entrada y salida** acercando una tarjeta o llavero NFC.

## Archivos
| Archivo | Para qué |
|---|---|
| `index.html` | La aplicación: marcar, ver registros, exportar CSV, ver/grabar tarjetas |
| `usuarios.js` | Usuarios ficticios y su código NFC (aquí se agregan más) |

## Usuarios ficticios
| Código NFC | Documento | Nombre | Cargo |
|---|---|---|---|
| NFC-EMP-0001 | CC 1023456789 | Laura Valentina Méndez Ríos | Auxiliar administrativa |
| NFC-EMP-0002 | CC 1098765432 | Andrés Felipe Torres Gil | Técnico de soporte |
| NFC-EMP-0003 | CC 1045678123 | Camila Sofía Herrera Paz | Coordinadora de talento humano |

## Cómo funciona
1. Se acerca la tarjeta → la app lee el código grabado en ella.
2. Si la persona no tiene una entrada abierta hoy, se registra **ENTRADA**; si la tiene, se registra **SALIDA** y se calcula el tiempo trabajado.
3. Si la misma tarjeta se acerca dos veces en menos de 10 s, se ignora (evita dobles marcaciones).
4. Los registros se guardan en el navegador (localStorage) y se pueden exportar a **CSV** (abre en Excel) desde la pestaña *Registros*.

## Probar en el PC
Abre `index.html` con doble clic y usa los botones de simulación (cada uno equivale a acercar la tarjeta de ese usuario).

## Usar con NFC real
- Necesitas un **celular Android con NFC** y **Chrome** (Web NFC solo funciona ahí).
- La página debe servirse por **HTTPS** (por ejemplo GitHub Pages, Netlify) o desde `localhost`.
- Tarjetas recomendadas: NTAG213 / NTAG215 / NTAG216 (baratas, regrabables).
- Para grabar: pestaña *Usuarios y tarjetas* → **Grabar en tarjeta** → acercar la tarjeta.
- Si una tarjeta no tiene texto grabado, la app usa su número de serie (UID); puedes poner ese UID como `codigoNFC` en `usuarios.js`.

## Limitaciones actuales
- Los registros viven en el navegador del dispositivo que marca. Para varios puntos de marcación o un registro central haría falta un pequeño servidor/base de datos (siguiente paso posible).
