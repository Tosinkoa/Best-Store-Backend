import app from "./app.js";

console.log("I have started");
const PORT = process.env.PORT || 5000;
app.listen(PORT, (req, res) => console.log(`Server running on PORT:${PORT}`));
