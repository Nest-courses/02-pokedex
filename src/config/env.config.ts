export const EnvConfiguration = () => ({
  enviroment: process.env.NODE_ENV,
  mongoDB: process.env.MONGODB,
  port: parseInt(process.env.PORT),
  defaultLimit: parseInt(process.env.DEFAULT_LIMIT),
});
