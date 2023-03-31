const exec = require("child_process").execSync

module.exports = function () {
  const hex = exec("./src/__tests__/getHex.sh")
  globalThis.MANY_HEX = `d2${hex}`
}
