import * as bcrypt from 'bcrypt';

export async function hashData(data: string | Buffer) {
  const salt = await bcrypt.genSalt();
  return await bcrypt.hash(data, salt);
}

export async function compareHashedData(data: string, hashedData: string) {
  return await bcrypt.compare(data, hashedData);
}
