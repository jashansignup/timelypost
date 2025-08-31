import { JSDOM } from "jsdom";
function toUnicodeStyle(
  str: string,
  style: "bold" | "italic" = "bold"
): string {
  const normal =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bold =
    "𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭" + "𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘴𝘵𝘶𝘷𝘄𝘅𝘆𝘇" + "𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟩𝟴𝟵";
  const italic =
    "𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡" + "𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻" + "0123456789";

  const map = style === "italic" ? italic : bold;

  return str
    .split("")
    .map((c) => {
      const i = normal.indexOf(c);
      return i !== -1 ? map[i] : c;
    })
    .join("");
}

export function quillHtmlToUnicode(html: string): string {
  const dom = new JSDOM(html);
  const body = dom.window.document.body;

  function traverse(node: Node): string {
    if (node.nodeType === 3) {
      return (node as Text).nodeValue || "";
    }
    if (node.nodeType === 1) {
      const el = node as HTMLElement;
      let content = Array.from(el.childNodes).map(traverse).join("");

      switch (el.tagName) {
        case "STRONG":
        case "B":
          return toUnicodeStyle(content, "bold");
        case "EM":
        case "I":
          return toUnicodeStyle(content, "italic");
        case "BR":
          return "\n";
        case "P":
          return content + "\n\n";
        case "LI":
          return "• " + content + "\n";
        case "UL":
        case "OL":
          return content + "\n";
        default:
          return content;
      }
    }
    return "";
  }

  return traverse(body).trim();
}
