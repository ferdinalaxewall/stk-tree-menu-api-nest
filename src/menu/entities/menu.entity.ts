import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity('menus')
export class Menu {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    parentId: string | null;

    @Column()
    name: string;

    @Column()
    slug: string;

    @Column({ default: 1 })
    depth: number;

    @Column({ default: 0 })
    order: number;

    @ManyToOne(() => Menu, (menu) => menu.children, {onDelete: 'CASCADE'})
    parent: Menu;

    @OneToMany(() => Menu, (menu) => menu.parent)
    children: Menu[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
