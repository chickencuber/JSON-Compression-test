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

function decode(string: string): string {
  const arr = string.split("");
  let begin: string;
  let end: string;
  if (arr.shift() === String.fromCharCode(0x01)) {
    begin = "{";
    end = "}";
  } else {
    begin = "[";
    end = "]";
  }
  let str = arr
    .join("")
    .replaceAll(String.fromCharCode(0x02), ":" + String.fromCharCode(0x01))
    .replaceAll(String.fromCharCode(0x03), ":{")
    .replaceAll(String.fromCharCode(0x04), ":[")
    .replaceAll(String.fromCharCode(0x05), "},")
    .replaceAll(String.fromCharCode(0x06), "],");

  while(/\01(\d+)(.*)/g.test(str)) {
    str = str.replace(/\01(\d+)(.*)/g, (_, len, str:string) => {
      const l = Number(len);
      console.log(len, str);
      return `"${str.slice(0, l)}"${str.slice(l, str.length)}`
    });
  }
  return begin + str + end;
}

if (args[0] === "encode") {
  Deno.writeFile(args[2] + ".pb", encode(string));
} else if (args[0] === "decode") {
  Deno.writeFile(
    args[2] + ".json",
    Uint8Array.from(
      decode(string)
        .split("")
        .map((v) => v.charCodeAt(0))
    )
  );
}
