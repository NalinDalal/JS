/**
 * Module 07 — 7.9 File & Blob API
 * Blob, File, FileReader, createObjectURL, drag-and-drop, FormData
 *
 * Paste in browser DevTools console.
 */

console.log("--- Blob creation ---");
const textBlob = new Blob(["Hello, world!"], { type: "text/plain" });
console.log("textBlob.size:", textBlob.size);  // 13
console.log("textBlob.type:", textBlob.type);  // "text/plain"

const uint8 = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
const binBlob = new Blob([uint8], { type: "application/octet-stream" });
console.log("binBlob.size:", binBlob.size); // 5

console.log("\n--- Blob.slice() ---");
const chunk = textBlob.slice(0, 5, "text/plain");
console.log("chunk size:", chunk.size); // 5
console.log("chunk type:", chunk.type); // "text/plain"

console.log("\n--- Blob as URL (createObjectURL) ---");
const url = URL.createObjectURL(textBlob);
console.log("blob url:", url); // "blob:http://..."
console.log("Revoke with URL.revokeObjectURL(url)");

console.log("\n--- File (extends Blob) ---");
console.log("File has: name, lastModified, size, type, webkitRelativePath");
// fileInput.addEventListener("change", (e) => {
//   const file = e.target.files[0];
//   console.log(file.name, file.size, file.type);
// });

console.log("\n--- FileReader ---");
console.log("readAsText(file)     — read as string");
console.log("readAsDataURL(file)  — read as base64 data URL");
console.log("readAsArrayBuffer(file) — read as ArrayBuffer");
console.log("Events: onload, onprogress, onerror");

console.log("\n--- Download a Blob ---");
function downloadJSON(data, filename = "data.json") {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
console.log("downloadJSON({ hello: 'world' }) defined");

console.log("\n--- Drag-and-drop pattern ---");
// dropZone.addEventListener("dragover", (e) => e.preventDefault());
// dropZone.addEventListener("drop", (e) => {
//   e.preventDefault();
//   const files = e.dataTransfer.files;
//   Array.from(files).forEach(processFile);
// });

console.log("\n--- FormData with files ---");
// const fd = new FormData();
// fd.append("avatar", fileInput.files[0]);
// fetch("/upload", { method: "POST", body: fd });
