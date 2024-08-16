const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello world");
});

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://<${process.env.USER}>:<${process.env.PASSWORD}>@cluster.eer90zx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const productCollection = client
      .db("product-hero")
      .collection("productCollection");

    app.post("/products", async (req, res) => {
      try {
        const product = req.body;
        const result = await productCollection.insertOne(product);
        return res.send(result);
      } catch {
        return res.json({
          success: false,
          message: "Worng",
        });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("ok", port);
});
