import { VercelApiHandler } from './types';

const listener: VercelApiHandler = async (req, res) => {
  res.status(200);
  res.send('hello:RANDOMNESS_PLACEHOLDER');
};

export default listener;
