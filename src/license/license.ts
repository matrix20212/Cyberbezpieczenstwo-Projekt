import fs from "fs";

const path = "./license.json";

export function loadLicense() {
  return JSON.parse(fs.readFileSync(path, "utf-8"));
}

export function saveLicense(data: any) {
  fs.writeFileSync(path, JSON.stringify(data));
}

export function incrementRunCount() {
  const data = loadLicense();
  data.runCount++;
  saveLicense(data);
}

export function isLicensed() {
  return loadLicense().licensed;
}

export function activateLicense() {
  const data = loadLicense();
  data.licensed = true;
  saveLicense(data);
}

export function decryptCaesar(str: string, shift=3) {
  return str.replace(/[A-Za-z0-9]/g, (c: string) => {
    let code = c.charCodeAt(0);

    if (c >= 'A' && c <= 'Z') return String.fromCharCode(((code - 65 - shift + 26) % 26) + 65);
    if (c >= '0' && c <= '9') return String.fromCharCode(((code - 48 - shift + 10) % 10) + 48);

    return c;
  });
}
