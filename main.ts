const args = Deno.args;
const string = new TextDecoder("utf-8").decode(await Deno.readFile(args[1]));

function encode(string: string): Uint8Array {
  const newString = string
    .replaceAll(/\s+(?=(?:[^"]*"[^"]*")*[^"]*$)/g, "")
    .replaceAll(/"(.*?)"/g, (_, str) => {
      return String.fromCharCode(0x01) + str.length + str;
    })
    .replaceAll(":" + String.fromCharCode(0x01), String.fromCharCode(0x02))
    .replaceAll(":{", String.fromCharCode(0x03))
    .replaceAll(":[", String.fromCharCode(0x04))
    .replaceAll("},", String.fromCharCode(0x05))
    .replaceAll("],", String.fromCharCode(0x06));
  const arr = newString.split("");
  arr.pop();
  if (arr.shift() === "{") {
    arr.unshift(String.fromCharCode(0x01));
  } else {
    arr.unshift(String.fromCharCode(0x02));
  }
  return Uint8Array.from(arr.map((v) => v.charCodeAt(0)));
}

Deno.writeFile(args[2] + ".pb", Uint8Array.from(encode(string)));
