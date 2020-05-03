import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Image {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ length: 50 })
  filename!: string

  @Column({ length: 32, nullable: true })
  urlpath!: string
}
