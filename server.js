import server from "./app.js";

const PORT = process.env.PORT || 8000;
server.listen(PORT, (req, res) => console.log(`Server running on PORT:${PORT}`));
