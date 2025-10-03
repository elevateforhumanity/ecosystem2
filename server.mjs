import app from './simple-server.js';
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`EFH Autopilot server listening on http://localhost:${PORT}`);
});
