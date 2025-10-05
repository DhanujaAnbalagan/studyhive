const express = require('express');
const { 
  getNotes, 
  createNote, 
  updateNote, 
  deleteNote, 
  summarizeContent,
  upload 
} = require('../controllers/notesController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);
router.get('/', getNotes);
router.post('/', createNote);
router.post('/summarize', upload.single('file'), summarizeContent);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;