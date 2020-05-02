import Hashids from 'hashids'
require('dotenv').config()

const salt = process.env.SALT
const hashids = new Hashids(salt)

export const encode = (num: number): string => {
  return hashids.encode(num)
}

export const decode = (str: string): Array<number | bigint> => {
  return hashids.decode(str)
}
