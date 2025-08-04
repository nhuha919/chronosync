export const generateToken = (user) =>
    jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  