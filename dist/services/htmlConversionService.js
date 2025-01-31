"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processRecord = void 0;
exports.convertHtmlToJson = convertHtmlToJson;
const env_1 = require("../config/env");
const database_1 = require("../config/database");
const html_to_json_parser_1 = require("html-to-json-parser");
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const jsdom_1 = require("jsdom");
// Function to process and convert HTML String to JSON
const processRecord = async (id, htmlString) => {
    const sanitizedHTML = (0, sanitize_html_1.default)(htmlString, {
        allowedTags: [...sanitize_html_1.default.defaults.allowedTags, "script", "style"],
        allowedAttributes: false,
        allowVulnerableTags: true,
    });
    const dom = new jsdom_1.JSDOM();
    const textarea = dom.window.document.createElement("textarea");
    textarea.innerHTML = sanitizedHTML;
    const cleanHTML = textarea.value;
    const wrappedHTML = `<document>${cleanHTML.replaceAll("\n", "")}</document>`;
    const jsonResult = await (0, html_to_json_parser_1.HTMLToJSON)(wrappedHTML, true);
    await new database_1.sql.Request()
        .input("id", database_1.sql.NVarChar, id)
        .input("json", database_1.sql.NVarChar(database_1.sql.MAX), JSON.stringify(jsonResult))
        .query(`UPDATE ${env_1.ENV.FULL_TABLE_NAME} 
       SET [${env_1.ENV.TABLE_JSON_COLUMN}] = @json 
       WHERE [id] = @id`);
    console.log(`Updated record with ID: ${id}`);
};
exports.processRecord = processRecord;
async function convertHtmlToJson(html) {
    try {
        const sanitizedHTML = (0, sanitize_html_1.default)(html, {
            allowedTags: [...sanitize_html_1.default.defaults.allowedTags, "script", "style"],
            allowedAttributes: false,
            allowVulnerableTags: true,
        });
        const dom = new jsdom_1.JSDOM();
        const textarea = dom.window.document.createElement("textarea");
        textarea.innerHTML = sanitizedHTML;
        const cleanHTML = textarea.value;
        const wrappedHTML = `<document>${cleanHTML.replaceAll("\n", "")}</document>`;
        const jsonResult = await (0, html_to_json_parser_1.HTMLToJSON)(wrappedHTML, true);
        return jsonResult;
    }
    catch (error) {
        return null;
    }
}
