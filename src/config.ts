const DEV_TOKEN_SECRET = 'secreto-solo-para-desarrollo-local-no-usar';

function readTokenSecret(): string {
  const secret = process.env.TOKEN_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Falta la variable de entorno TOKEN_SECRET');
  }
  return DEV_TOKEN_SECRET;
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  tokenSecret: readTokenSecret(),
  tokenTtlMinutes: Number(process.env.TOKEN_TTL_MINUTES ?? 60),
};
