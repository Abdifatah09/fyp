export function judge0ToMonaco(languageId) {
  const id = Number(languageId);
  if (id === 91) return "java";
  if (id === 102) return "javascript";
  return "plaintext";
}

export function defaultTemplateFor(languageId) {
  const id = Number(languageId);
  if (id === 91) {
    return `public class Main {
  public static void main(String[] args) {
    // TODO
  }
}
`;
  }
  if (id === 102) {
    return `// TODO
`;
  }
  return "";
}
