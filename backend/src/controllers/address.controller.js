import Address from "../models/address.model.js";

// @desc    Get all addresses for current user
// @route   GET /api/addresses
// @access  Private
export const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id })
      .populate("user", "name")
      .sort({
        createdAt: -1,
      });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add new address
// @route   POST /api/addresses
// @access  Private
export const addAddress = async (req, res) => {
  try {
    const {
      address,
      city,
      district,
      province,
      ward,
      phone,
      isDefault,
      latitude,
      longitude,
      locationAddress,
    } = req.body;

    // If this is set as default, unset all other defaults
    if (isDefault) {
      await Address.updateMany(
        { user: req.user._id },
        { $set: { isDefault: false } },
      );
    }

    const newAddress = await Address.create({
      user: req.user._id,

      address,
      city,
      district,
      province,
      ward,
      phone,
      isDefault: isDefault || false,
      latitude,
      longitude,
      locationAddress,
    });

    res.status(201).json(newAddress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
export const updateAddress = async (req, res) => {
  try {
    const {
      ward,
      address,
      city,
      district,
      province,
      phone,
      isDefault,
      latitude,
      longitude,
      locationAddress,
    } = req.body;

    const existingAddress = await Address.findById(req.params.id);

    if (!existingAddress) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Check ownership
    if (existingAddress.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // If setting as default, unset all other defaults
    if (isDefault && !existingAddress.isDefault) {
      await Address.updateMany(
        { user: req.user._id },
        { $set: { isDefault: false } },
      );
    }

    const updatedAddress = await Address.findByIdAndUpdate(
      req.params.id,
      {
        address,
        city,
        district,
        province,
        ward,
        phone,
        latitude,
        longitude,
        locationAddress,
        isDefault:
          isDefault !== undefined ? isDefault : existingAddress.isDefault,
      },
      { new: true },
    );

    res.json(updatedAddress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
export const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Check ownership
    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Address.findByIdAndDelete(req.params.id);

    res.json({ message: "Address removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Set address as default
// @route   PATCH /api/addresses/:id/default
// @access  Private
export const setDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Check ownership
    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Unset all other defaults
    await Address.updateMany(
      { user: req.user._id },
      { $set: { isDefault: false } },
    );

    // Set this as default
    address.isDefault = true;
    await address.save();

    res.json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
