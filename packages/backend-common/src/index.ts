import "dotenv/config";

// console.log(process.env);
const JWT_SECRET = process.env.JWT_SECRET as string;

export { JWT_SECRET };
