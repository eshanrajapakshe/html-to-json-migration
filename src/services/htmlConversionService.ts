import { ENV } from "../config/env";
import { sql } from "../config/database";
import { HTMLToJSON } from "html-to-json-parser";
import sanitizeHtml from "sanitize-html";
import { JSDOM } from "jsdom";

// Function to process and convert HTML String to JSON
export const processRecord = async (
  id: number | string,
  htmlString: string
) => {
  const sanitizedHTML = sanitizeHtml(htmlString, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "script", "style"],
    allowedAttributes: false,
    allowVulnerableTags: true,
  });

  const dom = new JSDOM();
  const textarea = dom.window.document.createElement("textarea");
  textarea.innerHTML = sanitizedHTML;
  const cleanHTML = textarea.value;

  const wrappedHTML = `<document>${cleanHTML.replaceAll("\n", "")}</document>`;
  const jsonResult = await HTMLToJSON(wrappedHTML, true);

  await new sql.Request()
    .input("id", sql.NVarChar, id)
    .input("json", sql.NVarChar(sql.MAX), JSON.stringify(jsonResult))
    .query(
      `UPDATE ${ENV.FULL_TABLE_NAME} 
       SET [${ENV.TABLE_JSON_COLUMN}] = @json 
       WHERE [id] = @id`
    );

  console.log(`Updated record with ID: ${id}`);
};

export async function convertHtmlToJson(html: string) {
  try {
    const sanitizedHTML = sanitizeHtml(html, {
      allowedTags: [...sanitizeHtml.defaults.allowedTags, "script", "style"],
      allowedAttributes: false,
      allowVulnerableTags: true,
    });

    const dom = new JSDOM();
    const textarea = dom.window.document.createElement("textarea");
    textarea.innerHTML = sanitizedHTML;
    const cleanHTML = textarea.value;

    const wrappedHTML = `<document>${cleanHTML.replaceAll(
      "\n",
      ""
    )}</document>`;
    const jsonResult = await HTMLToJSON(wrappedHTML, true);
    return jsonResult;
  } catch (error) {
    return null;
  }
}
