const Customer = require('../models/Customer');
const { logActivity } = require('../utils/activityLogger');
const { generateCustomerId } = require('../utils/generateNumber');

exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: customers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers',
      error: error.message
    });
  }
};

exports.getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer',
      error: error.message
    });
  }
};

exports.createCustomer = async (req, res) => {
  try {
    const count = await Customer.count();
    const customerId = generateCustomerId(count);

    const customer = await Customer.create({
      ...req.body,
      customer_id: customerId
    });

    await logActivity(
      req.user.id,
      'Create Customer',
      'Customers',
      customer.id,
      `Created customer: ${customer.name}`,
      req.ip
    );

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create customer',
      error: error.message
    });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    await customer.update(req.body);

    await logActivity(
      req.user.id,
      'Update Customer',
      'Customers',
      customer.id,
      `Updated customer: ${customer.name}`,
      req.ip
    );

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update customer',
      error: error.message
    });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    await customer.update({ status: 'inactive' });

    await logActivity(
      req.user.id,
      'Delete Customer',
      'Customers',
      customer.id,
      `Deactivated customer: ${customer.name}`,
      req.ip
    );

    res.json({
      success: true,
      message: 'Customer deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete customer',
      error: error.message
    });
  }
};
