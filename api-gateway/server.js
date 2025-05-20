const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const port = 3000;

app.use("/user", createProxyMiddleware({ target: "http://localhost:3001", changeOrigin: true }));
app.use("/products", createProxyMiddleware({ target: "http://localhost:3002", changeOrigin: true }));
app.use("/orders", createProxyMiddleware({ target: "http://localhost:3003", changeOrigin: true }));
app.use("/cart", createProxyMiddleware({ target: "http://localhost:3004", changeOrigin: true }));
app.use("/transactions", createProxyMiddleware({ target: "http://localhost:3005", changeOrigin: true }));
app.use("/category", createProxyMiddleware({ target: "http://localhost:3006", changeOrigin: true }));

app.get("/", (req, res) => {
  res.send("Welcome to the API Gateway!");
});

app.listen(port, () => {
  console.log(`API Gateway is running on http://localhost:${port}`);
});
