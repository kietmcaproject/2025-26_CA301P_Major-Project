export const requestLogger = (req, res, next) => {
  console.log('\n=== Incoming Request ===');
  console.log('Time:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('======================\n');
  next();
};