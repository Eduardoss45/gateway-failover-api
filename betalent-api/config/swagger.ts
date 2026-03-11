export default {
  path: process.cwd() + '/',
  info: {
    title: 'BeTalent API',
    version: '1.0.0',
    description: 'API REST para pagamentos multi-gateway',
  },
  tagIndex: 1,
  productionEnv: 'production',
  snakeCase: true,
  debug: false,
  ignore: ['/swagger', '/docs', '/health'],
  preferredPutPatch: 'PUT',
  common: {
    parameters: {},
    headers: {},
  },
  securitySchemes: {
    BearerAuth: {
      type: 'http',
      scheme: 'bearer',
    },
  },
  authMiddlewares: ['auth', 'auth:api'],
  defaultSecurityScheme: 'BearerAuth',
  persistAuthorization: true,
  showFullPath: false,
}