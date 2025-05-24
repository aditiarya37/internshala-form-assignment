const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authenticateToken = require('../middleware/authenticateToken'); 

const applicationValidationRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('addressLine1').trim().notEmpty().withMessage('Address Line 1 is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('zipcode').trim().notEmpty().withMessage('Zipcode is required'),
  body('isStudying').isBoolean().withMessage('isStudying must be true or false'),
  body('studyingAt').custom((value, { req }) => {
    if (req.body.isStudying === true && (!value || String(value).trim() === '')) {
      throw new Error('studyingAt is required if isStudying is true');
    }
    return true;
  }),
  body('projects').optional({ checkFalsy: true }).isArray().withMessage('Projects must be an array or null/undefined'),
  body('projects.*.name')
    .if(body('projects').exists({ checkFalsy: false }).isArray({ min: 1 }))
    .trim().notEmpty().withMessage('Project name is required'),
  body('projects.*.description')
    .if(body('projects').exists({ checkFalsy: false }).isArray({ min: 1 }))
    .trim().notEmpty().withMessage('Project description is required'),
];

router.post(
  '/',
  authenticateToken,
  applicationValidationRules,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id: applicationIdFromRequest, ...dataFromRequest } = req.body;
      const loggedInUserId = req.user.userId; 

      if (!loggedInUserId) {
        return res.status(401).json({ message: "Unauthorized: User ID not available for operation." });
      }

      const applicationPayload = {
        name: dataFromRequest.name,
        email: dataFromRequest.email,
        addressLine1: dataFromRequest.addressLine1,
        addressLine2: dataFromRequest.addressLine2 || null,
        city: dataFromRequest.city,
        state: dataFromRequest.state,
        zipcode: dataFromRequest.zipcode,
        isStudying: dataFromRequest.isStudying,
        studyingAt: dataFromRequest.isStudying ? (dataFromRequest.studyingAt || null) : null,
        projects: dataFromRequest.projects || [], 
        userId: loggedInUserId,
      };
      
      let application;

      if (applicationIdFromRequest) {
        const existingApplication = await prisma.application.findUnique({
          where: { id: String(applicationIdFromRequest) },
        });

        if (!existingApplication) {
          return res.status(404).json({ error: `Application with ID ${applicationIdFromRequest} not found.` });
        }
        if (existingApplication.userId !== loggedInUserId) {
          return res.status(403).json({ error: "Forbidden: You can only update your own applications." });
        }

        application = await prisma.application.update({
          where: { id: String(applicationIdFromRequest) },
          data: applicationPayload,
        });
        return res.status(200).json(application);
      } else {
        application = await prisma.application.create({
          data: applicationPayload,
        });
        return res.status(201).json(application);
      }
    } catch (error) {
      console.error('Error saving application/draft:', error);
      if (error.code === 'P2025' && req.body.id) {
        return res.status(404).json({ error: `Application with ID ${req.body.id} not found for update.` });
      }
      res.status(500).json({ error: 'Failed to save application/draft', details: error.message });
    }
  }
);

router.get('/', authenticateToken, async (req, res) => {
  try {
    const loggedInUserId = req.user.userId;
    if (!loggedInUserId) {
      return res.status(401).json({ message: "Unauthorized: User ID not available." });
    }

    const applications = await prisma.application.findMany({
      where: {
        userId: loggedInUserId,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(applications);
  } catch (error) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications', details: error.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id: applicationId } = req.params;
    const loggedInUserId = req.user.userId;

    if (!loggedInUserId) {
      return res.status(401).json({ message: "Unauthorized: User ID not available." });
    }

    const application = await prisma.application.findUnique({
      where: { id: String(applicationId) },
    });

    if (!application) {
      return res.status(404).json({ error: `Application with ID ${applicationId} not found.` });
    }

    if (application.userId !== loggedInUserId) {
      return res.status(403).json({ error: "Forbidden: You can only view your own applications." });
    }
    res.json(application);
  } catch (error) {
    console.error('Error fetching single application:', error);
    res.status(500).json({ error: 'Failed to fetch application', details: error.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id: applicationId } = req.params;
    const loggedInUserId = req.user.userId;

    if (!loggedInUserId) {
      return res.status(401).json({ message: "Unauthorized: User ID not available." });
    }

    const applicationToDelete = await prisma.application.findUnique({
        where: { id: String(applicationId) }
    });

    if (!applicationToDelete) {
        return res.status(404).json({ error: `Application with ID ${applicationId} not found.` });
    }
    if (applicationToDelete.userId !== loggedInUserId) {
        return res.status(403).json({ error: "Forbidden: You can only delete your own applications." });
    }

    await prisma.application.delete({
      where: { id: String(applicationId) },
    });
    res.status(200).json({ message: `Application with ID ${applicationId} deleted successfully.` });
  } catch (error) {
    console.error('Error deleting application:', error);
    if (error.code === 'P2025') {
        return res.status(404).json({ error: `Application with ID ${req.params.id} not found for deletion.` });
    }
    res.status(500).json({ error: 'Failed to delete application', details: error.message });
  }
});

module.exports = router;