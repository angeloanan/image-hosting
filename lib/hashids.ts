import Hashids from 'hashids'
require('dotenv').config()

const hashids = new Hashids(process.env.SALT, 8)

export const encode = (num: number): string => {
  return hashids.encode(num)
}

export const decode = (str: string): Array<number | bigint> => {
  return hashids.decode(str)
}
