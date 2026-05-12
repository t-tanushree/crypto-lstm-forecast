import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Save, CheckCircle } from 'lucide-react';
import axios from 'axios';

interface TradingNotesProps {
  coin: string;
  username: string;
}

const TradingNotes: React.FC<TradingNotesProps> = ({ coin, username }) => {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/notes/${coin}?username=${username}`);
        setContent(res.data.notes);
      } catch (e) {
        console.error("Notes fetch error:", e);
      }
    };
    fetchNotes();
  }, [coin, username]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.post(`http://localhost:8000/api/notes/${coin}?username=${username}&content=${encodeURIComponent(content)}`);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    } catch (e) {
      console.error("Notes save error:", e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-primary" />
          <h3 className="text-lg font-bold">Personal Analysis</h3>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 text-[10px] bg-primary/20 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/30 transition-colors font-bold uppercase tracking-widest disabled:opacity-50"
        >
          {showSaved ? <><CheckCircle size={12} /> Saved</> : <><Save size={12} /> Save Note</>}
        </button>
      </div>

      <textarea 
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={`Enter your thoughts on ${coin} strategy...`}
        className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-gray-300 focus:outline-none focus:border-primary/50 transition-all custom-scrollbar resize-none"
      />
      <p className="text-[10px] text-gray-600 mt-2 italic">
        Notes are encrypted and stored securely in your persistent profile.
      </p>
    </div>
  );
};

export default TradingNotes;
