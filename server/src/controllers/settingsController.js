const StoreSetting = require('../models/StoreSetting');
const NavigationMenu = require('../models/NavigationMenu');
const { sendSuccess, sendError } = require('../utils/response');

exports.getPublicSettings = async (req, res) => {
  try {
    const publicKeys = [
      'storeName', 'storeTagline', 'storeLogo', 'primaryColor', 'secondaryColor',
      'contactEmail', 'contactPhone', 'contactAddress', 'currency', 'currencySymbol',
      'shippingCharge', 'freeShippingThreshold', 'taxRate', 'returnWindow',
      'codAvailable', 'maintenanceMode', 'announcementBar', 'socialMedia',
      'seoTitle', 'seoDescription', 'copyrightText'
    ];

    const settings = await StoreSetting.find({ key: { $in: publicKeys } });
    const settingsMap = {};
    settings.forEach(s => { settingsMap[s.key] = s.value; });

    sendSuccess(res, settingsMap);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getAllSettings = async (req, res) => {
  try {
    const settings = await StoreSetting.find();
    const settingsMap = {};
    settings.forEach(s => { settingsMap[s.key] = s.value; });
    sendSuccess(res, { settingsList: settings, settingsMap });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const settingsData = req.body; // { key: value, key2: value2 }

    const operations = Object.entries(settingsData).map(([key, value]) => ({
      updateOne: {
        filter: { key },
        update: { $set: { key, value } },
        upsert: true
      }
    }));

    if (operations.length > 0) {
      await StoreSetting.bulkWrite(operations);
    }

    sendSuccess(res, null, 'Settings updated successfully');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

// Navigation
exports.getNavigation = async (req, res) => {
  try {
    const menus = await NavigationMenu.find({ isActive: true });
    const menuMap = {};
    menus.forEach(m => { menuMap[m.location] = m.items; });
    sendSuccess(res, menuMap);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.adminGetNavigation = async (req, res) => {
  try {
    const menus = await NavigationMenu.find();
    sendSuccess(res, menus);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.updateNavigation = async (req, res) => {
  try {
    const { location, items, name } = req.body;
    if (!location) return sendError(res, 'Location is required');

    const menu = await NavigationMenu.findOneAndUpdate(
      { location },
      { $set: { location, items: items || [], name: name || location } },
      { upsert: true, new: true }
    );

    sendSuccess(res, menu, 'Navigation updated');
  } catch (err) {
    sendError(res, err.message, 500);
  }
};
