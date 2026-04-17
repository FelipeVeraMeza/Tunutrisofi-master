export const formatRut = (rut) => {
  if (!rut) return '';
  // Remove all non-alphanumeric characters
  let value = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (value.length <= 1) return value;
  
  // Extract the verifier digit
  const dv = value.slice(-1);
  // Extract the numbers
  let numbers = value.slice(0, -1);
  
  // Add dots every 3 digits
  numbers = numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${numbers}-${dv}`;
};

export const validateRut = (rut) => {
  if (!rut) return false;
  // Basic format validation
  if (!/^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9K]$/i.test(rut)) return false;
  
  // Clean RUT for mod11 validation
  const cleanRut = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  const t = parseInt(cleanRut.slice(0, -1), 10);
  const m = 0;
  let s = 1;
  let tempT = t;
  
  while (tempT > 0) {
    s = (s + (tempT % 10) * (9 - (m % 6))) % 11;
    tempT = Math.floor(tempT / 10);
  }
  
  const v = s > 0 ? '' + (s - 1) : 'K';
  return v === cleanRut.slice(-1);
};