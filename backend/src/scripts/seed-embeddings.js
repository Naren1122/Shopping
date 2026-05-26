import dotenv from "dotenv";
dotenv.config({ path: "./src/.env" });
import mongoose from "mongoose";
import Product from "../models/product.model.js";
import { generateEmbedding } from "../services/embedding.service.js";
import { connectDB } from "../lib/db.js";

const generateProductEmbeddings = async () => {
  try {
    await connectDB();
    
    const products = await Product.find({}).lean();
    console.log(`Found ${products.length} products to process`);

    let processed = 0;
    let failed = 0;

    for (const product of products) {
      try {
        const text = `${product.name} ${product.description} ${product.category}`.substring(0, 2048);
        const embedding = generateEmbedding(text);
        
        await Product.findByIdAndUpdate(product._id, { embedding });
        processed++;
        
        if (processed % 5 === 0) {
          console.log(`Processed ${processed}/${products.length} products`);
        }
      } catch (error) {
        console.error(`Error processing product ${product._id}:`, error.message);
        failed++;
      }
    }

    console.log(`\nCompleted! Processed: ${processed}, Failed: ${failed}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

generateProductEmbeddings();