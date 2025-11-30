import { createMiddleware } from '@tanstack/react-start';

export const authMiddleware = createMiddleware({}).server(
  ({ next, context }) => {
    console.log('******authMiddleware******');
    console.log(context);

    return next();
  }
);
