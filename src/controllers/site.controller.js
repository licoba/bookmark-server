const Site = require("../models/site.model");

exports.getAllSites = async (req, res) => {
  try {
    const sites = await Site.findAll();
    res.json(sites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSite = async (req, res) => {
  try {
    const newSite = await Site.create(req.body);
    res.status(201).json(newSite);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getSitesByCategory = async (req, res) => {
  try {
    const sites = await Site.findAll({
      where: {
        category: req.params.category,
      },
    });
    res.json(sites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
