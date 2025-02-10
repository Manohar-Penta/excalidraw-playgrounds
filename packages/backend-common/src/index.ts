import "dotenv/config";

const JWT_SECRET: string = process.env.JWT_SECRET as string;

export { JWT_SECRET };
