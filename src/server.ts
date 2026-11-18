import { createApp } from './app.ts';
import { config } from './config.ts';

createApp().listen(config.port, () => {
  console.log(`API escuchando en http://localhost:${config.port}`);
});
