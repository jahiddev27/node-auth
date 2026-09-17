const app = require("./app");

const PORT = process.env.PORT || 5000;


// Server start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});