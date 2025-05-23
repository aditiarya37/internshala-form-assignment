// routes/applications.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Validation rules (these will apply to both drafts and final submissions)
// You might want to make some fields optional for drafts if needed,
// but for now, let's keep them. The frontend will send what it has.
const applicationValidationRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('addressLine1').trim().notEmpty().withMessage('Address Line 1 is required'),
  // addressLine2 is optional, no specific rule needed unless you want to enforce string etc.
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('zipcode').trim().notEmpty().withMessage('Zipcode is required'), // Add .isLength({ min: 5, max: 6 }) if desired
  
  // Ensure isStudying is explicitly true or false if present, or allow it to be initially null from frontend
  // The frontend sends `false` by default, so `isBoolean` should work.
  body('isStudying').isBoolean().withMessage('isStudying must be true or false'),
  
  body('studyingAt').custom((value, { req }) => {
    if (req.body.isStudying === true && (!value || value.trim() === '')) {
      throw new Error('studyingAt is required if isStudying is true');
    }
    return true;
  }),
  // Allow projects to be an empty array for initial drafts
  body('projects').optional().isArray().withMessage('Projects must be an array'),
  body('projects.*.name').if(body('projects').exists({checkFalsy: false})).notEmpty().withMessage('Project name is required'),
  body('projects.*.description').if(body('projects').exists({checkFalsy: false})).notEmpty().withMessage('Project description is required'),
];

// POST /api/applications (Handles CREATE and UPDATE/DRAFT saves)
router.post(
  '/', // This will be the endpoint for both draft and final saves
  applicationValidationRules,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id, ...dataToSave } = req.body; // Prisma uses 'id', not '_id' by default
                                            // If your Prisma model explicitly uses _id, adjust this.

      let application;

      if (id) {
        // If an ID is provided, attempt to update
        application = await prisma.application.update({
          where: { id: String(id) }, // Ensure ID is a string if it's a CUID/UUID
          data: {
            name: dataToSave.name,
            email: dataToSave.email,
            addressLine1: dataToSave.addressLine1,
            addressLine2: dataToSave.addressLine2,
            city: dataToSave.city,
            state: dataToSave.state,
            zipcode: dataToSave.zipcode,
            isStudying: dataToSave.isStudying,
            studyingAt: dataToSave.studyingAt,
            // For projects, Prisma's default update behavior for nested relations can be tricky.
            // A simple update like this will replace the entire projects array.
            // If you need more granular updates (add one, remove one), it's more complex.
            // For a full form data update/draft, replacing the array is often acceptable.
            projects: {
                // If projects are separate models linked by a relation,
                // you might need to delete existing and create new ones, or use nested writes.
                // Assuming a simple JSON array field or a relation where replacing is okay.
                // If 'projects' is a JSON type in Prisma:
                set: dataToSave.projects || [],
                // If 'projects' is a related model, you'd use nested writes, e.g.,
                // deleteMany: {}, // Delete old projects
                // create: dataToSave.projects.map(p => ({ name: p.name, description: p.description })) // Create new
            },
          },
        });
        res.status(200).json(application); // OK for update
      } else {
        // No ID provided, create a new application
        application = await prisma.application.create({
          data: {
            name: dataToSave.name,
            email: dataToSave.email,
            addressLine1: dataToSave.addressLine1,
            addressLine2: dataToSave.addressLine2,
            city: dataToSave.city,
            state: dataToSave.state,
            zipcode: dataToSave.zipcode,
            isStudying: dataToSave.isStudying,
            studyingAt: dataToSave.studyingAt,
            // If 'projects' is a JSON type in Prisma:
            projects: dataToSave.projects || [],
            // If 'projects' is a related model:
            // projects: {
            //   create: dataToSave.projects.map(p => ({ name: p.name, description: p.description }))
            // },
          },
        });
        res.status(201).json(application); // Created
      }
    } catch (error) {
      console.error('Error saving application/draft:', error);
      if (error.code === 'P2025' && id) { // Prisma error code for "Record to update not found"
        return res.status(404).json({ error: `Application with ID ${id} not found for update.` });
      }
      res.status(500).json({ error: 'Failed to save application/draft' });
    }
  }
);

module.exports = router;