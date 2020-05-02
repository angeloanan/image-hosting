import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Image {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ length: 32 })
  filename!: string

  @Column({ length: 32 })
  urlpath!: string
}
