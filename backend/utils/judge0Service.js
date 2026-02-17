const axios = require("axios");

const JUDGE0_BASE_URL = process.env.JUDGE0_BASE_URL || "https://ce.judge0.com";
const USE_RAPIDAPI = String(process.env.JUDGE0_USE_RAPIDAPI).toLowerCase() === "true";

function buildHeaders() {
  if (!USE_RAPIDAPI) return {};
  return {
    "X-RapidAPI-Host": process.env.JUDGE0_RAPIDAPI_HOST,
    "X-RapidAPI-Key": process.env.JUDGE0_RAPIDAPI_KEY,
  };
}

function b64(str) {
  return Buffer.from(str ?? "", "utf8").toString("base64");
}

function unb64(str) {
  if (!str) return "";
  return Buffer.from(str, "base64").toString("utf8");
}

async function createSubmission({ languageId, sourceCode, stdin = "" }) {
  const url = `${JUDGE0_BASE_URL}/submissions?base64_encoded=true&wait=true`;

  const payload = {
    language_id: Number(languageId),
    source_code: b64(sourceCode),
    stdin: b64(stdin),
  };

  const { data } = await axios.post(url, payload, { headers: buildHeaders() });

  
  return {
    ...data,
    stdout: unb64(data.stdout),
    stderr: unb64(data.stderr),
    compile_output: unb64(data.compile_output),
    message: unb64(data.message),
  };
}

module.exports = { createSubmission };
