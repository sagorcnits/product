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
const uri = `mongodb+srv://productHero:0FpPknYAMjKYkHZA@cluster.eer90zx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const productCollection = client.db("productHero").collection("products");
    // product create
    app.post("/products", async (req, res) => {
      const result = await productCollection.insertOne(req.body);
      res.send(result);
    });

    // product get
    app.get("/products", async (req, res) => {
      const query = req.query;
      if (query.size) {
        const page = parseInt(query.page);
        const size = parseInt(query.size);
        const skip = (page - 1) * size;

        const result = await productCollection
          .find()
          .skip(skip)
          .limit(size)
          .toArray();
        return res.send(result);
      }

      if (!query.brand) {
        const result = await productCollection.find().toArray();
        return res.send(result);
      }

      // const products = await productCollection.find().toArray();
      // const result = products.filter((item) => {
      //   if (
      //     item.brand == query.brand ||
      //     item.category == query.category ||
      //     item.price >= query.minPrice ||
      //     item.price <= query.maxPrice
      //   ) {
      //     // console.log(ite);
      //     return true;
      //   }
      // });

      // console.log(query);

      // return res.send(result.slice(0, 8));

      const price1 = query.price.split("-")[0];
      const price2 = query.price.split("-")[1];
      // console.log(price1, price2);

      const result = await productCollection
        .find({
          $and: [
            {
              price: { $gte: price1, $lte: price2 },
            },
            {
              category: query.category,
            },

            {
              brand: query.brand,
            },
          ],
        })
        .toArray();
      // console.log(query);
      return res.send(result);
    });

    app.get("/products/:search", async (req, res) => {
      const name = req.params.search;
      // console.log(name);
      if (name === "Price Low to High") {
        const products = await productCollection.find().toArray();
        const result = products.sort((a, b) => a.price - b.price);
        return res.send(result.slice(0, 8));
      } else if (name === "Price High to Low") {
        const products = await productCollection.find().toArray();
        const result = products.sort((a, b) => b.price - a.price);
        return res.send(result.slice(0, 8));
      } else if (name === "Newest first") {
        const products = await productCollection.find().toArray();

        const result = products.sort(
          (a, b) => b.date.replace(/\//g, "") - a.date.replace(/\//g, "")
        );
        return res.send(result.slice(0, 8));
      }

      const products = await productCollection.find().toArray();
      const filterData = products.filter((item) => {
        const matchProduct = item.product_name
          .toLowerCase()
          .includes(name.toLowerCase());
        return matchProduct;
      });
      res.send(filterData);
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
run().catch(console.log);

app.listen(port, () => {
  console.log("ok", port);
});
