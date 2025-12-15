export function generateSlug(name) {
  return (
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-") +
    "-" +
    Math.floor(1000 + Math.random() * 9000)
  );
}
