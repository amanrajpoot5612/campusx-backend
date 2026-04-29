const { server, initializeDatabase } = require('./app');
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await initializeDatabase();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
})();
