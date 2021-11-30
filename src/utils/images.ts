import html2canvas from "html2canvas";
import { saveAs } from "file-saver";

const ENC: { [key: string]: string } = {
  "+": "-",
  "/": "_",
  "=": "",
};
const DEC: { [key: string]: string } = {
  "-": "+",
  _: "/",
};

export const takeScreenshot = () => {
  const el: any = document.getElementById("root");
  document.querySelectorAll("svg").forEach((icon) => {
    icon.setAttribute(
      "width",
      Number(icon.getBoundingClientRect().width).toString()
    );
    icon.setAttribute(
      "height",
      Number(icon.getBoundingClientRect().height).toString()
    );
    icon.style.width = "";
    icon.style.height = "";
  });
  html2canvas(el, { letterRendering: true }).then((canvas) => {
    canvas.toBlob(function (blob: any) {
      // Generate file download
      saveAs(blob, `screenshot-${Date.now()}.jpg`);
    });
  });
};

export const decodeB64 = (safe: string = "") => {
  let base64 = safe.replace(/[-_]/g, (m) => DEC[m]);
  return `${base64}${"=".repeat((4 - (base64.length % 4)) % 4)}`;
};

export const encodeB64 = (base64: string = "") =>
  base64.replace(/[+/=]/g, (m) => ENC[m]);
