'use strict';
const Issue = require('../models/Issue');

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(async function (req, res) {
      const project = req.params.project;
      const filter = { project, ...req.query };

      try {
        const issues = await Issue.find(filter).select('-__v');
        res.json(issues);
      } catch (err) {
        res.status(500).json({ error: 'could not fetch issues' });
      }
    })

    .post(async function (req, res) {
      const project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

      // Vérification des champs requis
      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      try {
        // Création de l'issue avec des valeurs par défaut pour les champs optionnels
        const issue = new Issue({
          project,
          issue_title,
          issue_text,
          created_by,
          assigned_to: assigned_to || '', // Valeur par défaut pour assigned_to
          status_text: status_text || '', // Valeur par défaut pour status_text
        });

        const saved = await issue.save();

        // Retourner l'objet créé avec tous les champs (y compris created_on, updated_on, etc.)
        res.json({
          _id: saved._id,
          issue_title: saved.issue_title,
          issue_text: saved.issue_text,
          created_by: saved.created_by,
          assigned_to: saved.assigned_to,
          status_text: saved.status_text,
          created_on: saved.created_on,
          updated_on: saved.updated_on,
          open: saved.open
        });
      } catch (err) {
        res.status(500).json({ error: 'could not create issue' });
      }
    })

    .put(async function (req, res) {
      const { _id, ...fields } = req.body;
      if (!_id) return res.json({ error: 'missing _id' });

      const updates = Object.fromEntries(
        Object.entries(fields).filter(([_, v]) => v !== '' && v !== undefined)
      );

      if (Object.keys(updates).length === 0) {
        return res.json({ error: 'no update field(s) sent', _id });
      }

      try {
        updates.updated_on = new Date();
        const updated = await Issue.findByIdAndUpdate(_id, updates, { new: true });
        if (!updated) return res.json({ error: 'could not update', _id });
        res.json({ result: 'successfully updated', _id });
      } catch (err) {
        res.json({ error: 'could not update', _id });
      }
    })

    .delete(async function (req, res) {
      const { _id } = req.body;
      if (!_id) return res.json({ error: 'missing _id' });

      try {
        const deleted = await Issue.findByIdAndDelete(_id);
        if (!deleted) return res.json({ error: 'could not delete', _id });
        res.json({ result: 'successfully deleted', _id });
      } catch (err) {
        res.json({ error: 'could not delete', _id });
      }
    });
};
