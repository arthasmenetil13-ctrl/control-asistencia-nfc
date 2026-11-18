// Usuarios ficticios del sistema de asistencia.
// "codigoNFC" es el texto que se graba en la tarjeta/llavero NFC (registro NDEF de texto).
// Para agregar un usuario, copia un bloque y cambia los datos; el código debe ser único.
window.USUARIOS = [
  {
    codigoNFC: "NFC-EMP-0001",
    tipoDocumento: "CC",
    documento: "1023456789",
    nombres: "Laura Valentina",
    apellidos: "Méndez Ríos",
    cargo: "Auxiliar administrativa"
  },
  {
    codigoNFC: "NFC-EMP-0002",
    tipoDocumento: "CC",
    documento: "1098765432",
    nombres: "Andrés Felipe",
    apellidos: "Torres Gil",
    cargo: "Técnico de soporte"
  },
  {
    codigoNFC: "NFC-EMP-0003",
    tipoDocumento: "CC",
    documento: "1045678123",
    nombres: "Camila Sofía",
    apellidos: "Herrera Paz",
    cargo: "Coordinadora de talento humano"
  }
];
