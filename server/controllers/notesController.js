const Note = require('../models/Note');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const pdf = require('pdf-parse');
require('dotenv').config();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (['application/pdf', 'text/plain'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and TXT files are allowed'));
    }
  }
});


const HUGGING_FACE_API_URL =
  'https://api-inference.huggingface.co/models/facebook/bart-large-cnn';
const HUGGING_FACE_TOKEN = process.env.HUGGING_FACE_TOKEN;

if (!HUGGING_FACE_TOKEN) {
  console.warn(
    '⚠️ Warning: HUGGING_FACE_TOKEN not found in .env. Summarization may fail.'
  );
}

const summarizeWithBART = async (text) => {
  try {
    const maxLength = 1024;
    const chunks = [];

    if (text.length > maxLength) {
      for (let i = 0; i < text.length; i += maxLength) {
        chunks.push(text.slice(i, i + maxLength));
      }
    } else {
      chunks.push(text);
    }

    const summaries = [];

    for (const chunk of chunks) {
      const response = await axios.post(
        HUGGING_FACE_API_URL,
        { inputs: chunk },
        {
          headers: {
            Authorization: `Bearer ${HUGGING_FACE_TOKEN}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000, // 60s timeout
        }
      );

      if (Array.isArray(response.data) && response.data[0]?.summary_text) {
        summaries.push(response.data[0].summary_text);
      } else if (response.data?.summary_text) {
        summaries.push(response.data.summary_text);
      } else {
        console.warn('Unexpected BART response:', response.data);
      }
    }

    if (summaries.length === 0) {
      throw new Error('BART returned no summaries');
    }

    return summaries.join(' ');
  } catch (error) {
    console.error('🧠 BART API Error:', error.response?.data || error.message);
    throw new Error('Failed to generate summary with BART model');
  }
};


const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text || '';
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.userId }).sort({
      createdAt: -1,
    });
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Error fetching notes' });
  }
};

const createNote = async (req, res) => {
  try {
    const { title, tags, originalText } = req.body;

    const summary = await summarizeWithBART(originalText);

    const note = new Note({
      user: req.user.userId,
      title,
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
      originalText,
      summary,
    });

    await note.save();
    res.status(201).json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ message: error.message || 'Error creating note' });
  }
};

const summarizeContent = async (req, res) => {
  try {
    const { title, tags, textContent } = req.body;
    let extractedText = textContent;

    if (req.file) {
      const filePath = req.file.path;

      if (req.file.mimetype === 'application/pdf') {
        extractedText = await extractTextFromPDF(filePath);
      } else if (req.file.mimetype === 'text/plain') {
        extractedText = fs.readFileSync(filePath, 'utf-8');
      }

      fs.unlinkSync(filePath);
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ message: 'No text content found' });
    }

    const summary = await summarizeWithBART(extractedText);

    const note = new Note({
      user: req.user.userId,
      title: title || 'Untitled Note',
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
      originalText: extractedText,
      summary,
    });

    await note.save();

    res.json({
      message: 'Summary generated successfully',
      summary,
      noteId: note._id,
      preview: extractedText.substring(0, 200) + '...',
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({
      message: error.message || 'Error generating summary',
    });
  }
};

const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Note.findOneAndUpdate(
      { _id: id, user: req.user.userId },
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Note not found' });

    res.json(updated);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ message: 'Error updating note' });
  }
};

const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Note.findOneAndDelete({
      _id: id,
      user: req.user.userId,
    });

    if (!deleted) return res.status(404).json({ message: 'Note not found' });

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Error deleting note' });
  }
};

module.exports = {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  summarizeContent,
  upload,
};
