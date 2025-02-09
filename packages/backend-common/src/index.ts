import "dotenv/config";

const JWT_SECRET: string = process.env.JWT_SECRET ?? "super secret";

export { JWT_SECRET };
