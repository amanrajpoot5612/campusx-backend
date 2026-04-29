// Basic keyword-based classifier for complaint categories
// Can be upgraded to ML model later

const categoryKeywords = {
  'IT': ['wifi', 'internet', 'computer', 'laptop', 'software', 'network', 'email', 'login', 'password', 'portal'],
  'Maintenance': ['water', 'leakage', 'leak', 'pipe', 'bathroom', 'toilet', 'cleaning', 'clean', 'dust', 'garbage'],
  'Electrical': ['electricity', 'light', 'fan', 'power', 'switch', 'socket', 'electric', 'generator', 'backup'],
  'Security': ['security', 'guard', 'gate', 'entry', 'access', 'camera', 'cctv', 'safety', 'theft'],
  'Library': ['book', 'library', 'study', 'reading', 'journal', 'research'],
  'Cafeteria': ['food', 'cafeteria', 'mess', 'meal', 'canteen', 'drink', 'water'],
  'Transport': ['bus', 'transport', 'van', 'parking', 'vehicle', 'travel'],
  'Academic': ['class', 'lecture', 'exam', 'timetable', 'schedule', 'teacher', 'professor', 'course'],
  'Infrastructure': ['building', 'classroom', 'hall', 'furniture', 'desk', 'chair', 'door', 'window', 'roof'],
  'Other': []
};

const classifyComplaint = (text) => {
  const lowerText = text.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return category;
      }
    }
  }
  
  return 'Other';
};

module.exports = classifyComplaint;