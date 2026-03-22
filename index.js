import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.all("/", async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl || !targetUrl.startsWith("http")) {
      return res.status(400).json({ error: "Missing or invalid ?url=" });
    }

    const options = {
      method: req.method,
      headers: { ...req.headers, host: undefined },
      body: ["GET", "HEAD"].includes(req.method) ? undefined : JSON.stringify(req.body)
    };

    const response = await fetch(targetUrl, options);
    const contentType = response.headers.get("content-type");
    res.setHeader("content-type", contentType || "application/json");
    const body = await response.text();
    res.status(response.status).send(body);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/image-proxy", async (req, res) => {
  try {
    const url = req.query.url;
    const referer = req.query.referer || "";

    if (!url || !url.startsWith("http")) {
      return res.status(400).send("Invalid url");
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "*/*",
        ...(referer && { Referer: referer })
      }
    });

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = await response.arrayBuffer();

    res.setHeader("Content-Type", contentType);
    res.status(response.status).send(Buffer.from(buffer));
  } catch (error) {
    res.status(500).send("Failed to fetch image");
  }
});

app.listen(3000, () => console.log("Proxy running on port 3000"));
