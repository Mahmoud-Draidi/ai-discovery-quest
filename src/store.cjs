const fs = require("node:fs/promises");
const path = require("node:path");
const { normalize } = require("./state.js");

function createStore(directory) {
  const file = path.join(directory, "progress.json");
  let writes = Promise.resolve();
  async function load() {
    try { return normalize(JSON.parse(await fs.readFile(file, "utf8"))); }
    catch (error) {
      if (error.code === "ENOENT") return normalize();
      // Keep damaged data intact so a fresh write cannot silently overwrite it.
      throw new Error("Your saved progress could not be read. It has been kept intact. Close the app and ask for help recovering progress.json.");
    }
  }
  function save(value) {
    const state = normalize(value);
    const write = writes.catch(() => {}).then(async () => {
      await fs.mkdir(directory, { recursive: true });
      await fs.writeFile(file + ".tmp", JSON.stringify(state, null, 2), "utf8");
      await fs.rename(file + ".tmp", file);
      return state;
    });
    writes = write;
    return write;
  }
  return { load, save, flush: () => writes, file };
}
module.exports = { createStore };
