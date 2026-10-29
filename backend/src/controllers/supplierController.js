const Supplier = require('../models/Supplier');
const { logActivity } = require('../utils/activityLogger');

exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll({
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: suppliers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch suppliers',
      error: error.message
    });
  }
};

exports.getSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    res.json({
      success: true,
      data: supplier
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch supplier',
      error: error.message
    });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);

    await logActivity(
      req.user.id,
      'Create Supplier',
      'Suppliers',
      supplier.id,
      `Created supplier: ${supplier.name}`,
      req.ip
    );

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: supplier
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create supplier',
      error: error.message
    });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    await supplier.update(req.body);

    await logActivity(
      req.user.id,
      'Update Supplier',
      'Suppliers',
      supplier.id,
      `Updated supplier: ${supplier.name}`,
      req.ip
    );

    res.json({
      success: true,
      message: 'Supplier updated successfully',
      data: supplier
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update supplier',
      error: error.message
    });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    await supplier.update({ status: 'inactive' });

    await logActivity(
      req.user.id,
      'Delete Supplier',
      'Suppliers',
      supplier.id,
      `Deactivated supplier: ${supplier.name}`,
      req.ip
    );

    res.json({
      success: true,
      message: 'Supplier deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete supplier',
      error: error.message
    });
  }
};
