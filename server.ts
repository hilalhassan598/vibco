import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const DATASET: Record<string, any> = {
  "Kozhikode-Areekad": {
    "soil": "Laterite",
    "crops": ["Coconut", "Rubber", "Cashew"],
    "base_explanation": "Laterite soil is common in this region and supports plantation crops."
  },
  "Palakkad-Chittur": {
    "soil": "Clay",
    "crops": ["Paddy"],
    "base_explanation": "Clay soil retains water and is ideal for paddy cultivation."
  },
  "Thiruvananthapuram-Neyyattinkara": {
    "soil": "Red Soil",
    "crops": ["Tapioca", "Vegetables", "Banana"],
    "base_explanation": "Red soil is rich in iron and suitable for a variety of crops with proper irrigation."
  },
  "Alappuzha-Kuttanad": {
    "soil": "Peaty/Saline",
    "crops": ["Paddy", "Coconut"],
    "base_explanation": "Kuttanad is famous for below-sea-level farming in peaty soils."
  },
  "Idukki-Munnar": {
    "soil": "Forest/Hill Soil",
    "crops": ["Tea", "Coffee", "Cardamom"],
    "base_explanation": "High altitude forest soil is rich in organic matter, perfect for spices and plantation crops."
  }
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route
  app.post("/api/analyze-location", (req, res) => {
    const { district, area } = req.body;
    const key = `${district}-${area}`;
    const data = DATASET[key];

    if (data) {
      res.json({
        soil_type: data.soil,
        confidence: "High",
        base_explanation: data.base_explanation,
        crops: data.crops
      });
    } else {
      res.status(404).json({ error: "Location not found in our database. Try Kozhikode-Areekad or Palakkad-Chittur." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
