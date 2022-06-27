export const authMiddleware = (req, res, next) => {
  console.log(req.method);
  console.log(req.path);
  console.log(req.body);
  next();
}