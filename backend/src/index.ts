import colors from 'colors'
import server from './server';

const port = process.env.BACKEND_PORT || 3000;

server.listen(port, () => {
  console.log(colors.blue.bold('Server is running on port:'), port);
});