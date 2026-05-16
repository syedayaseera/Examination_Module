const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const app = require("./app");

const PORT = process.env.PORT || 5001;

if (!process.env.JWT_SECRET) {
  console.warn("JWT_SECRET is missing. Set it in .env before using this API.");
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
