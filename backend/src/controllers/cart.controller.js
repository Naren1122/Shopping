import Product from "../models/product.model.js";

export const getCartProducts = async (req, res) => {
  try {
    const user = req.user;

    // Check for old cart items without product reference and migrate them
    let needsSave = false;
    const oldCartItems = user.cartItems.filter(
      (item) => !item.product && item.id,
    );

    if (oldCartItems.length > 0) {
      // Migrate old id-based cart items to product reference format
      for (const item of oldCartItems) {
        item.product = item.id;
        delete item.id;
        needsSave = true;
      }
      if (needsSave) {
        await user.save();
      }
    }

    // Get cart items with product references
    const cartItemsWithProducts = user.cartItems.filter((item) => item.product);

    if (cartItemsWithProducts.length === 0) {
      return res.json([]);
    }

    const productIds = cartItemsWithProducts.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    // Create a map for quick lookup
    const productMap = new Map(
      products.map((product) => [product._id.toString(), product]),
    );

    // Map cart items with product data
    const cartItems = cartItemsWithProducts
      .map((item) => {
        const product = productMap.get(item.product.toString());
        if (!product) return null;
        return {
          _id: product._id,
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          category: product.category,
          quantity: item.quantity,
        };
      })
      .filter(Boolean);

    res.json(cartItems);
  } catch (error) {
    console.log("Error in getCartProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const user = req.user;

    // Default to 1 if quantity not provided
    const quantityToAdd = quantity || 1;

    // Find the product to verify it exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check for old format item and migrate if found
    const oldItemIndex = user.cartItems.findIndex(
      (item) => item.id && item.id === productId,
    );

    if (oldItemIndex !== -1) {
      // Migrate old item to new format
      user.cartItems[oldItemIndex].product = productId;
      delete user.cartItems[oldItemIndex].id;
    }

    // Find existing item with the same product reference
    const existingItem = user.cartItems.find(
      (item) => item.product && item.product.toString() === productId,
    );

    if (existingItem) {
      existingItem.quantity += quantityToAdd;
    } else {
      user.cartItems.push({
        product: productId,
        quantity: quantityToAdd,
      });
    }

    await user.save();

    // Return updated cart items with product details
    const cartItemsWithProducts = user.cartItems.filter((item) => item.product);
    const productIds = cartItemsWithProducts.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const cartItems = cartItemsWithProducts
      .map((item) => {
        const product = productMap.get(item.product.toString());
        if (!product) return null;
        return {
          _id: product._id,
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          category: product.category,
          quantity: item.quantity,
        };
      })
      .filter(Boolean);

    res.json(cartItems);
  } catch (error) {
    console.log("Error in addToCart controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;
    if (!productId) {
      user.cartItems = [];
    } else {
      user.cartItems = user.cartItems.filter(
        (item) =>
          item.product &&
          item.product.toString() !== productId &&
          (!item.id || item.id !== productId),
      );
    }
    await user.save();

    // Return updated cart items with product details
    const cartItemsWithProducts = user.cartItems.filter((item) => item.product);
    const productIds = cartItemsWithProducts.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const cartItems = cartItemsWithProducts
      .map((item) => {
        const product = productMap.get(item.product.toString());
        if (!product) return null;
        return {
          _id: product._id,
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          category: product.category,
          quantity: item.quantity,
        };
      })
      .filter(Boolean);

    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;

    // First try to find by product reference (new format)
    let existingItem = user.cartItems.find(
      (item) => item.product && item.product.toString() === productId,
    );

    // If not found, try by id (old format for backward compatibility)
    if (!existingItem) {
      existingItem = user.cartItems.find(
        (item) => item.id && item.id === productId,
      );

      // Migrate to new format if found
      if (existingItem) {
        existingItem.product = existingItem.id;
        delete existingItem.id;
      }
    }

    if (existingItem) {
      if (quantity === 0) {
        user.cartItems = user.cartItems.filter(
          (item) =>
            item.product &&
            item.product.toString() !== productId &&
            (!item.id || item.id !== productId),
        );
        await user.save();
        return res.json([]);
      }

      existingItem.quantity = quantity;
      await user.save();

      // Return updated cart with product details
      const cartItemsWithProducts = user.cartItems.filter(
        (item) => item.product,
      );
      const productIds = cartItemsWithProducts.map((item) => item.product);
      const products = await Product.find({ _id: { $in: productIds } });

      const productMap = new Map(products.map((p) => [p._id.toString(), p]));

      const cartItems = cartItemsWithProducts
        .map((item) => {
          const product = productMap.get(item.product.toString());
          if (!product) return null;
          return {
            _id: product._id,
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.image,
            category: product.category,
            quantity: item.quantity,
          };
        })
        .filter(Boolean);

      res.json(cartItems);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log("Error in updateQuantity controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
